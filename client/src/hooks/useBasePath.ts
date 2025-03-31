// A hook to handle GitHub Pages base path for routing

export function useBasePath() {
  // Get the deployed base path, if any (set in vite.config.ts during the GitHub Pages build)
  // In production this will be '/fit_tracker/'
  const base = import.meta.env.BASE_URL || '/';
  
  // Helper to prepend the base path if in production and not already at root
  const prependBase = (path: string) => {
    // If we're at root or base is /, just return the path
    if (base === '/' || path.startsWith(base)) return path;
    
    // For the specific GitHub repo
    if (path.startsWith('/fit_tracker/')) return path;
    
    // If path already starts with /, join properly
    if (path.startsWith('/')) {
      return `${base}${path}`;
    }
    
    // Otherwise, ensure proper formation with slashes
    return `${base}/${path}`;
  };
  
  return { base, prependBase };
}