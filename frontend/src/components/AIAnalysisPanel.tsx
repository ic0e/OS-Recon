import { useScanner } from "../context/ScannerContext";

interface AIAnalysisPanelProps {
  scanData: any;
  gitData: any | null;
  pryResults: any[] | null;
}

interface AIAnalysisViewerProps {
  rawAnalysis: string;
}

function AIAnalysisViewer({ rawAnalysis }: AIAnalysisViewerProps) {
  if (!rawAnalysis) return null;

  const lines = rawAnalysis.split("\n");

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        fontFamily: "monospace",
        fontSize: "0.8rem",
      }}
    >
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) return <div key={index} style={{ height: "0.5rem" }} />;

        if (trimmed.startsWith("**Phase") || trimmed.startsWith("Phase")) {
          return (
            <div
              key={index}
              style={{
                paddingTop: "1rem",
                paddingBottom: "0.4rem",
                borderBottom: "1px dashed #222",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "#00ff66",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  letterSpacing: "0.05em",
                }}
              >
                {trimmed.replace(/\*\*|\[!\]|\[\+\]|\[-\]/g, "").trim()}
              </h3>
            </div>
          );
        }

        if (trimmed.startsWith("[!]")) {
          return (
            <div
              key={index}
              style={{
                padding: "0.75rem",
                borderRadius: "2px",
                background: "#1a0d0d",
                border: "1px solid #ff3333",
                color: "#ff8888",
                lineHeight: "1.5",
              }}
            >
              <span
                style={{
                  color: "#ff3333",
                  fontWeight: "bold",
                  marginRight: "0.5rem",
                }}
              >
                [!]
              </span>
              {trimmed.replace("[!]", "").trim()}
            </div>
          );
        }

        if (trimmed.startsWith("[+]")) {
          return (
            <div
              key={index}
              style={{
                padding: "0.75rem",
                borderRadius: "2px",
                background: "#05140b",
                border: "1px solid #00aa44",
                color: "#e0e0e0",
                lineHeight: "1.5",
              }}
            >
              <span
                style={{
                  color: "#00ff66",
                  fontWeight: "bold",
                  marginRight: "0.5rem",
                }}
              >
                [+]
              </span>
              {trimmed.replace("[+]", "").trim()}
            </div>
          );
        }

        if (trimmed.startsWith("[-]")) {
          return (
            <div
              key={index}
              style={{
                padding: "0.25rem 0 0.25rem 0.75rem",
                borderLeft: "2px solid #444",
                color: "#a0a0a0",
                lineHeight: "1.5",
              }}
            >
              <span style={{ color: "#888", marginRight: "0.5rem" }}>[-]</span>
              {trimmed.replace("[-]", "").trim()}
            </div>
          );
        }

        return (
          <div
            key={index}
            style={{ paddingLeft: "1.25rem", color: "#888", lineHeight: "1.5" }}
          >
            {trimmed}
          </div>
        );
      })}
    </div>
  );
}

