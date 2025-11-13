// src/services/camInboxService.ts
import type { DefenseEvent } from "../App";

/**
 * Type guard: เช็คว่า object หนึ่ง ๆ เป็น DefenseEvent จริง ๆ หรือเปล่า
 */
function isDefenseEvent(obj: any): obj is DefenseEvent {
  if (typeof obj !== "object" || obj === null) return false;

  const hasCoreFields =
    typeof obj.id === "number" &&
    typeof obj.objId === "string" &&
    typeof obj.type === "string" &&
    typeof obj.lat === "number" &&
    typeof obj.lng === "number" &&
    typeof obj.timestamp === "string";

  if (!hasCoreFields) return false;

  // optional fields ถ้ามีก็ขอให้ type ตรง
  if ("alt" in obj && typeof obj.alt !== "number") return false;
  if ("direction" in obj && !Array.isArray(obj.direction)) return false;
  if ("velocity" in obj && typeof obj.velocity !== "number") return false;
  if ("acceleration" in obj && typeof obj.acceleration !== "number") return false;
  if ("image" in obj && typeof obj.image !== "string") return false;

  return true;
}

/**
 * ดึงข้อมูลจาก /inbox/cam_01:
 *  - ใช้ index.json เพื่อรู้รายชื่อไฟล์
 *  - โหลดไฟล์ JSON ทีละไฟล์
 *  - รองรับไฟล์ที่เป็น object เดียว หรือ array ของ object
 *  - Filter เฉพาะอันที่เป็น DefenseEvent
 */
export async function fetchCam01Events(): Promise<DefenseEvent[]> {
  const allEvents: DefenseEvent[] = [];

  // กัน cache เวลาไฟล์อัปเดตบ่อย
  const cacheBust = `?_=${Date.now()}`;

  // 1) โหลด index.json ที่เก็บรายชื่อไฟล์
  const indexRes = await fetch(`/inbox/cam_01/index.json${cacheBust}`);
  if (!indexRes.ok) {
    throw new Error(`Failed to load index.json: HTTP ${indexRes.status}`);
  }

  const fileList: string[] = await indexRes.json();

  // 2) อ่านทีละไฟล์
  for (const fileName of fileList) {
    try {
      const res = await fetch(`/inbox/cam_01/${fileName}${cacheBust}`);
      if (!res.ok) {
        console.warn(`Cannot load ${fileName}: HTTP ${res.status}`);
        continue;
      }

      const jsonData = await res.json();

      if (Array.isArray(jsonData)) {
        // กรณีไฟล์เป็น array ของ payload
        for (const item of jsonData) {
          if (isDefenseEvent(item)) {
            allEvents.push(item);
          } else {
            console.warn("Skip invalid event in", fileName, item);
          }
        }
      } else {
        // กรณีไฟล์เป็น object เดียว
        if (isDefenseEvent(jsonData)) {
          allEvents.push(jsonData);
        } else {
          console.warn("Skip invalid event object in", fileName, jsonData);
        }
      }
    } catch (err) {
      console.error(`Error reading ${fileName}:`, err);
    }
  }

  return allEvents;
}
