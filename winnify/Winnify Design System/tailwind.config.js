/** @type {import('tailwindcss').Config} */
// Winnify design system → Tailwind theme.
// Colors reference the CSS custom properties in winnify-design-system.css, so
// light/dark modes (driven by [data-theme]) work automatically. Import that
// CSS file once globally, then use the utilities below (e.g. bg-brand,
// text-muted, rounded-md, shadow-md, font-display).
//
// Dark mode: this kit toggles via a [data-theme="dark"] attribute, so set:
//   darkMode: ['selector', '[data-theme="dark"]']

module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        // Brand / primary
        brand: {
          DEFAULT: 'var(--brand)',
          fg:      'var(--brand-fg)',
          hover:   'var(--brand-hover)',
          pressed: 'var(--brand-pressed)',
        },
        // Surfaces
        canvas:  'var(--app-bg)',
        card:    'var(--card)',
        muted:   'var(--surface-muted)',
        overlay: 'var(--overlay)',
        // Text
        text: {
          DEFAULT: 'var(--text)',
          muted:   'var(--text-muted)',
          subtle:  'var(--text-subtle)',
          inverse: 'var(--text-inverse)',
        },
        // Lines & inputs
        border:  'var(--border)',
        ring:    'var(--ring)',
        input: {
          bg:          'var(--input-bg)',
          fg:          'var(--input-fg)',
          placeholder: 'var(--input-placeholder)',
        },
        // Sidebar
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          active:  'var(--sidebar-active)',
          fg:      'var(--sidebar-fg)',
        },
        // Semantic
        success: { DEFAULT: 'var(--color-success)', muted: 'var(--color-success-muted)' },
        warning: { DEFAULT: 'var(--color-warning)', muted: 'var(--color-warning-muted)' },
        error:   { DEFAULT: 'var(--color-error)',   muted: 'var(--color-error-muted)' },
        info:    { DEFAULT: 'var(--color-info)',    muted: 'var(--color-info-muted)' },
        wordmark: 'var(--wordmark)',
      },

      fontFamily: {
        sans:    ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fredoka', 'Onest', 'DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['ui-monospace', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },

      fontSize: {
        // [size, line-height]
        mini:  ['10px', { lineHeight: '1.4' }],
        xs:    ['12px', { lineHeight: '1.4' }],
        label: ['13px', { lineHeight: '1.4' }],
        sm:    ['14px', { lineHeight: '1.5' }],   // default body
        md:    ['15px', { lineHeight: '1.5' }],
        base:  ['16px', { lineHeight: '1.4' }],
        lg:    ['20px', { lineHeight: '1.2' }],   // h2
        xl:    ['24px', { lineHeight: '1.2' }],   // h1
        kpi:   ['28px', { lineHeight: '1' }],
      },

      fontWeight: {
        regular:  '400',
        medium:   '500',
        semibold: '600',
        bold:     '700',
        display:  '800',
      },

      letterSpacing: {
        tight: '-0.02em',
        snug:  '-0.01em',
        wide:  '0.08em',
      },

      // Figma spacing scale (in addition to Tailwind defaults)
      spacing: {
        0: '0px',
        1: '2px',
        2: '4px',
        3: '8px',
        4: '12px',
        5: '16px',
        6: '20px',
        7: '24px',
        8: '32px',
      },

      borderRadius: {
        none: '0px',
        xs:   '2px',
        sm:   '4px',
        md:   '8px',    // default — buttons, inputs, cards
        lg:   '12px',
        xl:   '20px',   // pills
        '2xl':'48px',
        full: '999px',
      },

      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 1px 0 rgb(0 0 0 / 0.03)',
        md: '0 4px 8px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        lg: '0 12px 24px -6px rgb(0 0 0 / 0.10), 0 4px 8px -4px rgb(0 0 0 / 0.06)',
      },
    },
  },
  plugins: [],
};
