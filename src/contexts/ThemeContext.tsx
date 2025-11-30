import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  foregroundColor: string;
  mutedColor: string;
  borderRadius: string;
  fontHeading: string;
  fontBody: string;
  darkMode: {
    backgroundColor: string;
    foregroundColor: string;
    mutedColor: string;
  };
}

const DEFAULT_THEME: ThemeConfig = {
  primaryColor: "160 84% 39%",
  secondaryColor: "160 60% 45%",
  accentColor: "38 92% 50%",
  backgroundColor: "0 0% 100%",
  foregroundColor: "160 50% 10%",
  mutedColor: "160 20% 96%",
  borderRadius: "0.5rem",
  fontHeading: "Poppins",
  fontBody: "Inter",
  darkMode: {
    backgroundColor: "160 50% 5%",
    foregroundColor: "160 20% 98%",
    mutedColor: "160 30% 15%",
  },
};

const FONT_URLS: Record<string, string> = {
  "Inter": "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
  "Poppins": "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap",
  "Roboto": "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap",
  "Open Sans": "https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap",
  "Lato": "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap",
  "Montserrat": "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap",
  "Playfair Display": "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap",
  "Merriweather": "https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap",
  "Source Sans Pro": "https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap",
  "Nunito": "https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap",
  "Raleway": "https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700&display=swap",
  "Work Sans": "https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&display=swap",
};

interface ThemeContextType {
  theme: ThemeConfig;
  loading: boolean;
  updateTheme: (newTheme: Partial<ThemeConfig>) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());

  // Load font dynamically
  const loadFont = (fontName: string) => {
    if (loadedFonts.has(fontName) || !FONT_URLS[fontName]) return;
    
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_URLS[fontName];
    document.head.appendChild(link);
    setLoadedFonts((prev) => new Set(prev).add(fontName));
  };

  // Apply theme to CSS variables
  const applyTheme = (themeConfig: ThemeConfig) => {
    const root = document.documentElement;
    
    // Load fonts
    loadFont(themeConfig.fontHeading);
    loadFont(themeConfig.fontBody);

    // Apply CSS variables
    root.style.setProperty("--primary", themeConfig.primaryColor);
    root.style.setProperty("--secondary", themeConfig.secondaryColor);
    root.style.setProperty("--accent", themeConfig.accentColor);
    root.style.setProperty("--muted", themeConfig.mutedColor);
    root.style.setProperty("--radius", themeConfig.borderRadius);
    root.style.setProperty("--font-heading", themeConfig.fontHeading);
    root.style.setProperty("--font-body", themeConfig.fontBody);

    // Check if dark mode
    const isDark = root.classList.contains("dark");
    if (isDark && themeConfig.darkMode) {
      root.style.setProperty("--background", themeConfig.darkMode.backgroundColor);
      root.style.setProperty("--foreground", themeConfig.darkMode.foregroundColor);
      root.style.setProperty("--muted", themeConfig.darkMode.mutedColor);
    } else {
      root.style.setProperty("--background", themeConfig.backgroundColor);
      root.style.setProperty("--foreground", themeConfig.foregroundColor);
    }

    // Apply font families to body
    document.body.style.fontFamily = `"${themeConfig.fontBody}", sans-serif`;
  };

  // Fetch theme from database
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const { data, error } = await supabase
          .from("site_config")
          .select("config_value")
          .eq("config_key", "theme")
          .maybeSingle();

        if (error) throw error;

        if (data?.config_value && typeof data.config_value === "object") {
          const configValue = data.config_value as Partial<ThemeConfig>;
          const fetchedTheme: ThemeConfig = { ...DEFAULT_THEME, ...configValue };
          setTheme(fetchedTheme);
          applyTheme(fetchedTheme);
        } else {
          applyTheme(DEFAULT_THEME);
        }
      } catch (error) {
        console.error("Error fetching theme:", error);
        applyTheme(DEFAULT_THEME);
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, []);

  // Re-apply theme when dark mode changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          applyTheme(theme);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, [theme]);

  const updateTheme = async (newTheme: Partial<ThemeConfig>) => {
    const updatedTheme = { ...theme, ...newTheme };
    setTheme(updatedTheme);
    applyTheme(updatedTheme);

    try {
      await supabase
        .from("site_config")
        .update({ config_value: updatedTheme })
        .eq("config_key", "theme");
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, loading, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export const AVAILABLE_FONTS = Object.keys(FONT_URLS);
