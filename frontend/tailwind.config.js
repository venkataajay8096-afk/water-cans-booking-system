/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ocean: {
          darkest: '#03045E',
          dark:    '#0077B6',
          mid:     '#00B4D8',
          light:   '#90E0EF',
          lightest:'#CAF0F8',
        },
        success: '#06D6A0',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter:  ['Inter', 'sans-serif'],
      },
      animation: {
        'wave-move':      'waveMove 4s linear infinite',
        'wave-move-slow': 'waveMove 6s linear infinite reverse',
        'wave-move-slower':'waveMove 8s linear infinite',
        'bubble-rise':    'bubbleRise 8s ease-in infinite',
        'float-cool':     'floatUpDown 3s ease-in-out infinite',
        'float-norm':     'floatUpDownAlt 3s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'slide-in-bottom':'slideInBottom 0.5s ease-out both',
        'pulse-glow':     'pulseGlow 2s ease-in-out infinite',
        'draw-check':     'drawCheckmark 1.2s ease-out 0.3s forwards',
        'splash-burst':   'splashBurst 1s ease-out forwards',
        'confetti-fall':  'confettiFall linear forwards',
        'fade-slide':     'fadeSlide 0.4s ease-out both',
        'scale-in':       'scaleIn 0.4s ease-out both',
        'price-flash':    'priceFlash 0.4s ease-out',
        'coin-float':     'coinFloat ease-out forwards',
        'spin-slow':      'spinSlow 8s linear infinite',
        'shimmer':        'shimmer 1.5s ease-in-out infinite',
        'bounce-dot':     'bounceDot 1s ease-in-out infinite',
        'water-drop':     'waterDrop 2s ease-in-out infinite',
        'marker-pulse':   'markerPulse 1.5s ease-out infinite',
        'ice-rotate':     'iceRotate 4s linear infinite',
        'ice-rotate-rev': 'iceRotate 5s linear infinite reverse',
      },
      keyframes: {
        waveMove: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        bubbleRise: {
          '0%':   { transform: 'translateY(100vh) scale(0.6)', opacity: '0' },
          '10%':  { opacity: '0.7' },
          '80%':  { opacity: '0.4' },
          '100%': { transform: 'translateY(-120px) scale(1)', opacity: '0' },
        },
        floatUpDown: {
          '0%':   { transform: 'translateY(0px) rotate(-3deg)' },
          '25%':  { transform: 'translateY(-12px) rotate(-1deg)' },
          '50%':  { transform: 'translateY(-20px) rotate(3deg)' },
          '75%':  { transform: 'translateY(-10px) rotate(1deg)' },
          '100%': { transform: 'translateY(0px) rotate(-3deg)' },
        },
        floatUpDownAlt: {
          '0%':   { transform: 'translateY(-20px) rotate(3deg)' },
          '25%':  { transform: 'translateY(-10px) rotate(1deg)' },
          '50%':  { transform: 'translateY(0px) rotate(-3deg)' },
          '75%':  { transform: 'translateY(-12px) rotate(-1deg)' },
          '100%': { transform: 'translateY(-20px) rotate(3deg)' },
        },
        gradientShift: {
          '0%':   { backgroundPosition: '0% 50%' },
          '25%':  { backgroundPosition: '50% 0%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '75%':  { backgroundPosition: '50% 100%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        rippleExpand: {
          '0%':   { transform: 'scale(0)', opacity: '0.8' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        iceRotate: {
          '0%':   { transform: 'rotate(0deg) translateX(80px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(80px) rotate(-360deg)' },
        },
        slideInBottom: {
          '0%':   { transform: 'translateY(60px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        drawCheckmark: {
          '0%':   { strokeDashoffset: '200', opacity: '1' },
          '100%': { strokeDashoffset: '0',   opacity: '1' },
        },
        splashBurst: {
          '0%':   { transform: 'scale(0)', opacity: '1' },
          '60%':  { opacity: '0.6' },
          '100%': { transform: 'scale(3.5)', opacity: '0' },
        },
        confettiFall: {
          '0%':   { transform: 'translateY(-20px) rotate(0deg)',   opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: '0.2' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,119,182,0.4), 0 0 40px rgba(0,180,216,0.2)' },
          '50%':      { boxShadow: '0 0 40px rgba(0,119,182,0.8), 0 0 80px rgba(0,180,216,0.4)' },
        },
        fadeSlide: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        priceFlash: {
          '0%':   { color: 'inherit', transform: 'scale(1)' },
          '30%':  { color: '#10b981', transform: 'scale(1.25)' },
          '100%': { color: 'inherit', transform: 'scale(1)' },
        },
        coinFloat: {
          '0%':   { transform: 'translateY(0) rotate(0deg)',   opacity: '1' },
          '100%': { transform: 'translateY(-80px) rotate(360deg)', opacity: '0' },
        },
        spinSlow: {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceDot: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        waterDrop: {
          '0%':   { transform: 'translateY(-10px) scale(0.9)', opacity: '0.8' },
          '50%':  { transform: 'translateY(5px) scale(1.05)',  opacity: '1'   },
          '100%': { transform: 'translateY(-10px) scale(0.9)', opacity: '0.8' },
        },
        markerPulse: {
          '0%':   { transform: 'scale(1)',   opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