export function AIAnalysisPanel({
  scanData,
  gitData,
  pryResults,
}: AIAnalysisPanelProps) {
  const {
    aiReport: report,
    setAiReport: setReport,
    aiLoading: loading,
    setAiLoading: setLoading,
    aiError: error,
    setAiError: setError,
  } = useScanner();

  const runEngine = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          social: scanData,
          github: gitData,
          deepPry: pryResults,
        }),
      });

      if (!response.ok) {
        throw new Error(`Engine responded with status code ${response.status}`);
      }

      const data = await response.json();
      setReport(data.analysis);
    } catch (err: any) {
      setError(err.message || "Cognitive pipeline execution failure.");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    // extract and map data sources safely
    const scanMeta = scanData || {};
    const gitMeta = gitData || {};
    const profileMeta = pryResults?.[0]?.metrics || {};

    const foundPlatforms = (scanMeta.results || []).filter(
      (item) => item.status === "Found",
    );
    const repos = [...(gitMeta.interesting || []), ...(gitMeta.standard || [])];
    const emails = gitMeta.exposed_emails || [];

    // BUILD A READABLE REPORT STRUCTURE
    let txtContent = "";
    txtContent += `==================================================\n`;
    txtContent += `             OS-RECON INTELLIGENCE REPORT         \n`;
    txtContent += `==================================================\n\n`;

    // AI OUTPUT
    if (report) {
      txtContent += `[+] AI INTEL & TARGET PROFILE\n`;
      txtContent += `--------------------------------------------------\n`;
      txtContent += `Target Name : ${profileMeta.display_name || "Unknown"}\n`;
      txtContent += `Bio         : ${profileMeta.bio || "No bio available."}\n`;
      txtContent += `Followers   : ${profileMeta.platform_specific?.followers || 0}\n`;
      txtContent += `Total Repos : ${profileMeta.platform_specific?.repositories || 0}\n`;
      txtContent += `Exposed E-mail(s): ${emails.join(", ") || "None detected."}\n\n`;
    }

    // REPOS
    txtContent += `[+] IDENTIFIED SOURCE REPOSITORIES (${repos.length})\n`;
    txtContent += `--------------------------------------------------\n`;
    if (repos.length === 0) {
      txtContent += `No public repositories found.\n`;
    } else {
      repos.forEach((repo) => {
        txtContent += `-> ${repo.name} [Lang: ${repo.language || "Unknown"}] [Stars: ${repo.stars || 0}]\n`;
        if (repo.description) txtContent += `   Desc: ${repo.description}\n`;
        txtContent += `   URL : ${repo.url}\n\n`;
      });
    }
    txtContent += `\n`;

    // PLATFORMS - FOUND ONLY (assumes that the user checked the blocked ones and deep pried them, if they did they will appear in the deep pry section)
    txtContent += `==================================================\n`;
    txtContent += `[+] DISCOVERED PLATFORMS (${foundPlatforms.length} / ${scanMeta.total_checked || 0})\n`;
    txtContent += `==================================================\n`;
    if (foundPlatforms.length === 0) {
      txtContent += `No registered matching profiles discovered.\n`;
    } else {
      // clearer alignment, headers
      txtContent += `${"PLATFORM".padEnd(20)} | ${"CATEGORY".padEnd(15)} | ${"URL"}\n`;
      txtContent += `--------------------------------------------------------------------------------\n`;
      foundPlatforms.forEach((p) => {
        txtContent += `${p.site.padEnd(20)} | ${p.category.padEnd(15)} | ${p.url}\n`;
      });
    }

    // GENERATE FILE & DOWNLOAD LINK
    const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai_analysis_report_${profileMeta.display_name || "target"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        margin: "10px",
      }}
    >
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <button
          onClick={runEngine}
          disabled={loading}
          style={{
            background: loading ? "#222" : "#00ff66",
            color: loading ? "#555" : "#000",
            border: "none",
            padding: "0.6rem 1.5rem",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontFamily: "monospace",
            fontSize: "0.75rem",
            letterSpacing: "0.05em",
          }}
        >
          {loading ? "PROCESSING..." : "EXECUTE AI ANALYSIS"}
        </button>

        {!loading && (
          <button
            onClick={downloadReport}
            disabled={loading}
            title="Export AI analysis report as a CSV file. (AI analysis not needed for this export.)"
            style={{
              background: loading ? "#222" : "#00ff66",
              color: loading ? "#555" : "#000",
              border: "none",
              padding: "0.6rem 1.5rem",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontFamily: "monospace",
              fontSize: "0.75rem",
              letterSpacing: "0.05em",
            }}
          >
            {loading ? "DOWNLOADING..." : "EXPORT DATA"}
          </button>
        )}
      </div>

      {error && (
        <div
          style={{
            background: "#1a0d0d",
            border: "1px solid #ff3333",
            color: "#ff3333",
            padding: "1rem",
            fontFamily: "monospace",
            fontSize: "0.75rem",
          }}
        >
          [!] ERROR: {error}
        </div>
      )}

      {loading && (
        <div
          style={{
            color: "#00ff66",
            fontFamily: "monospace",
            fontSize: "0.75rem",
            letterSpacing: "0.05em",
          }}
        >
          &gt; executing AI reasoning
        </div>
      )}

      {report && !loading && (
        <div
          style={{
            background: "#0a0a0a",
            border: "1px solid #222",
            borderLeft: "4px solid #00ff66",
            padding: "1.25rem",
            fontFamily: "monospace",
            color: "#e0e0e0",
            fontSize: "0.8rem",
            lineHeight: "1.6",
          }}
        >
          <div
            style={{
              color: "#00ff66",
              fontWeight: "bold",
              marginBottom: "0.75rem",
              borderBottom: "1px dashed #222",
              paddingBottom: "0.4rem",
              fontSize: "0.7rem",
              letterSpacing: "0.05em",
            }}
          >
            COGNITIVE THREAT INTELLIGENCE REPORT
          </div>
          <AIAnalysisViewer rawAnalysis={report} />
        </div>
      )}
    </div>
  );
}
