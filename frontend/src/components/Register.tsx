import React, { useState } from "react";
import { registerUser } from "../services/authApi";

interface RegisterProps {
  onNavigateToLogin?: () => void;
  onRegister?: (email: string) => void;
  initialEmail?: string;
}

const Register = ({ onNavigateToLogin, onRegister, initialEmail = "" }: RegisterProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [location, setLocation] = useState("");
  const [lifeStage, setLifeStage] = useState("");
  const [jobIndustry, setJobIndustry] = useState("");
  const [attentionGrabbers, setAttentionGrabbers] = useState("");
  const [generalInterests, setGeneralInterests] = useState("");
  const [newsStyle, setNewsStyle] = useState("");
  const [newsScope, setNewsScope] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const parseArrayField = (value: string): string[] => {
    if (!value.trim()) return [];
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name) {
      setError("Name is required.");
      return;
    }

    if (!email) {
      setError("Email is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const topicsArray = parseArrayField(attentionGrabbers);
      const interestsArray = parseArrayField(generalInterests);

      const response = await registerUser({
        name: name.trim(),
        email,
        password: password,
        topics: topicsArray,
        interests: interestsArray,
        jobIndustry: jobIndustry.trim() || undefined,
        location: location.trim() || undefined,
        lifeStage: lifeStage.trim() || undefined,
        newsStyle: newsStyle || undefined,
        newsScope: newsScope || undefined,
      });

      // Registration successful, navigate to OTP verification
      if (onRegister) onRegister(email);
    } catch (error: any) {
      console.error("Registration failed:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.error?.details ||
                          error.response?.data?.error?.message ||
                          error.response?.data?.message ||
                          error.message ||
                          "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-box">
      <h2 className="auth-heading">Join IntelliBrief</h2>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="question-label">Name</label>
        <input
          className="auth-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Your full name"
        />

        <label className="question-label">Email</label>
        <input
          className="auth-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your.email@example.com"
        />

        <div className="personalization-section">
          <h3 className="section-title">About You</h3>
          
          <label className="question-label">
            Where are you tuning in from? (City, state, or country)
          </label>
          <input
            className="auth-input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., New York, NY or United States"
          />

          <label className="question-label">
            What best describes your current stage in life?
          </label>
          <input
            className="auth-input"
            value={lifeStage}
            onChange={(e) => setLifeStage(e.target.value)}
            placeholder="e.g., student, young professional, parent, retiree"
          />

          <label className="question-label">
            What field or industry are you part of?
          </label>
          <input
            className="auth-input"
            value={jobIndustry}
            onChange={(e) => setJobIndustry(e.target.value)}
            placeholder="e.g., healthcare, tech, education"
          />
        </div>

        <div className="personalization-section">
          <h3 className="section-title">News Preferences</h3>
          <p className="section-subtitle">
            (Helps the briefing decide which topics and styles to prioritize.)
          </p>

          <label className="question-label">
            What kinds of stories always grab your attention?
          </label>
          <input
            className="auth-input"
            value={attentionGrabbers}
            onChange={(e) => setAttentionGrabbers(e.target.value)}
            placeholder="e.g., world news, tech, culture, politics, science (comma-separated)"
          />

          <label className="question-label">
            What are your general interests or passions?
          </label>
          <input
            className="auth-input"
            value={generalInterests}
            onChange={(e) => setGeneralInterests(e.target.value)}
            placeholder="e.g., technology, art, science, sports, travel, cooking (comma-separated)"
          />

          <label className="question-label">
            How do you like your news served?
          </label>
          <select
            className="auth-input"
            value={newsStyle}
            onChange={(e) => setNewsStyle(e.target.value)}
          >
            <option value="">Select an option</option>
            <option value="Quick summaries">Quick summaries</option>
            <option value="Thoughtful analysis">Thoughtful analysis</option>
            <option value="Opinion pieces">Opinion pieces</option>
          </select>

          <label className="question-label">
            Do you prefer global perspectives, local updates, or both?
          </label>
          <select
            className="auth-input"
            value={newsScope}
            onChange={(e) => setNewsScope(e.target.value)}
          >
            <option value="">Select an option</option>
            <option value="global">Global perspectives</option>
            <option value="local">Local updates</option>
            <option value="both">Both</option>
          </select>
        </div>

        <div className="personalization-section">
          <h3 className="section-title">Secure Your Account</h3>
          <p className="section-subtitle">
            Create a password to protect your account
          </p>

          <label className="question-label">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              className="auth-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="At least 6 characters"
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
              }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <label className="question-label">Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <input
              className="auth-input"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter your password"
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
              }}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message" style={{ color: "red", marginBottom: "10px" }}>
            {error}
          </div>
        )}

        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Complete Setup"}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account?{" "}
        <button type="button" className="auth-link" onClick={onNavigateToLogin}>
          Log in
        </button>
      </p>
    </div>
  );
};

export default Register;
