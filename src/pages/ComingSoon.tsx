import { MainMenuBar } from '@/components/MainMenuBar/MainMenuBar';

interface ComingSoonProps {
  title: string;
}

/**
 * Generic "Coming Soon" page component
 */
export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <MainMenuBar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-cinzel font-bold text-text-primary mb-4">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary">
            Coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}

