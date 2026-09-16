import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 96, fontWeight: 800, letterSpacing: -2 }}>
          HavIt<span style={{ color: "#f43f5e" }}>All</span>
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#cbd5e1", marginTop: 16 }}>
          Luxury &amp; Lifestyle E-Commerce
        </div>
      </div>
    ),
    { ...size }
  );
}
