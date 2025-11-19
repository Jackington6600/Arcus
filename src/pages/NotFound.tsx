import { Link } from 'react-router-dom';
import { MainMenuBar } from '@/components/MainMenuBar/MainMenuBar';

/**
 * 404 Not Found page component
 */
export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <MainMenuBar />
      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="text-center max-w-2xl">
          <h1 className="text-6xl md:text-8xl font-bold text-text-primary mb-4 font-cinzel">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-4 font-cinzel">
            Page Not Found
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-accent text-surface rounded-soft font-medium hover:bg-opacity-90 transition-smooth shadow-medium"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

