import React, { createContext, useContext, useEffect, useState, useTransition } from 'react';

interface NavigationContextType {
  pathname: string;
  searchParams: URLSearchParams;
  navigate: (path: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [searchParams, setSearchParams] = useState<URLSearchParams>(
    () => new URLSearchParams(window.location.search)
  );
  const [, startTransition] = useTransition();

  useEffect(() => {
    const handlePopState = () => {
      startTransition(() => {
        setCurrentPath(window.location.pathname || '/');
        setSearchParams(new URLSearchParams(window.location.search));
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (pathWithSearch: string) => {
    if (pathWithSearch === currentPath) return;

    window.history.pushState({}, '', pathWithSearch);
    const [pathOnly, searchOnly] = pathWithSearch.split('?');
    startTransition(() => {
      setCurrentPath(pathOnly || '/');
      setSearchParams(new URLSearchParams(searchOnly || ''));
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NavigationContext.Provider
      value={{
        pathname: currentPath,
        searchParams,
        navigate,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

export const Link: React.FC<{
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ href, className, children, onClick }) => {
  const { navigate } = useNavigation();

  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
};
