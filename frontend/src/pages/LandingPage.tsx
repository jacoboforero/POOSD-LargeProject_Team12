import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import {
  getCurrentUserProfile,
  logout as logoutUser,
  updateUserProfile,
  type UserProfile,
} from "../services/userApi";

interface LandingPageProps {
  username: string;
  onLogout: () => void;
}

const LandingPage = ({ username, onLogout }: LandingPageProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    timezone: "",
    topics: "",
    interests: "",
    jobIndustry: "",
    demographic: "",
    location: "",
    lifeStage: "",
    newsStyle: "",
    newsScope: "",
    preferredHeadlines: "",
    scrollPastTopics: "",
    onBriefingReady: true,
  });
  const [customForm, setCustomForm] = useState({
    topics: "",
    includeKeywords: "",
    excludeKeywords: "",
    preferredSources: "",
    language: "en",
    format: "narrative",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefingContent, setBriefingContent] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle"); // idle, queued, fetching, summarizing, done, error
  const [activeGenerationType, setActiveGenerationType] = useState<
    "daily" | "customNewsQuery" | null
  >("daily");
  const profileDisplayName = user?.name || username || "there";
  const isDailyProcessing = isGenerating && activeGenerationType === "daily";
  const isCustomProcessing =
    isGenerating && activeGenerationType === "customNewsQuery";

  const handleLogout = () => {
    logoutUser();
    onLogout();
  };

  const isUnauthorized = (error: any) =>
    error?.response?.status === 401 || error?.response?.data?.error?.code === "UNAUTHORIZED";

  const handleAuthGuard = (error: any) => {
    if (isUnauthorized(error)) {
      handleLogout();
      return true;
    }
    return false;
  };

  const hydrateProfileForm = (profile: UserProfile) => {
    const preferences = profile.preferences || {
      topics: [],
      interests: [],
      preferredHeadlines: [],
      scrollPastTopics: [],
    };

    const formatList = (list?: string[]) => (list && list.length ? list.join(", ") : "");

    setProfileForm({
      name: profile.name || "",
      email: profile.email,
      timezone: profile.timezone || "",
      topics: formatList(preferences.topics),
      interests: formatList(preferences.interests),
      jobIndustry: preferences.jobIndustry || "",
      demographic: preferences.demographic || "",
      location: preferences.location || "",
      lifeStage: preferences.lifeStage || "",
      newsStyle: preferences.newsStyle || "",
      newsScope: preferences.newsScope || "",
      preferredHeadlines: formatList(preferences.preferredHeadlines),
      scrollPastTopics: formatList(preferences.scrollPastTopics),
      onBriefingReady: profile.notificationPrefs?.onBriefingReady ?? true,
    });
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getCurrentUserProfile();
        setUser(profile);
        hydrateProfileForm(profile);
        setProfileError(null);
      } catch (error: any) {
        if (handleAuthGuard(error)) {
          return;
        }
        const message =
          error.response?.data?.error?.details ||
          error.response?.data?.error?.message ||
          error.message ||
          "Failed to load your profile.";
        setProfileError(typeof message === "string" ? message : "Failed to load your profile.");
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  const parseList = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

  const sanitizeList = (value: string) => {
    const list = parseList(value);
    return list.length ? list : undefined;
  };

  const topicsSummary = (customTopics: string, profileTopics?: string[]) => {
    const customList = parseList(customTopics);
    const sourceTopics = customList.length ? customList : profileTopics || [];
    if (!sourceTopics.length) {
      return "No topic filters applied";
    }
    const preview = sourceTopics.slice(0, 3).join(", ");
    return `Focus: ${preview}${sourceTopics.length > 3 ? " +" : ""}`;
  };

  const handleCustomFormChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setCustomForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = event.target;
    const { name, value } = target;
    const isCheckbox = target instanceof HTMLInputElement && target.type === "checkbox";
    const nextValue = isCheckbox ? target.checked : value;

    setProfileForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setProfileError(null);
    setProfileSuccessMessage(null);

    try {
      setIsSavingProfile(true);
      const updatedProfile = await updateUserProfile({
        name: profileForm.name || undefined,
        timezone: profileForm.timezone || undefined,
        notificationPrefs: { onBriefingReady: profileForm.onBriefingReady },
        preferences: {
          topics: parseList(profileForm.topics),
          interests: parseList(profileForm.interests),
          jobIndustry: profileForm.jobIndustry || undefined,
          demographic: profileForm.demographic || undefined,
          location: profileForm.location || undefined,
          lifeStage: profileForm.lifeStage || undefined,
          newsStyle: profileForm.newsStyle || undefined,
          newsScope: profileForm.newsScope || undefined,
          preferredHeadlines: parseList(profileForm.preferredHeadlines),
          scrollPastTopics: parseList(profileForm.scrollPastTopics),
        },
      });

      setUser(updatedProfile);
      hydrateProfileForm(updatedProfile);
      setProfileSuccessMessage("Profile updated successfully.");
      setIsProfileModalOpen(false);
    } catch (error: any) {
      if (handleAuthGuard(error)) {
        return;
      }
      const message =
        error.response?.data?.error?.details ||
        error.response?.data?.error?.message ||
        error.message ||
        "Failed to update profile.";
      setProfileError(typeof message === "string" ? message : "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const openProfileModal = () => {
    if (!user) {
      return;
    }
    setProfileError(null);
    setProfileSuccessMessage(null);
    setIsProfileModalOpen(true);
  };

  const beginGeneration = (kind: "daily" | "customNewsQuery") => {
    setActiveGenerationType(kind);
    setIsGenerating(true);
    setBriefingContent(null);
    setErrorMessage(null);
    setStatus("queued");
  };

  const generateDailyBriefing = async () => {
    beginGeneration("daily");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        handleLogout();
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await axios.post(
        "/api/briefings/generate-daily",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("DEBUG: Generate daily response =", response.data);

      const briefingId = response.data.briefingId;

      if (briefingId) {
        await pollBriefingStatus(briefingId, token);
      } else {
        throw new Error("Failed to start briefing generation - no briefingId in response");
      }
    } catch (error: any) {
      if (handleAuthGuard(error)) {
        return;
      }
      console.error("Generate daily briefing error:", error);
      const message =
        error.response?.data?.error?.details ||
        error.response?.data?.error?.message ||
        error.message ||
        "Failed to generate briefing. Please try again.";
      setErrorMessage(message);
      setIsGenerating(false);
      setStatus("error");
    }
  };

  const generateCustomNewsQuery = async (event?: FormEvent) => {
    event?.preventDefault();
    beginGeneration("customNewsQuery");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        handleLogout();
        throw new Error("No authentication token found. Please log in again.");
      }

      const payload: Record<string, any> = {
        topics: sanitizeList(customForm.topics),
        includeKeywords: sanitizeList(customForm.includeKeywords),
        excludeKeywords: sanitizeList(customForm.excludeKeywords),
        preferredSources: sanitizeList(customForm.preferredSources),
        language: customForm.language || undefined,
        format: customForm.format,
      };

      Object.keys(payload).forEach((key) => {
        if (
          payload[key] === undefined ||
          (Array.isArray(payload[key]) && !payload[key].length)
        ) {
          delete payload[key];
        }
      });

      const response = await axios.post(
        "/api/briefings/generate",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("DEBUG: Generate custom response =", response.data);

      const briefingId = response.data.briefingId;

      if (briefingId) {
        await pollBriefingStatus(briefingId, token);
      } else {
        throw new Error("Failed to start custom news query - no briefingId in response");
      }
    } catch (error: any) {
      if (handleAuthGuard(error)) {
        return;
      }
      console.error("Generate custom news query error:", error);
      const message =
        error.response?.data?.error?.details ||
        error.response?.data?.error?.message ||
        error.message ||
        "Failed to run your custom news query. Please try again.";
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
        if (handleAuthGuard(error)) {
          return;
        }
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
      if (handleAuthGuard(error)) {
        return;
      }
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
    const isCustomQuery = activeGenerationType === "customNewsQuery";
    const prefix = isCustomQuery ? "Custom news query" : "Daily briefing";
    switch (status) {
      case "queued":
        return `${prefix} queued for processing...`;
      case "fetching":
        return `${prefix} is fetching articles...`;
      case "summarizing":
        return `Creating your ${isCustomQuery ? "custom news" : "daily"} summary...`;
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
        <div>
          <h1>Welcome back, {profileDisplayName}</h1>
          <p className="landing-subtitle">
            {profileLoading ? "Loading your profile..." : user?.email || "Signed in"}
          </p>
        </div>
        <div className="landing-actions">
          <button
            className="landing-button"
            onClick={openProfileModal}
            disabled={!user || profileLoading}
          >
            ✏️ Edit Profile
          </button>
          <button className="landing-button secondary" onClick={handleLogout}>
            🚪 Log Out
          </button>
        </div>
      </div>

      {profileError && (
        <div className="status-banner error">
          {profileError}
        </div>
      )}

      {profileSuccessMessage && (
        <div className="status-banner success">
          {profileSuccessMessage}
        </div>
      )}

      <div className="landing-content">
        <section className="generation-showcase">
          <article className="generation-card daily-card">
            <div className="card-heading">
              <span className="card-chip">Daily Pulse</span>
              <h3>Zero-effort briefing</h3>
              <p>
                Tap into your saved profile, calendar rhythm, and reading cadence. Ideal for a morning scan before the day
                ramps up.
              </p>
            </div>
            <ul className="card-highlights">
              <li>✨ Uses your saved industries & interests</li>
              <li>⚡ Fresh headlines every time you run it</li>
              <li>🧭 Perfect for commute or stand-up prep</li>
            </ul>
            <button
              className="landing-button pill"
              onClick={generateDailyBriefing}
              disabled={isGenerating}
            >
              {isDailyProcessing ? "Generating..." : "Generate my daily briefing"}
            </button>
          </article>

          <article className="generation-card custom-card">
            <div className="card-heading">
              <span className="card-chip accent">Research Mode</span>
              <h3>Custom News Query</h3>
              <p>
                Compose a hyper-specific search—mix emerging themes, required keywords, and trusted sources for a bespoke digest.
              </p>
            </div>

            <form className="custom-briefing-form" onSubmit={generateCustomNewsQuery}>
              <div className="custom-form-grid">
                <label>
                  <span>Topics</span>
                  <textarea
                    className="auth-input"
                    name="topics"
                    value={customForm.topics}
                    onChange={handleCustomFormChange}
                    placeholder="climate tech, fintech, enterprise AI..."
                    disabled={isGenerating}
                  />
                </label>

                <label>
                  <span>Include keywords</span>
                  <input
                    className="auth-input"
                    name="includeKeywords"
                    type="text"
                    value={customForm.includeKeywords}
                    onChange={handleCustomFormChange}
                    placeholder="IPO, chip shortage, M&A..."
                    disabled={isGenerating}
                  />
                </label>

                <label>
                  <span>Exclude keywords</span>
                  <input
                    className="auth-input"
                    name="excludeKeywords"
                    type="text"
                    value={customForm.excludeKeywords}
                    onChange={handleCustomFormChange}
                    placeholder="sports, celebrity, rumors..."
                    disabled={isGenerating}
                  />
                </label>

                <label>
                  <span>Preferred sources</span>
                  <input
                    className="auth-input"
                    name="preferredSources"
                    type="text"
                    value={customForm.preferredSources}
                    onChange={handleCustomFormChange}
                    placeholder="the-verge, bloomberg, financial-times..."
                    disabled={isGenerating}
                  />
                </label>
              </div>

              <div className="custom-field-row">
                <label>
                  <span>Language</span>
                  <select
                    className="auth-input"
                    name="language"
                    value={customForm.language}
                    onChange={handleCustomFormChange}
                    disabled={isGenerating}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                    <option value="ru">Russian</option>
                    <option value="zh">Chinese</option>
                  </select>
                </label>
                <label>
                  <span>Format</span>
                  <select
                    className="auth-input"
                    name="format"
                    value={customForm.format}
                    onChange={handleCustomFormChange}
                    disabled={isGenerating}
                  >
                    <option value="narrative">Narrative overview</option>
                    <option value="bullet_points">Bulleted highlights</option>
                  </select>
                </label>
              </div>

              <div className="card-footer">
                <small>Tip: use 2–3 topics plus must-have keywords for best precision.</small>
                <button className="landing-button pill" type="submit" disabled={isGenerating}>
                  {isCustomProcessing ? "Running query..." : "Run custom news query"}
                </button>
              </div>
            </form>
          </article>
        </section>

        {/* Loading State */}
        {isGenerating && (
          <section className="briefing-shell loading-state">
            <div className="orbit-loader" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p className="loader-label">{getStatusMessage()}</p>
            <p className="loader-subtext">We’re fetching stories, scraping details, and drafting your summary.</p>
          </section>
        )}

        {/* Briefing Content */}
        {briefingContent && (
          <section className="briefing-shell">
            <header className="briefing-header">
              <div>
                <p className="briefing-label">
                  {activeGenerationType === "customNewsQuery" ? "Custom digest" : "Daily briefing"}
                </p>
                <h2>🗞️ Your briefing is ready</h2>
                <p className="briefing-meta">
                  Delivered {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ·{" "}
                  {topicsSummary(customForm.topics, user?.preferences?.topics)}
                </p>
              </div>
              <button
                className="ghost-button"
                type="button"
                onClick={
                  activeGenerationType === "customNewsQuery"
                    ? () => generateCustomNewsQuery()
                    : generateDailyBriefing
                }
                disabled={isGenerating}
              >
                🔄 Regenerate
              </button>
            </header>
            <div className="briefing-body typography-serif">
              <ReactMarkdown>{briefingContent}</ReactMarkdown>
            </div>
          </section>
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
            <button className="auth-button" onClick={generateDailyBriefing} disabled={isGenerating}>
              Try Daily Briefing
            </button>
            {activeGenerationType === "customNewsQuery" && (
              <button
                className="auth-button"
                style={{ marginLeft: "0.5rem" }}
                onClick={() => generateCustomNewsQuery()}
                disabled={isGenerating}
              >
                Retry Custom News Query
              </button>
            )}
          </div>
        )}
      </div>

      {isProfileModalOpen && user && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="modal-close" type="button" onClick={() => setIsProfileModalOpen(false)}>
                ✕
              </button>
            </div>
            <form className="profile-form" onSubmit={handleProfileSubmit}>
              <label className="question-label">Full Name</label>
              <input
                className="auth-input"
                name="name"
                type="text"
                value={profileForm.name}
                onChange={handleProfileChange}
                placeholder="Your name"
              />

              <label className="question-label">Email (read-only)</label>
              <input className="auth-input" name="email" type="email" value={profileForm.email} disabled />

              <label className="question-label">Timezone</label>
              <input
                className="auth-input"
                name="timezone"
                type="text"
                value={profileForm.timezone}
                onChange={handleProfileChange}
                placeholder="e.g., America/Los_Angeles"
              />

              <label className="question-label">Location</label>
              <input
                className="auth-input"
                name="location"
                type="text"
                value={profileForm.location}
                onChange={handleProfileChange}
                placeholder="City, state, or country"
              />

              <label className="question-label">Life Stage</label>
              <input
                className="auth-input"
                name="lifeStage"
                type="text"
                value={profileForm.lifeStage}
                onChange={handleProfileChange}
                placeholder="Student, young professional, parent..."
              />

              <label className="question-label">Job Industry</label>
              <input
                className="auth-input"
                name="jobIndustry"
                type="text"
                value={profileForm.jobIndustry}
                onChange={handleProfileChange}
                placeholder="Tech, finance, education..."
              />

              <label className="question-label">Demographic</label>
              <input
                className="auth-input"
                name="demographic"
                type="text"
                value={profileForm.demographic}
                onChange={handleProfileChange}
                placeholder="Optional demographic details"
              />

              <label className="question-label">Topics that grab your attention</label>
              <textarea
                className="auth-input"
                name="topics"
                value={profileForm.topics}
                onChange={handleProfileChange}
                placeholder="Separate with commas (e.g., AI, healthcare, markets)"
              />

              <label className="question-label">General interests</label>
              <textarea
                className="auth-input"
                name="interests"
                value={profileForm.interests}
                onChange={handleProfileChange}
                placeholder="Separate with commas"
              />

              <label className="question-label">Preferred headline styles</label>
              <textarea
                className="auth-input"
                name="preferredHeadlines"
                value={profileForm.preferredHeadlines}
                onChange={handleProfileChange}
                placeholder="Separate with commas"
              />

              <label className="question-label">Headlines you usually skip</label>
              <textarea
                className="auth-input"
                name="scrollPastTopics"
                value={profileForm.scrollPastTopics}
                onChange={handleProfileChange}
                placeholder="Separate with commas"
              />

              <label className="question-label">News style</label>
              <input
                className="auth-input"
                name="newsStyle"
                type="text"
                value={profileForm.newsStyle}
                onChange={handleProfileChange}
                placeholder="Quick summaries, thoughtful analysis..."
              />

              <label className="question-label">News scope</label>
              <input
                className="auth-input"
                name="newsScope"
                type="text"
                value={profileForm.newsScope}
                onChange={handleProfileChange}
                placeholder="Local, global, or both"
              />

              <div className="toggle-row">
                <label htmlFor="onBriefingReady">
                  <input
                    id="onBriefingReady"
                    name="onBriefingReady"
                    type="checkbox"
                    checked={profileForm.onBriefingReady}
                    onChange={handleProfileChange}
                  />
                  Notify me when my briefing is ready
                </label>
              </div>

              {profileError && (
                <p className="error-message" style={{ color: "red" }}>
                  {profileError}
                </p>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="landing-button secondary"
                  onClick={() => setIsProfileModalOpen(false)}
                  disabled={isSavingProfile}
                >
                  Cancel
                </button>
                <button className="landing-button" type="submit" disabled={isSavingProfile}>
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
