import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const theme = {
    darkMode,
    toggleDarkMode,
    colors: {
      background: darkMode ? '#0f0f0f' : '#f0f4f8',
      card: darkMode ? '#1a1a1a' : 'white',
      text: darkMode ? '#f0f0f0' : '#111',
      subtext: darkMode ? '#aaa' : '#666',
      border: darkMode ? '#333' : '#ddd',
      input: darkMode ? '#2a2a2a' : 'white',
      inputBorder: darkMode ? '#333' : '#eee',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);