"use client";

import { useState } from "react";

export default function MapPage() {
  const [coords, setCoords] = useState(null);

  const handleClick = (e) => {
    const rect = e.target.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCoords({
      x: x.toFixed(2),
      y: y.toFixed(2),
    });

    console.log({
      x: x.toFixed(2),
      y: y.toFixed(2),
    });
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom, #f4e8c1, #e6d2a2)",
        color: "#111",
        padding: "20px",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "48px",
          marginBottom: "10px",
          fontWeight: "bold",
          letterSpacing: "2px",
        }}
      >
        👑 GAME OF KINGS 👑
      </h1>

      <p
        style={{
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        Click a castle location to record coordinates
      </p>

      {coords && (
        <div
          style={{
            textAlign: "center",
            background: "#fff8dc",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "2px solid #7a5c2e",
            maxWidth: "400px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          X: {coords.x}% | Y: {coords.y}%
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "40px",
        }}
      >
        <div
          style={{
            fontSize: "80px",
            marginTop: "200px",
          }}
        >
          ⚔️
        </div>

        <img
          src="/LONG-MAP.png"
          alt="Westeros Map"
          onClick={handleClick}
          style={{
            width: "100%",
            maxWidth: "900px",
            border: "8px solid #5b3d1a",
            borderRadius: "12px",
            cursor: "crosshair",
            boxShadow: "0 0 25px rgba(0,0,0,0.4)",
          }}
        />

        <div
          style={{
            fontSize: "80px",
            marginTop: "200px",
          }}
        >
          ⚔️
        </div>
      </div>
    </main>
  );
}