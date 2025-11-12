/**
 * Component สำหรับแสดงแผนที่ Mapbox พร้อม markers ของวัตถุที่ตรวจจับได้
 * คลิก marker เพื่อแสดงรายละเอียดใน popup
 */

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Box, IconButton } from "@mui/material";
import { Icon } from "@iconify/react";
import { type DetectedObject } from "../types/detection";
import DetectionPopup from "./DetectionPopup";
import "mapbox-gl/dist/mapbox-gl.css";

// โหลด Iconify สำหรับใช้ dynamic icons
if (typeof window !== "undefined") {
  const script = document.createElement("script");
  script.src = "https://code.iconify.design/3/3.1.0/iconify.min.js";
  if (!document.querySelector('script[src*="iconify"]')) {
    document.head.appendChild(script);
  }
}

// จุดกล้องเริ่มต้นสองฝั่ง
const LOCATIONS = {
  defense: { lng: 101.166279, lat: 14.297567 },
  offense: { lng: 101.171298, lat: 14.286451 },
};

interface MapComponentProps {
  objects: DetectedObject[];
  imagePath?: string;
  cameraLocation?: string;
}

const MapComponent = ({
  objects,
  imagePath,
  cameraLocation,
}: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const selectedMarkerRef = useRef<HTMLDivElement | null>(null);

  const [selectedObject, setSelectedObject] = useState<DetectedObject | null>(null);
  const [cardPosition, setCardPosition] = useState<{ x: number; y: number } | null>(null);

  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

  // หาจุดศูนย์กลางแผนที่
  const getMapCenter = () => {
    if (cameraLocation === "defense") return [LOCATIONS.defense.lng, LOCATIONS.defense.lat];
    if (cameraLocation === "offense") return [LOCATIONS.offense.lng, LOCATIONS.offense.lat];
    return [101.166279, 14.297567];
  };

  // ✅ ฟังก์ชันเลือก icon ตามประเภท
  const getIconName = (type: string): string => {
    const lower = type.toLowerCase();
    if (lower === "tank") return "mdi:castle"; // 🟢 ใช้หมุดแทน
    if (lower === "drone") return "healthicons:drone"; // 🔴 ใช้โดรนเหมือนเดิม
    return "mdi:map-marker";
  };

  // ✅ กำหนดสีประจำประเภท
  const getColorForType = (type: string): string => {
    const lower = type.toLowerCase();
    if (lower === "tank") return "#2e7d32";  // เขียว
    if (lower === "drone") return "#f44336"; // แดง
    return "#2196f3";
  };

  const handleClose = () => {
    setSelectedObject(null);
    setCardPosition(null);
    selectedMarkerRef.current = null;
  };

  // --- สร้างแผนที่ ---
  useEffect(() => {
    if (!mapContainer.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: getMapCenter() as [number, number],
      zoom: 17,
    });
    return () => map.current?.remove();
  }, []);

  // --- เปลี่ยนมุมมองเมื่อ cameraLocation เปลี่ยน ---
  useEffect(() => {
    if (map.current && cameraLocation) {
      map.current.flyTo({
        center: getMapCenter() as [number, number],
        zoom: 17,
        duration: 1000,
      });
    }
  }, [cameraLocation]);

  // --- วาด markers ---
  useEffect(() => {
    if (!map.current) return;

    // ลบของเก่า
    markers.current.forEach((m) => m.remove());
    markers.current = [];

    if (objects.length === 0) return;

    objects.forEach((obj) => {
      const color = getColorForType(obj.type);
      const iconName = getIconName(obj.type);

      // ✅ radius (center ใหญ่กว่า)
      const pulseRadius = obj.radius ?? (obj.type.toLowerCase() === "tank" ? 30 : 10);

      // สร้างวง pulse รอบ marker
      const pulseCircle = document.createElement("div");
      pulseCircle.style.cssText = `
        position: absolute;
        width: ${pulseRadius * 2}px;
        height: ${pulseRadius * 2}px;
        border-radius: 50%;
        background-color: ${color};
        opacity: 0.4;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: pulse 2s ease-out infinite;
        pointer-events: none;
      `;

      // marker container
      const el = document.createElement("div");
      el.style.cssText = `
        position: relative;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      const iconContainer = document.createElement("div");
      iconContainer.style.cssText = `
        cursor: pointer;
        width: 40px;
        height: 40px;
        background: white;
        border-radius: 50%;
        border: 3px solid ${color};
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      const iconElement = document.createElement("span");
      iconElement.className = "iconify";
      iconElement.setAttribute("data-icon", iconName);
      iconElement.style.cssText = `
        color: ${color};
        font-size: 26px;
      `;

      iconContainer.appendChild(iconElement);
      el.appendChild(pulseCircle);
      el.appendChild(iconContainer);

      // คลิก marker
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedObject(obj);
        selectedMarkerRef.current = el;
        const rect = el.getBoundingClientRect();
        setCardPosition({
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
      });

      const lat = Number(obj.lat);
      const lng = Number(obj.lng);
      const marker = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map.current!);
      markers.current.push(marker);
    });
  }, [objects, imagePath]);

  // --- อัปเดต popup card ---
  useEffect(() => {
    if (!map.current || !selectedMarkerRef.current) return;
    const updateCardPosition = () => {
      if (selectedMarkerRef.current) {
        const rect = selectedMarkerRef.current.getBoundingClientRect();
        setCardPosition({
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
      }
    };
    map.current.on("move", updateCardPosition);
    map.current.on("zoom", updateCardPosition);
    return () => {
      map.current?.off("move", updateCardPosition);
      map.current?.off("zoom", updateCardPosition);
    };
  }, [selectedObject]);

  return (
    <Box sx={{ position: "relative", height: "100%", width: "100%" }}>
      {/* Pulse animation CSS */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.4; }
            100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
          }
        `}
      </style>

      {/* แผนที่ */}
      <Box
        ref={mapContainer}
        sx={{
          height: "100%",
          width: "100%",
          borderRadius: 1,
          overflow: "hidden",
        }}
      />

      {/* Popup รายละเอียด */}
      {selectedObject && cardPosition && (
        <Box
          sx={{
            position: "fixed",
            left: cardPosition.x,
            top: cardPosition.y,
            transform: "translate(-50%, -100%)",
            zIndex: 9999,
            mb: 1,
          }}
        >
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              zIndex: 1,
              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.8)" },
            }}
          >
            <Icon icon="mdi:close" width={16} />
          </IconButton>

          <DetectionPopup object={selectedObject} imagePath={imagePath} />
        </Box>
      )}
    </Box>
  );
};

export default MapComponent;
