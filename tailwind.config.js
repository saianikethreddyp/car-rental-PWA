/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#000000',
                    50: '#f9f9f9',
                    100: '#f0f0f0',
                    200: '#e0e0e0',
                    300: '#c0c0c0',
                    400: '#a0a0a0',
                    500: '#808080',
                    600: '#606060',
                    700: '#404040',
                    800: '#202020',
                    900: '#101010',
                    950: '#000000',
                },
                secondary: {
                   DEFAULT: '#eeeeee',
                   foreground: '#111827',
                },
                neutral: {
                    50: '#fafafa',
                    100: '#f5f5f5',
                    200: '#e5e5e5',
                    300: '#d4d4d4',
                    400: '#a3a3a3',
                    500: '#737373',
                    600: '#525252',
                    700: '#404040',
                    800: '#262626',
                    900: '#171717',
                    950: '#0a0a0a',
                },
                // Uber-like semantic colors
                surface: '#FFFFFF',
                background: '#FFFFFF',
                text: '#000000',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            spacing: {
                'safe-bottom': 'env(safe-area-inset-bottom)',
                'safe-top': 'env(safe-area-inset-top)',
            },
            minHeight: {
                'touch': '48px',
            },
            minWidth: {
                'touch': '48px',
            }
        },
    },
    plugins: [],
}
