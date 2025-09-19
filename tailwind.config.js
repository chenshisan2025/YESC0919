/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F8F2ED',
        card: '#EFE8E1',
        brown: '#4A423B',
        gold: '#FFD700',
        orange: '#F28C28',
        magenta: '#FF0077',
        dark: '#2B2520'
      },
      fontFamily: {
        press: ['"Press Start 2P"', 'ZCOOL KuaiLe', 'monospace'],
        pixel: ['Silkscreen', 'ZCOOL KuaiLe', 'sans-serif']
      },
      boxShadow: {
        pixel: '4px 4px 0 0 rgba(74,66,59,0.8)',
        pixelLg: '6px 6px 0 0 rgba(74,66,59,0.9)',
        pixelHover: '6px 6px 0 0 rgba(74,66,59,1)',
        pixelPressed: '2px 2px 0 0 rgba(74,66,59,0.8)'
      },
      backgroundImage: {
        noise: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)',
        grain: 'repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(74,66,59,0.03) 1px, rgba(74,66,59,0.03) 2px)'
      },
      backgroundSize: {
        noise: '8px 8px',
        grain: '4px 4px'
      },
      animation: {
        'pixel-bounce': 'pixelBounce 0.2s ease-in-out',
        'pixel-glow': 'pixelGlow 2s ease-in-out infinite alternate',
        'progress-fill': 'progressFill 0.5s ease-out',
        'counter-up': 'counterUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out'
      },
      keyframes: {
        pixelBounce: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' }
        },
        pixelGlow: {
          '0%': { boxShadow: '4px 4px 0 0 rgba(74,66,59,0.8)' },
          '100%': { boxShadow: '6px 6px 0 0 rgba(255,215,0,0.6)' }
        },
        progressFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width)' }
        },
        counterUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { height: '0', opacity: '0' },
          '100%': { height: 'auto', opacity: '1' }
        },
        slideUp: {
          '0%': { height: 'auto', opacity: '1' },
          '100%': { height: '0', opacity: '0' }
        }
      },
      scale: {
        '102': '1.02',
        '105': '1.05'
      }
    },
  },
  plugins: [],
}
