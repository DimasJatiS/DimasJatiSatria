"use client";

// Last resort when the root layout itself fails: plain HTML, no providers.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#0A0A0A", color: "#F5F5F2", fontFamily: "system-ui", display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <h1>Something broke</h1>
          <button type="button" onClick={reset} style={{ marginTop: 16, padding: "10px 20px", borderRadius: 999, border: 0, background: "#CD7F32" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
