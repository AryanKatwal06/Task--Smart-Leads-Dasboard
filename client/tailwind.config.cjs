module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        skin: {
          bg: 'rgb(var(--color-bg) / <alpha-value>)',
          'bg-elevated': 'rgb(var(--color-bg-elevated) / <alpha-value>)',
          border: 'rgb(var(--color-border) / <alpha-value>)',
          text: 'rgb(var(--color-text) / <alpha-value>)',
          'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
          accent: 'rgb(var(--color-accent) / <alpha-value>)',
          'accent-strong': 'rgb(var(--color-accent-strong) / <alpha-value>)',
          success: 'rgb(var(--color-success) / <alpha-value>)',
          warning: 'rgb(var(--color-warning) / <alpha-value>)',
          danger: 'rgb(var(--color-danger) / <alpha-value>)'
        }
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)'
      },
      spacing: {
        'card-padding': 'var(--card-padding)'
      },
      boxShadow: {
        glass: 'var(--glass-elevation)',
        'glass-strong': 'var(--glass-elevation-strong)'
      },
      transitionDuration: {
        motion: 'var(--motion-duration)'
      }
    },
  },
  plugins: [],
};
