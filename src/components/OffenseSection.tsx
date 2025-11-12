import React from "react";
import "./offence-section.css";
import type { OffenseEvent } from "../App";

type Props = {
  events: OffenseEvent[];
};

const DRONE_IMG =
  "https://cdn-icons-png.flaticon.com/512/2920/2920233.png"; // ✅ ใช้รูปเดียวกันทั้งหมด

const OffenseSection: React.FC<Props> = ({ events }) => {
  // ✅ ดึงข้อมูลล่าสุด (ตัวบนสุด)
  const latest = events.length > 0 ? events[0] : null;

  return (
    <section className="offense-section">
      <div className="name-offence">Offence</div>

      {/* ===== ส่วนกลาง: Status ล่าสุด (รูปบน-ข้อความล่าง) ===== */}
      <div className="status">
        {latest ? (
          <div className="status-box-vertical">
            <div className="offence-image-top">
              <img src={DRONE_IMG} alt="Drone" />
            </div>
            <div className="offence-info">
              <p>
                lat: {latest.lat.toFixed(6)} &nbsp;&nbsp; lng:{" "}
                {latest.lng.toFixed(6)}
              </p>

              {(latest.altitude !== undefined ||
                latest.speed !== undefined) && (
                <p>
                  {latest.altitude !== undefined && (
                    <>altitude: {latest.altitude.toFixed(1)}&nbsp;&nbsp;</>
                  )}
                  {latest.speed !== undefined && (
                    <>speed: {latest.speed.toFixed(1)}</>
                  )}
                </p>
              )}

              <p>timestamp: {latest.timestamp}</p>
            </div>
          </div>
        ) : (
          <div className="no-data">No Offense Data</div>
        )}
      </div>

      {/* ===== ส่วนล่าง: Offence History (เหมือนเดิม) ===== */}
      <div className="History-offence">Offence History</div>

      <div className="offence-history">
        <div className="offence-list">
          {events.map((ev) => (
            <article className="offence-card" key={ev.id}>
              <div className="offence-info">
                <p>
                  lat: {ev.lat.toFixed(6)} &nbsp;&nbsp; lng: {ev.lng.toFixed(6)}
                </p>

                {(ev.altitude !== undefined || ev.speed !== undefined) && (
                  <p>
                    {ev.altitude !== undefined && (
                      <>altitude: {ev.altitude.toFixed(1)}&nbsp;&nbsp;</>
                    )}
                    {ev.speed !== undefined && (
                      <>speed: {ev.speed.toFixed(1)}</>
                    )}
                  </p>
                )}

                <p>timestamp: {ev.timestamp}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OffenseSection;
