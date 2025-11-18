import { Link } from 'react-router-dom';
import { MainMenuBar } from '@/components/MainMenuBar/MainMenuBar';

const baseUrl = import.meta.env.BASE_URL;
const backgroundImage = `${baseUrl}arcus_spire_square.png`;

/**
 * Home/Landing page component
 */
export function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <MainMenuBar />
      
      {/* Background Image Container */}
      <div
        className="flex-1 relative min-h-[calc(100vh-4rem)] bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-surface/20" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-24 md:py-32">
          {/* Main Title */}
          <h1 
            className="font-cinzel text-5xl md:text-7xl lg:text-8xl font-bold text-white-static mb-12 md:mb-16 text-center animate-fade-in"
            style={{
              textShadow: '0 0 10px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 0, 0, 0.2), 0 0 40px rgba(0, 0, 0, 0.1)',
            }}
          >
            The Spires of Arcus
          </h1>

          {/* Main Summary */}
          <p 
            className="text-lg md:text-xl lg:text-2xl text-white-static mb-16 md:mb-20 max-w-3xl text-center animate-slide-down"
            style={{
              textShadow: '0 0 8px rgba(0, 0, 0, 0.4), 0 0 16px rgba(0, 0, 0, 0.3), 0 0 24px rgba(0, 0, 0, 0.2), 0 0 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            A pen and paper tabletop role playing game focused on thrilling tactical combat and evocative role-play in a luminous fantasy setting.
          </p>

          {/* Scroll Button */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <button
              onClick={() => {
                window.scrollTo({
                  top: window.innerHeight,
                  behavior: 'smooth',
                });
              }}
              className="group flex flex-col items-center gap-2 px-6 py-4 bg-gradient-to-br from-accent to-accent-2 rounded-medium shadow-medium hover:shadow-strong transition-all duration-300 hover:scale-105 animate-scroll-button-glow"
              aria-label="Scroll to explore"
            >
              <span className="text-sm md:text-base font-semibold text-dark-static">Scroll to explore</span>
              <svg 
                className="w-6 h-6 md:w-8 md:h-8 text-dark-static group-hover:translate-y-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Feature Sections - Below the fold */}
        <div className="relative z-10 px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto w-full space-y-8 mb-12">
            <FeatureCard
              title="Fast, Tactical Combat"
              description="Every choice matters. Use unique powerful abilities, coordinate with allies, and outsmart foes by exploiting weaknesses."
              link="/full-rules"
              linkText="Learn the Rules"
            />
            <FeatureCard
              title="Luminous Fantasy"
              description="Explore cities protected by soaring spires from radiant elemental storms. Uncover ancient stories across the vibrant world."
              link="/the-world"
              linkText="Explore the World"
            />
            <FeatureCard
              title="Elegant Design"
              description="An RPG designed with elegance and simplicity in mind. Rules are built to fit together, and fit the fantasy."
              link="/full-rules"
              linkText="See the Design"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  link: string;
  linkText: string;
}

function FeatureCard({ title, description, link, linkText }: FeatureCardProps) {
  return (
    <div className="bg-surface bg-opacity-90 backdrop-blur-md rounded-medium p-6 md:p-8 shadow-strong animate-slide-up">
      <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-4 font-cinzel">
        {title}
      </h2>
      <p className="text-base md:text-lg text-text-secondary mb-6">
        {description}
      </p>
      <Link
        to={link}
        className="inline-block px-6 py-3 bg-accent text-surface rounded-soft font-medium hover:bg-opacity-90 transition-smooth shadow-medium"
      >
        {linkText}
      </Link>
    </div>
  );
}

