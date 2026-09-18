import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** High-contrast ITmatics mark - cobalt field, white diamond, ink core. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1f47ff",
          borderRadius: 7,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            background: "#ffffff",
            transform: "rotate(45deg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              background: "#0c1622",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 4,
                height: 4,
                background: "#1f47ff",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
