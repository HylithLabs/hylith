import { ImageResponse } from "next/og";
import { siteConfig } from "./site-config";

export const alt = "Hylith brand preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "56px",
          background:
            "linear-gradient(135deg, #050505 0%, #141414 55%, #efe7dc 140%)",
          color: "#f6f2eb",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "14px 24px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#c6beb4",
              fontSize: 28,
              letterSpacing: "0.18em",
            }}
          >
            FULL-STACK SYSTEMS
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 42,
              fontWeight: 700,
              letterSpacing: "-0.06em",
            }}
          >
            HYLITH
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            maxWidth: "86%",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 88,
              lineHeight: 1,
              fontWeight: 700,
              letterSpacing: "-0.06em",
            }}
          >
            WE COMPLETE YOUR BUSINESS
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: "#d3cdc3",
              lineHeight: 1.3,
            }}
          >
            {siteConfig.description}
          </div>
        </div>
      </div>
    ),
    size
  );
}
