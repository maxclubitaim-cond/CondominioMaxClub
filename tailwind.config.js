/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#F2A94A",
                secondary: "#EB6049",
                highlight: "#2B9E53",
            },
            boxShadow: {
                'premium': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            },
            borderRadius: {
                'xl': '1rem',
            }
        },
    },
    plugins: [],
}
