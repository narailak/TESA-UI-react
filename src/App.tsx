// src/App.tsx
import React, { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import { io, Socket } from "socket.io-client";

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
  timestamp: string;   // e.g. "15:06:08"
  altitude?: number;   // optional (meters)
  speed?: number;      // optional (m/s)
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

// 👉 แก้ IP/port ให้ตรงกับ new_server.py
const socket: Socket = io("http://192.168.50.172:3000", {
  transports: ["websocket"],
});

// ================== APP ==================
function App() {
  const [defenseEvents, setDefenseEvents] = useState<DefenseEvent[]>([]);

  // Offense ใส่ static ไว้ก่อนเหมือนเดิม
  const [offenseEvents] = useState<OffenseEvent[]>([
    { id: 1, lat: 14.297600, lng: 101.166300, timestamp: "15:06:08", altitude: 120.5, speed: 14.3 },
    { id: 2, lat: 14.298120, lng: 101.165980, timestamp: "15:07:12", altitude: 110.0, speed: 9.8 },
    { id: 3, lat: 14.296950, lng: 101.166750, timestamp: "15:08:21", speed: 11.9 },
    { id: 4, lat: 14.297220, lng: 101.167100, timestamp: "15:09:44", altitude: 95.0 },
    { id: 5, lat: 14.297880, lng: 101.166010, timestamp: "15:10:03", altitude: 110.2, speed: 12.7 },
  ]);

  const [importantLocation, setImportantLocation] =
    useState<ImportantLocation>(DEFAULT_IMPORTANT_LOCATION);

  useEffect(() => {
    // connect + join room cam_01
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join", { role: "web", cam_id: "cam_01" });
    });

    socket.on("joined", (msg) => {
      console.log("Joined room:", msg);
    });

    // ⭐ ฟัง event 'defense' ที่ server ส่งมา
    socket.on("defense", (payload: DefenseEvent[] | DefenseEvent) => {
      console.log("DEFENSE payload:", payload);

      const eventsArray: DefenseEvent[] = Array.isArray(payload)
        ? payload
        : [payload];

      // จะเลือก strategy ยังไงก็ได้:
      // 1) แทนที่ทั้งหมดด้วย snapshot ล่าสุด
      setDefenseEvents(eventsArray);

      // 2) หรือถ้าอยาก append/merge ลองแบบนี้แทน:
      // setDefenseEvents((prev) => {
      //   const merged = [...eventsArray];
      //   for (const old of prev) {
      //     if (!merged.find((e) => e.objId === old.objId)) {
      //       merged.push(old);
      //     }
      //   }
      //   return merged;
      // });
    });

    // (ถ้ายังใช้ meta/pack จาก server ตัวเก่าอยู่ จะฟังเพิ่มก็ได้)
    // socket.on("meta", (payload: any) => { ... });
    // socket.on("pack", (payload: any) => { ... });

    return () => {
      socket.off("connect");
      socket.off("joined");
      socket.off("defense");
      // socket.off("meta");
      // socket.off("pack");
    };
  }, []);

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
