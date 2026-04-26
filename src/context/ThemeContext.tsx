import React, { createContext, useState, useContext, ReactNode } from 'react';

type Theme = 'classic' | 'dark' | 'neon';

interface ThemeContextType {
           theme: Theme;
           setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children
}) => {
 const [theme, setTheme] = useState<Theme>('classic');

 return (
        <ThemeContext.Provider value = {{ theme, setTheme }} >
        {children}
        </ThemeContext.Provider>
 );
};

export const useTheme = () => {
 const context = useContext(ThemeContext);
 if (!context) {
     throw new Error('useTheme must be used within a ThemeProvider');
    }
 return context;

};