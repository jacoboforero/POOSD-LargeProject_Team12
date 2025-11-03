import React, { useState } from "react";
import axios from "axios";

interface RegisterProps {
  onNavigateToLogin?: () => void;
  onRegister?: (username: string) => void;
}

const Register = ({ onNavigateToLogin, onRegister }: RegisterProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [topics, setTopics] = useState("");
  const [interests, setInterests] = useState("");
  const [jobIndustry, setJobIndustry] = useState("");
  const [demographic, setDemographic] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !username ||
      !password ||
      !topics ||
      !interests ||
      !jobIndustry ||
      !demographic
    ) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/auth/register", {
        firstName,
        lastName,
        email,
        username,
        password,
        topics,
        interests,
        jobIndustry,
        demographic,
      });

      alert("Registration successful! You can now log in.");
      if (onRegister) onRegister(username);
      if (onNavigateToLogin) onNavigateToLogin();
    } catch (error: any) {
      console.error("Registration failed:", error.response?.data || error.message);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-box">
      <h2 className="auth-heading">Create Your IntelliBrief Account</h2>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="question-label">First Name</label>
        <input
          className="auth-input"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <label className="question-label">Last Name</label>
        <input
          className="auth-input"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <label className="question-label">Email</label>
        <input
          className="auth-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="question-label">Username</label>
        <input
          className="auth-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label className="question-label">Password</label>
        <input
          className="auth-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="personalization-section">
          <h3 className="section-title">🗞️ Personalize Your Daily Briefing</h3>
          <p className="section-subtitle">Let’s learn a bit about your news style</p>

          <label className="question-label">
            📰 What topics make headlines in your world?
          </label>
          <input
            className="auth-input"
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
          />

          <label className="question-label">
            💡 What subjects always catch your curiosity?
          </label>
          <input
            className="auth-input"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
          />

          <label className="question-label">
            💼 What industry are you part of (or dreaming of joining)?
          </label>
          <input
            className="auth-input"
            value={jobIndustry}
            onChange={(e) => setJobIndustry(e.target.value)}
          />

          <label className="question-label">
            👤 How would you describe yourself as a reader?
          </label>
          <input
            className="auth-input"
            value={demographic}
            onChange={(e) => setDemographic(e.target.value)}
          />
        </div>

        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
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
