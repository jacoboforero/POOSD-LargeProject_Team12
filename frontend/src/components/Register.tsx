import React, { useState } from "react";
import { registerUser, verifyOtp } from "../services/authApi";

interface RegisterProps {
  onNavigateToLogin?: () => void;
  onRegister?: (email: string, token: string) => void;
}

const Register = ({ onNavigateToLogin, onRegister }: RegisterProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [lifeStage, setLifeStage] = useState("");
  const [jobIndustry, setJobIndustry] = useState("");
  const [attentionGrabbers, setAttentionGrabbers] = useState("");
  const [generalInterests, setGeneralInterests] = useState("");
  const [newsStyle, setNewsStyle] = useState("");
  const [newsScope, setNewsScope] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [registrationSent, setRegistrationSent] = useState(false);

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

    if (!email) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading(true);

      const topicsArray = parseArrayField(attentionGrabbers);
      const interestsArray = parseArrayField(generalInterests);

      await registerUser({
        email,
        name: name.trim() || undefined,
        topics: topicsArray,
        interests: interestsArray,
        jobIndustry: jobIndustry.trim() || undefined,
        location: location.trim() || undefined,
        lifeStage: lifeStage.trim() || undefined,
        newsStyle: newsStyle || undefined,
        newsScope: newsScope || undefined,
      });

      setRegistrationSent(true);
    } catch (error: any) {
      console.error("Registration failed:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp) {
      setError('Please enter the verification code.');
      return;
    }

    try {
      setLoading(true);
      const session = await verifyOtp({ email, code: otp });
      if (onRegister) onRegister(session.user.name || email, session.token);
    } catch (error: any) {
      console.error('Verification failed:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Verification failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-box">
      <h2 className="auth-heading">Join IntelliBrief</h2>

      {!registrationSent ? (
        <form className="auth-form" onSubmit={handleSubmit}>
        <label className="question-label">Email</label>
        <input
          className="auth-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your.email@example.com"
        />

        <label className="question-label">Name</label>
        <input
          className="auth-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
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

        {error && (
          <div className="error-message" style={{ color: "red", marginBottom: "10px" }}>
            {error}
          </div>
        )}

        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      ) : (
        <form className="auth-form" onSubmit={handleVerifyOtp}>
          <p style={{ color: '#28a745', textAlign: 'center', marginBottom: '1rem' }}>
            Registration successful! Verification code sent to {email}
          </p>

          <label className="question-label">Enter Verification Code</label>
          <input
            className="auth-input"
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            autoFocus
          />

          {error && (
            <div className="error-message" style={{ color: "red", marginBottom: "10px" }}>
              {error}
            </div>
          )}

          <button
            className="auth-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          <button
            type="button"
            className="auth-link"
            onClick={() => setRegistrationSent(false)}
            style={{ marginTop: '10px', width: '100%', textAlign: 'center' }}
          >
            Change email
          </button>
        </form>
      )}

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
