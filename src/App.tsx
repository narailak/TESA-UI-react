// src/App.tsx
import React, { useEffect, useState, useRef } from "react";
import HomePage from "./pages/HomePage";
import { io, Socket } from "socket.io-client";
import mqtt from "mqtt";

// ================== Types ==================
export type DefenseEvent = {
  id: number;              // ใช้เป็น key ใน React list
  objId: string;
  type: string;
  lat: number;
  lng: number;
  alt?: number;            // altitude (meters) - optional
  direction?: number[];    // เวกเตอร์/มุม เช่น [dx, dy, dz] หรือ [headingDegrees]
  velocity?: number;       // ความเร็ว (m/s)
  acceleration?: number;   // ความเร่ง (m/s^2)
  timestamp: string;       // เวลาเป็น string (e.g. "15:06:08")
  image?: string;          // url รูป (optional)
};

export type OffenseEvent = {
  id: number;
  lat: number;
  lng: number;
  timestamp: string;   // "HH:mm:ss"
  altitude?: number;
  speed?: number;
};

export type ImportantLocation = {
  lat: number;
  lng: number;
};

// ================== Config ==================
const DEFAULT_IMPORTANT_LOCATION: ImportantLocation = {
  lat: 14.298527,
  lng: 101.166479,
};

// 👉 เปลี่ยน URL ให้ตรงกับ new_server.py ของคุณ
const socket: Socket = io("http://192.168.50.172:3000", {
  transports: ["websocket"],
});

function App() {
  // ========== STATE ==========

  // ประวัติ DefenseEvent จาก Socket.IO (ใหม่อยู่บนสุด)
  const [defenseEvents, setDefenseEvents] = useState<DefenseEvent[]>([]);

  // ประวัติ OffenseEvent จาก MQTT (ใหม่อยู่บนสุด)
  const [offenseEvents, setOffenseEvents] = useState<OffenseEvent[]>([]);

  // ใช้นับ id ให้ OffenseEvent จาก MQTT
  const idCounter = useRef(1);

  const [importantLocation, setImportantLocation] =
    useState<ImportantLocation>(DEFAULT_IMPORTANT_LOCATION);

  // ========== Socket.IO: ฟัง event 'defense' ==========
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join", { role: "web", cam_id: "cam_01" });
    });

    socket.on("joined", (msg) => {
      console.log("Joined room:", msg);
    });

    // ⭐ ฟัง event 'defense' แล้วเก็บเป็นประวัติ (ใหม่อยู่บนสุด)
    socket.on("defense", (payload: DefenseEvent[] | DefenseEvent) => {
      console.log("DEFENSE payload:", payload);

      const incoming: DefenseEvent[] = Array.isArray(payload)
        ? payload
        : [payload];

      setDefenseEvents((prev) => {
        const merged = [...incoming, ...prev];
        const MAX_HISTORY = 200;
        return merged.slice(0, MAX_HISTORY);
      });
    });

    // cleanup ตอน unmount / HMR
    return () => {
      socket.off("connect");
      socket.off("joined");
      socket.off("defense");
    };
  }, []);

  // ========== MQTT: ฟัง topic สำหรับ Offense ==========
  useEffect(() => {
    // ใช้ broker ตัวเดียวกับโค้ดที่ 2
    const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");

    client.on("connect", () => {
      console.log("✅ MQTT Connected");
      client.subscribe("reai/test", (err) => {
        if (err) console.error("❌ Subscribe error:", err);
        else console.log("📡 Subscribed to reai/test");
      });
    });

    client.on("message", (topic, message) => {
      try {
        const raw = JSON.parse(message.toString());

        const lat = raw.latitude || raw["latitude "] || 0;
        const lng = raw.longitude || raw["longitude"] || 0;
        const altitude =
          raw.altitude || raw["altitude "] || undefined;
        const timestampUnix =
          raw.timestamp || raw["timestamp "] || Date.now() / 1000;

        // 🕒 แปลง Unix → เวลา string (HH:mm:ss)
        const timeStr = new Date(timestampUnix * 1000).toLocaleTimeString(
          "en-GB",
          {
            hour12: false,
            timeZone: "UTC", // ถ้าอยากเป็นเวลาไทยใช้ "Asia/Bangkok"
          }
        );

        const newId = idCounter.current++;

        const newEvent: OffenseEvent = {
          id: newId,
          lat,
          lng,
          timestamp: timeStr,
          altitude,
          // speed: ถ้ามีใน MQTT ค่อย map เพิ่มได้ เช่น raw.speed
        };

        // 📈 ข้อมูลใหม่อยู่บนสุด
        setOffenseEvents((prev) => {
          const updated = [newEvent, ...prev];
          return updated.slice(0, 20); // เก็บล่าสุด 20 รายการพอ
        });

        console.log("📩 New MQTT Data:", newEvent);
      } catch (err) {
        console.error("⚠️ MQTT message parse error:", err);
      }
    });

    // cleanup
    return () => {
      client.end();
    };
  }, []);

  // ========== RENDER ==========
  return (
    <HomePage
      defenseEvents={defenseEvents}
      setDefenseEvents={setDefenseEvents}
      offenseEvents={offenseEvents}
      importantLocation={importantLocation}
      setImportantLocation={setImportantLocation}
    />
  );
}

export default App;
