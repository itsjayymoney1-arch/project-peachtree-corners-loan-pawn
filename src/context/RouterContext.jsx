import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const RouterContext = createContext(null);

export function RouterProvider({ children }) {
  // Determine initial path from hash or pathname
  const getInitialPath = () => {
    if (typeof window === 'undefined') return '/';
    
    // Check if hash has a route (e.g. #/shop or #shop)
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      const cleanHash = hash.replace(/^#\/?/, '/');
      return cleanHash.split('?')[0] || '/';
    }

    // Otherwise check pathname relative to base
    const path = window.location.pathname;
    // Check if path ends with any of our known routes
    const routes = [
      '/vault',
      '/shop',
      '/cart',
      '/checkout',
      '/order-confirmation',
      '/account',
      '/auth',
      '/admin',
      '/jewelry',
      '/electronics',
      '/tools',
      '/musical-instruments',
      '/sell-to-us',
      '/pawn-loans',
      '/about',
      '/contact',
      '/new-arrivals',
      '/unsubscribe'
    ];
    for (const r of routes) {
      if (path.endsWith(r)) return r;
    }
    return '/';
  };

  const getInitialQuery = () => {
    if (typeof window === 'undefined') return {};
    const hash = window.location.hash;
    let search = window.location.search;
    if (hash && hash.includes('?')) {
      search = '?' + hash.split('?')[1];
    }
    const params = new URLSearchParams(search);
    const obj = {};
    for (const [key, val] of params.entries()) {
      obj[key] = val;
    }
    return obj;
  };

  const [currentPath, setCurrentPath] = useState(getInitialPath);
  const [queryParams, setQueryParams] = useState(getInitialQuery);

  const navigate = useCallback((to, params = {}) => {
    let cleanPath = to.startsWith('/') ? to : '/' + to;
    // Strip hash if given
    cleanPath = cleanPath.replace(/^#\/?/, '/');
    
    // Build query string if any
    const queryString = new URLSearchParams(params).toString();
    const fullHash = cleanPath === '/' 
      ? (queryString ? `?${queryString}` : '') 
      : `#${cleanPath}${queryString ? '?' + queryString : ''}`;

    // Update state
    setCurrentPath(cleanPath);
    setQueryParams(params);

    // Update browser URL via hash for guaranteed static compatibility
    if (typeof window !== 'undefined') {
      if (fullHash) {
        window.location.hash = fullHash;
      } else {
        // clear hash without reload
        window.history.pushState("", document.title, window.location.pathname + window.location.search);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const path = getInitialPath();
      const params = getInitialQuery();
      setCurrentPath(path);
      setQueryParams(params);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  return (
    <RouterContext.Provider value={{ currentPath, queryParams, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}
