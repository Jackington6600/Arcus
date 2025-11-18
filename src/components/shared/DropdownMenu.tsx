import { useEffect, useRef, ReactNode } from 'react';

interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  align?: 'left' | 'right';
}

/**
 * Reusable dropdown menu component that closes on outside click
 */
export function DropdownMenu({
  isOpen,
  onClose,
  children,
  className = '',
  align = 'right',
}: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={`
        absolute z-50 mt-2 min-w-[200px]
        ${align === 'right' ? 'right-0' : 'left-0'}
        bg-surface shadow-strong rounded-medium
        border border-border-light
        animate-slide-down
        ${className}
      `}
    >
      {children}
    </div>
  );
}

