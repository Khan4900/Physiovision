// Updated theme based on the provided palette image
// Do not rename the export — this file applies to the project as requested.

export const theme = {
  colors: {
    primary: {
      // Palette from the image
      black: '#030E16',        // "Black" (main dark)
      blue: '#2D90E0',         // Primary Blue
      pink: '#FF118C',         // Secondary Pink
      green: '#4DC53C',        // Healthy Green
      blueLight: '#78B9E9',    // lighter blue used for gradients/backgrounds
      darkGray: '#4a5568',     // Dark Gray for secondary text 
    },
    // subtle background tints (match the "20%" rows / backgrounds in the image)
    background: {
      main: '#ffffff',         // white background
      sidebar: '#f6f9fc',      // very light tint used for panels / sidebars
      card: '#ffffff',         // cards remain white for contrast
      softBlue: '#eaf6fd',     // very pale blue (20% tint)
      softPink: '#fff0f6',     // very pale pink (20% tint)
      softGreen: '#f0f7ea',    // very pale green (20% tint)
    },
    text: {
      primary: '#030E16',      // dark primary text (matches Black)
      secondary: '#5f6569',    // muted text for descriptions / meta
      light: '#ffffff',        // light text for colored backgrounds
    },
    border: {
      light: '#e6e9eb',        // soft border color
      focus: '#2D90E0',        // focus/border highlight uses Primary Blue
    }
  },
  gradients: {
    // Primary gradient changed to blue -> pink as requested
    primary: 'linear-gradient(135deg, #2D90E0 0%, #FF118C 100%)',
    // Hover variant: slightly shifted stops for a lively transition between blue and pink
    primaryHover: 'linear-gradient(90deg, #2D90E0 10%, #7bb8e8 50%, #FF118C 100%)',
    // Subtle: soft white -> pale blue (used for backgrounds)
    subtle: 'linear-gradient(135deg, #ffffff 0%, #eaf6fd 100%)',
    // Warm / soft pink + blue background (matches the soft background swatch)
    warm: 'linear-gradient(135deg, #ffffff 0%, #fff0f6 40%, #eaf6fd 100%)',
    // Icon: strong blue to pink vertical gradient (matches the Icon swatch)
    icon: 'linear-gradient(180deg, #2D90E0 0%, #FF118C 100%)',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  }
};

export default theme;