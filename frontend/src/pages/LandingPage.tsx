import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { generateBriefing, getBriefingStatus, getBriefing } from "../services/authApi";

interface LandingPageProps {
  username: string;
  token: string;
}

const LandingPage = ({ username, token }: LandingPageProps) => {
  const [briefingContent, setBriefingContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");

  const handleGenerateBriefing = async () => {
    setIsGenerating(true);
    setBriefingContent(null);
    setError(null);
    setStatus("queued");

    try {
      // Step 1: Start generation
      const response = await generateBriefing(token);
      const briefingId = response.briefingId;

      if (briefingId) {
        // Step 2: Poll for completion
        await pollBriefingStatus(briefingId);
      } else {
        throw new Error("Failed to start briefing generation - no briefingId in response");
      }
    } catch (err: any) {
      console.error("Briefing generation failed:", err);
      setError(err.message || "Failed to generate briefing. Please try again.");
      setStatus("error");
      setIsGenerating(false);
    }
  };

  const pollBriefingStatus = async (briefingId: string) => {
    const maxAttempts = 60;
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      try {
        const statusResponse = await getBriefingStatus(briefingId, token);
        const currentStatus = statusResponse.status;

        setStatus(currentStatus);

        if (currentStatus === "done") {
          await fetchCompleteBriefing(briefingId);
          break;
        } else if (currentStatus === "error") {
          const reason = statusResponse.statusReason || "Unknown error";
          throw new Error(`Briefing generation failed: ${reason}`);
        }
      } catch (err: any) {
        console.error("Status check failed:", err);
        setError(err.message || "Failed to check briefing status.");
        setStatus("error");
        setIsGenerating(false);
        break;
      }

      attempts++;
    }

    if (attempts >= maxAttempts && status !== "done") {
      setError("Briefing generation timed out. Please try again.");
      setStatus("error");
      setIsGenerating(false);
    }
  };

  const fetchCompleteBriefing = async (briefingId: string) => {
    try {
      const response = await getBriefing(briefingId, token);

      if (response.summary) {
        const sections = response.summary.sections || [];
        let content = "";

        for (const section of sections) {
          if (section.category) {
            content += `📰 ${section.category.toUpperCase()}\n\n`;
          }
          if (section.text) {
            content += `${section.text}\n\n`;
          }
        }

        setBriefingContent(content.trim());
        setStatus("done");
      } else {
        throw new Error("Invalid briefing data - no summary found");
      }
    } catch (err: any) {
      console.error("Failed to fetch briefing:", err);
      setError(err.message || "Failed to load briefing.");
      setStatus("error");
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "queued":
        return "Queued for processing...";
      case "fetching":
        return "Fetching latest news articles...";
      case "summarizing":
        return "Creating your personalized summary...";
      case "done":
        return "Briefing ready!";
      case "error":
        return "Error occurred";
      default:
        return "Ready to generate";
    }
  };

  return (
    <div className="landing-page">
      <div className="landing-header">
        <h1>Welcome back, {username}!</h1>
      </div>

      <div className="landing-content">
        {/* Generate Briefing Button */}
        {!isGenerating && !briefingContent && (
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <button
              onClick={handleGenerateBriefing}
              className="auth-button"
              style={{ fontSize: "18px", padding: "15px 30px" }}
            >
              📰 Generate Briefing
            </button>
          </div>
        )}

        {/* Loading State */}
        {isGenerating && (
          <div className="personal-briefing" style={{ textAlign: "center" }}>
            <div style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  margin: "0 auto 1rem",
                  backgroundColor: "#333",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "40px",
                }}
              >
                📰
              </div>
              <div
                style={{
                  border: "4px solid #f3f3f3",
                  borderTop: "4px solid #333",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 1rem",
                }}
              />
              <style>
                {`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}
              </style>
            </div>
            <h3>{getStatusMessage()}</h3>
            <p style={{ fontStyle: "italic", color: "#666" }}>
              This may take a minute...
            </p>
          </div>
        )}

        {/* Briefing Content */}
        {briefingContent && (
          <div className="personal-briefing">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2>🗞️ Your Briefing</h2>
              <button
                onClick={handleGenerateBriefing}
                className="auth-button"
                style={{ padding: "8px 16px", fontSize: "14px" }}
              >
                🔄 Refresh
              </button>
            </div>
            <div style={{ lineHeight: "1.6" }}>
              <ReactMarkdown>{briefingContent}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#ffebee",
              border: "1px solid #ef5350",
              borderRadius: "4px",
              marginTop: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ color: "#d32f2f", marginRight: "0.5rem" }}>⚠️</span>
              <span style={{ color: "#d32f2f" }}>{error}</span>
            </div>
            <button
              onClick={handleGenerateBriefing}
              className="auth-button"
              style={{ marginTop: "0.5rem" }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
