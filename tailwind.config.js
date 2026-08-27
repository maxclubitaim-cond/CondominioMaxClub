/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#F97316",   // Orange-500 (Laranja - Cor Oficial Permanente)
                secondary: "#0F172A", // Slate-900
                highlight: "#10B981", // Emerald-500 (Verde)
            },
            boxShadow: {
                'premium': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                'glow': '0 0 15px -3px rgba(249, 115, 22, 0.4)', // Orange glow
            },
            borderRadius: {
                'xl': '1rem',
            }
        },
    },
    plugins: [],
}
