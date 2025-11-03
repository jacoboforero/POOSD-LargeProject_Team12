import { useEffect, useState } from "react";
import axios from "axios";

const LandingPage = ({ username }: { username: string }) => {
  const [briefing, setBriefing] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBriefing = async () => {
      try {
        const response = await axios.get(`/api/briefing/${username}`);
        setBriefing(response.data.briefing || "No personalized briefing available yet.");
      } catch (err) {
        console.error(err);
        setBriefing("Failed to load briefing. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBriefing();
  }, [username]);

  return (
    <div className="landing-page">
      <div className="landing-header">
        <h1>Welcome back, {username}</h1>
      </div>

      <div className="landing-content">
        <div className="personal-briefing">
          <h2>🗞️ Your AI-Powered Briefing</h2>
          {loading ? (
            <p>Generating your custom news feed...</p>
          ) : (
            <p>{briefing}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
