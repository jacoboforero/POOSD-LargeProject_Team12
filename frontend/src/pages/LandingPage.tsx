import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const LandingPage = ({ username }: { username: string }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefingId, setBriefingId] = useState<string | null>(null);
  const [briefingContent, setBriefingContent] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle"); // idle, queued, fetching, summarizing, done, error

  const generateBriefing = async () => {
    setIsGenerating(true);
    setBriefingContent(null);
    setErrorMessage(null);
    setStatus("queued");

    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      // Step 1: Start generation
      const response = await axios.post(
        "/api/briefings/generate",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("DEBUG: Generate response =", response.data);

      const briefingId = response.data.briefingId;

      if (briefingId) {
        setBriefingId(briefingId);
        // Step 2: Poll for completion
        await pollBriefingStatus(briefingId, token);
      } else {
        throw new Error("Failed to start briefing generation - no briefingId in response");
      }
    } catch (error: any) {
      console.error("Generate briefing error:", error);
      const message = error.response?.data?.error?.details ||
                      error.response?.data?.error?.message ||
                      error.message ||
                      "Failed to generate briefing. Please try again.";
      setErrorMessage(message);
      setIsGenerating(false);
      setStatus("error");
    }
  };

  const pollBriefingStatus = async (briefingId: string, token: string) => {
    const maxAttempts = 60; // Poll for up to 2 minutes
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

      try {
        const statusResponse = await axios.get(
          `/api/briefings/${briefingId}/status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("DEBUG: Status response =", statusResponse.data);

        const currentStatus = statusResponse.data.status;
        const progress = statusResponse.data.progress || 0;

        if (currentStatus) {
          setStatus(currentStatus);

          if (currentStatus === "done") {
            // Fetch the complete briefing
            await fetchCompleteBriefing(briefingId, token);
            break;
          } else if (currentStatus === "error") {
            const reason = statusResponse.data.statusReason || "Unknown error";
            throw new Error(`Briefing generation failed: ${reason}`);
          }
        }
      } catch (error: any) {
        console.error("Poll status error:", error);
        const message = error.response?.data?.error?.details ||
                        error.response?.data?.error?.message ||
                        error.message ||
                        "Failed to check briefing status";
        setErrorMessage(message);
        setIsGenerating(false);
        setStatus("error");
        break;
      }

      attempts++;
    }

    if (attempts >= maxAttempts && status !== "done") {
      setErrorMessage("Briefing generation timed out. Please try again.");
      setIsGenerating(false);
      setStatus("error");
    }
  };

  const fetchCompleteBriefing = async (briefingId: string, token: string) => {
    try {
      const response = await axios.get(`/api/briefings/${briefingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("DEBUG: Briefing response =", response.data);

      if (response.data.summary) {
        const sections = response.data.summary.sections || [];

        // Build briefing content from sections
        const content = sections
          .map((section: any) => {
            let text = "";
            if (section.category) {
              text += `📰 ${section.category.toUpperCase()}\n\n`;
            }
            if (section.text) {
              text += `${section.text}\n\n`;
            }
            return text;
          })
          .join("");

        setBriefingContent(content.trim());
        setIsGenerating(false);
        setStatus("done");
      } else {
        throw new Error("Invalid briefing data - no summary found");
      }
    } catch (error: any) {
      console.error("Fetch briefing error:", error);
      const message = error.response?.data?.error?.details ||
                      error.response?.data?.error?.message ||
                      error.message ||
                      "Failed to fetch briefing";
      setErrorMessage(message);
      setIsGenerating(false);
      setStatus("error");
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
        <h1>Welcome back, {username}</h1>
      </div>

      <div className="landing-content">
        {/* Generate Briefing Button */}
        {!isGenerating && !briefingContent && (
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <button
              className="auth-button"
              onClick={generateBriefing}
              style={{ marginBottom: "2rem", maxWidth: "400px" }}
            >
              📰 Generate Briefing
            </button>
          </div>
        )}

        {/* Loading State */}
        {isGenerating && (
          <div className="personal-briefing" style={{ textAlign: "center" }}>
            <div style={{ marginBottom: "1rem" }}>
              <div className="loading-spinner"></div>
            </div>
            <h3>{getStatusMessage()}</h3>
            <p style={{ fontStyle: "italic", color: "#666" }}>
              This may take a minute...
            </p>
          </div>
        )}

        {/* Briefing Content */}
        {briefingContent && (
          <div className="personal-briefing" style={{ width: "100%", maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>🗞️ Your Briefing</h2>
              <button
                className="auth-button"
                onClick={generateBriefing}
                style={{ padding: "0.5rem 1rem" }}
              >
                🔄 Refresh
              </button>
            </div>
            <div style={{ lineHeight: "1.8", fontFamily: "Georgia, serif", fontSize: "1.05rem" }}>
              <ReactMarkdown>{briefingContent}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "rgba(255, 0, 0, 0.1)",
              border: "1px solid rgba(255, 0, 0, 0.3)",
              borderRadius: "4px",
              marginTop: "1rem",
            }}
          >
            <p style={{ color: "red", marginBottom: "1rem" }}>
              ⚠️ {errorMessage}
            </p>
            <button className="auth-button" onClick={generateBriefing}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
