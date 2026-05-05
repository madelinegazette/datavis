/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dracula: {
          bg:          '#282a36',
          bgDark:      '#1e2029',
          line:        '#44475a',
          selection:   '#44475a',
          fg:          '#f8f8f2',
          comment:     '#6272a4',
          cyan:        '#8be9fd',
          green:       '#50fa7b',
          orange:      '#ffb86c',
          pink:        '#ff79c6',
          purple:      '#bd93f9',
          red:         '#ff5555',
          yellow:      '#f1fa8c',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    }
  },
  plugins: []
}
