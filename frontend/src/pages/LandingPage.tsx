import React from 'react';
import '../App.css';

interface LandingPageProps {
  username?: string;
}

const LandingPage = ({ username = 'User' }: LandingPageProps) => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1>Welcome back, {username}!</h1>
      </header>

      <div className="landing-content">
        {/* Left: Personalized Briefing */}
        <aside className="personal-briefing">
          <h2>Your Personalized Briefing</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
            fermentum, urna sed tincidunt mattis, lorem erat tristique sapien,
            ut convallis massa erat et nisl. Suspendisse potenti. Donec
            vehicula, urna at varius viverra, metus erat aliquam lorem, id
            lobortis erat nibh eget turpis. Etiam ac risus nec tortor
            sollicitudin varius. Praesent ut massa id nisl tincidunt dapibus.
            Integer non purus a justo dictum posuere. Vivamus non mauris
            porttitor, tempor massa sed, ultricies libero.
          </p>
          <p>
            Curabitur at neque at sapien dictum pretium. Quisque suscipit
            viverra ligula, et sagittis est. Pellentesque habitant morbi
            tristique senectus et netus et malesuada fames ac turpis egestas.
            Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
            posuere cubilia curae; Sed a augue sit amet libero aliquet
            tincidunt.
          </p>
          <p>
            Donec et odio non sapien scelerisque imperdiet. Fusce vel felis
            convallis, pharetra justo a, dignissim velit. Mauris ac ligula
            eget nulla dapibus vehicula.
          </p>
        </aside>

        {/* Right: Featured Headline */}
        <section className="featured-article">
          <div className="article-filler">
            <h2>Featured Headline</h2>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
