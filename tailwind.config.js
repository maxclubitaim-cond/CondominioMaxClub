/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#2563EB",   // Blue-600 (Azul Original)
                secondary: "#0F172A", // Slate-900
                highlight: "#10B981", // Emerald-500 (Verde)
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
