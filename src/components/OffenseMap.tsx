// src/components/OffenseMap.tsx
import { Box } from "@mui/material";
import MapComponent from "../components/MapComponent";
import type { OffenseEvent, ImportantLocation } from "../App";
import type { DetectedObject } from "../types/detection";

type Props = {
  offenseEvents: OffenseEvent[];
  importantLocation: ImportantLocation;
};

const OffenseMap: React.FC<Props> = ({ offenseEvents, importantLocation }) => {
  // ✅ 1) ปักหมุด "หมุน" (ศูนย์กลาง) จาก ImportantLocation
  const centerPin: DetectedObject = {
    obj_id: "Center",
    type: "tank",                   // ✅ ชนิดเป็น "หมุน" ตามที่ขอ
    lat: importantLocation.lat,
    lng: importantLocation.lng,
    objective: "center",            // ✅ objective: center
    radius: 30,                     // ใหญ่กว่าตัวอื่น (เพื่อเน้น)
  };

  // ✅ 2) ดึง Offense ล่าสุด "ตัวเดียว"
  // สมมติว่า array จัดเรียงโดย "ของใหม่อยู่บนสุด" → ใช้ตัว index 0
  const latest = offenseEvents.length > 0 ? offenseEvents[0] : null;

  const latestDetected: DetectedObject[] = latest
    ? [
        {
          obj_id: `off_${String(latest.id).padStart(3, "0")}`,
          type: "drone",           // ใช้ไอคอน drone เดิมบน MapComponent
          lat: latest.lat,
          lng: latest.lng,
          objective: "center",     // ถ้าต้องการผูกสัมพันธ์กับศูนย์กลาง
          radius: 10,              // ขนาดเล็กกว่าศูนย์กลาง
        },
      ]
    : [];

  // ✅ 3) รวมอ็อบเจกต์ (Center + Offense ล่าสุด)
  const objects: DetectedObject[] = [centerPin, ...latestDetected];

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        m: 0,
        p: 0,
        overflow: "hidden",
        borderRadius: 0,
      }}
    >
      <MapComponent
        objects={objects}
        imagePath="/uploads/sample-offense.jpg"
        cameraLocation="offense"
      />
    </Box>
  );
};

export default OffenseMap;
