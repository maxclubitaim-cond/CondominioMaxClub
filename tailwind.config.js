/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#3B82F6",
                secondary: "#EF4444",
                highlight: "#10B981",
            },
            boxShadow: {
                'premium': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                'glow': '0 0 15px -3px rgba(59, 130, 246, 0.4)',
            },
            borderRadius: {
                'xl': '1rem',
            }
        },
    },
    plugins: [],
}
