import { useState } from "react";
import { AnalyticsOverview } from "./AnalyticsOverview";
import { AIAnalysisPanel } from "./AIAnalysisPanel";

interface AnalyticsTabProps {
  scanData: {
    username: string;
    total_found: number;
    total_checked: number;
  };
  gitData: any | null;
  pryResults: any[] | null;
}

export function AnalyticsTab({
  scanData,
  gitData,
  pryResults,
}: AnalyticsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<"telemetry" | "ai">(
    "telemetry",
  );

  const s = {
    muted: { color: "#555", fontFamily: "monospace", fontSize: "0.75rem" },
    tabButton: (isActive: boolean) => ({
      background: isActive ? "#00ff66" : "#141414",
      color: isActive ? "#000" : "#00ff66",
      border: isActive ? "none" : "1px solid #00ff66",
      padding: "0.5rem 1.25rem",
      cursor: "pointer",
      fontWeight: "bold" as const,
      fontFamily: "monospace",
      fontSize: "0.75rem",
      letterSpacing: "0.05em",
    }),
  };

  return (
    <div
      style={{
        padding: "1rem 0",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      <div
        style={{
          background: "#141414",
          borderLeft: "4px solid #00ff66",
          padding: "1rem 1.5rem",
        }}
      >
        <p
          style={{
            color: "#00ff66",
            fontFamily: "monospace",
            fontSize: "0.8rem",
            margin: "0 0 0.3rem 0",
            letterSpacing: "0.1em",
          }}
        >
          ANALYTICS — {scanData.username.toUpperCase()}
        </p>
        <p style={{ ...s.muted, margin: 0 }}>
          {scanData.total_found} profiles confirmed across{" "}
          {scanData.total_checked} platforms scanned
        </p>
      </div>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button
          onClick={() => setActiveSubTab("telemetry")}
          style={s.tabButton(activeSubTab === "telemetry")}
        >
          RAW TELEMETRY
        </button>
        <button
          onClick={() => setActiveSubTab("ai")}
          style={s.tabButton(activeSubTab === "ai")}
        >
          COGNITIVE ANALYSIS + DATA EXPORT
        </button>
      </div>

      <div style={{ display: activeSubTab === "telemetry" ? "block" : "none" }}>
        <AnalyticsOverview
          scanData={scanData}
          gitData={gitData}
          pryResults={pryResults}
        />
      </div>

      <div style={{ display: activeSubTab === "ai" ? "block" : "none" }}>
        <AIAnalysisPanel
          scanData={scanData}
          gitData={gitData}
          pryResults={pryResults}
        />
      </div>
    </div>
  );
}
