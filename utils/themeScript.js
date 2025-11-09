// src/utils/themeScript.js

/**
 * This function contains the logic to read the user's saved theme from localStorage
 * or determine the system preference, and immediately apply the 'dark' or 'light'
 * class to the <html> element to prevent a flicker.
 */
export const themeInitializerScript = () => {
  const themes = ["light", "dark", "system"];

  // Script is executed as a string, so all logic must be self-contained
  const codeToRun = `
    (function() {
      // Function to get system preference
      const getSystemTheme = () => {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      };

      let theme = 'system';
      try {
        // 1. Check local storage preference
        const storedTheme = localStorage.getItem('theme');
        if (${JSON.stringify(themes)}.includes(storedTheme)) {
          theme = storedTheme;
        }
      } catch (e) {
        // Handle potential security exceptions if local storage is restricted
        console.error("Could not access localStorage for theme.", e);
      }
      
      // 2. Determine the actual theme class to apply
      const appliedTheme = (theme === 'system') ? getSystemTheme() : theme;

      // 3. Apply the class immediately to the HTML element
      const root = document.documentElement;
      
      // Ensure existing classes are removed (important if browser remembers state)
      root.classList.remove('light', 'dark'); 
      root.classList.add(appliedTheme);

      // Optional: Add a transition block to prevent styles from flickering on change
      // This is often done to disable transitions only on the initial load/switch
      // root.style.cssText = 'transition: none;';
      // root.offsetHeight; // force repaint
      // root.style.cssText = '';
    })();
  `;

  return codeToRun;
};
