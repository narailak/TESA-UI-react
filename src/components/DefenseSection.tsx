// src/components/DefenseSection.tsx
import React, { useState } from "react";
import "./defence-section.css";
import type { DefenseEvent, ImportantLocation } from "../App";
import ImageViewer from "../components/ImageViewer"; // ✅ เพิ่มบรรทัดนี้

type Props = {
  events: DefenseEvent[];
  setEvents: React.Dispatch<React.SetStateAction<DefenseEvent[]>>;
  importantLocation: ImportantLocation;
  setImportantLocation: React.Dispatch<React.SetStateAction<ImportantLocation>>;
};

const FALLBACK_IMG =
  "https://cdn-icons-png.flaticon.com/512/2920/2920233.png";

const DEFAULT_IMPORTANT_LOCATION = { lat: 14.298527, lng: 101.166479 };

const DefenseSection: React.FC<Props> = ({
  events,
  importantLocation,
  setImportantLocation,
}) => {
  const latestImage =
    events.length > 0 ? events[0].image || FALLBACK_IMG : FALLBACK_IMG;

  const [showSettings, setShowSettings] = useState(false);
  const [latInput, setLatInput] = useState(String(importantLocation.lat));
  const [lngInput, setLngInput] = useState(String(importantLocation.lng));

  const handleSave = () => {
    const newLat = parseFloat(latInput) || DEFAULT_IMPORTANT_LOCATION.lat;
    const newLng = parseFloat(lngInput) || DEFAULT_IMPORTANT_LOCATION.lng;
    setImportantLocation({ lat: newLat, lng: newLng });
    setShowSettings(false);
  };

  return (
    <section className="defence-section">
      {/* ===== Name Bar ===== */}
      <div className="name-defence">
        <span>Defence</span>

        {/* ✅ ปุ่มตั้งค่า (ขวาสุด) */}
        <button
          className="gear-btn top-right"
          onClick={() => setShowSettings(!showSettings)}
          title="Set Important Location"
        >
          ⚙️
        </button>
      </div>

      {/* ✅ แผงกรอกค่า lat/lng */}
      {showSettings && (
        <div className="settings-panel">
          <p><strong>Set Important Location</strong></p>
          <div className="settings-row">
            <label>
              Lat: <input value={latInput} onChange={(e) => setLatInput(e.target.value)} />
            </label>
            <label>
              Lng: <input value={lngInput} onChange={(e) => setLngInput(e.target.value)} />
            </label>
            <button onClick={handleSave}>Save</button>
          </div>
        </div>
      )}

      {/* ===== Status Drone ===== */}
      <div className="status-drone">
        <div className="drone-image">
          {/* ⬇️ ใช้ ImageViewer เพื่อคลิกขยาย */}
          <ImageViewer
            src={latestImage}
            alt="Nearest/Latest Drone"
            width={96}
            height={96}
            objectFit="contain"
            rounded
          />
        </div>
        <div className="drone-info">
          <p><strong>Important Point:</strong></p>
          <p><strong>lat:</strong> {importantLocation.lat.toFixed(6)}</p>
          <p><strong>lng:</strong> {importantLocation.lng.toFixed(6)}</p>
        </div>
      </div>

      <div className="video-real">Video - Real</div>

      {/* ===== ภาพจริงล่าสุด (คลิกขยาย) ===== */}
      <div className="img-real">
        <ImageViewer
          src={latestImage}
          alt="Latest Drone Image"
          width="100%"
          height="100%"
          objectFit="cover"
          className="img-real__image"   // ✅ ให้ CSS ควบคุม
          rounded
        />
      </div>

      <div className="History-defence">
        <span>Defence History</span>
      </div>

      {/* ===== ประวัติ (การ์ด + รูปคลิกขยาย) ===== */}
      <div className="defence-history">
        <div className="history-list">
          {events.map((ev) => {
            const imgSrc = ev.image || FALLBACK_IMG;
            return (
              <article className="history-card" key={ev.id}>
                <div className="drone-image">
                  <ImageViewer
                    src={imgSrc}
                    alt={ev.type}
                    width={96}
                    height={96}
                    objectFit="cover"
                    rounded
                  />
                </div>
                <div className="drone-info">
                  <p><strong>obj-id:</strong> {ev.objId}</p>
                  <p><strong>type:</strong> {ev.type}</p>
                  <p><strong>lat:</strong> {ev.lat.toFixed(6)}</p>
                  <p><strong>lng:</strong> {ev.lng.toFixed(6)}</p>
                  <p><strong>timestamp:</strong> {ev.timestamp}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DefenseSection;
