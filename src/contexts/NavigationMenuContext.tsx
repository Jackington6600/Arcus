import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface NavigationMenuContextType {
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
}

const NavigationMenuContext = createContext<NavigationMenuContextType | undefined>(undefined);

export function NavigationMenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openMenu = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <NavigationMenuContext.Provider value={{ isOpen, openMenu, closeMenu, toggleMenu }}>
      {children}
    </NavigationMenuContext.Provider>
  );
}

export function useNavigationMenu() {
  const context = useContext(NavigationMenuContext);
  // Return a no-op implementation if context is not provided
  if (context === undefined) {
    return {
      isOpen: false,
      openMenu: () => {},
      closeMenu: () => {},
      toggleMenu: () => {},
    };
  }
  return context;
}

