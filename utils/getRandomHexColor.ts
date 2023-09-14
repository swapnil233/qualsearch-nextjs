// Define types for colors and themes
type HexColor = `#${string}`;
interface ColorSet {
    bg: HexColor;
    text: HexColor;
}
interface ThemeColors {
    darkMode: ColorSet;
    lightMode: ColorSet;
}

// Helper function to generate a random hex color.
function getRandomHexColor(): HexColor {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color as HexColor;
}

// Helper function to darken a hex color.
function darkenColor(hex: HexColor, factor: number): HexColor {
    if (!/^#[0-9A-F]{6}$/i.test(hex)) {
        throw new Error("Invalid Hex Color");
    }

    const f = Math.min(Math.max(factor, 0), 1);
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = Math.floor(R * (1 - f));
    G = Math.floor(G * (1 - f));
    B = Math.floor(B * (1 - f));

    return `#${(1 << 24) + (R << 16) + (G << 8) + B
        }`.slice(1).toUpperCase() as HexColor;
}

// Function to generate dark and light mode colors.
function generateThemeColors(): ThemeColors {
    const darkBg = getRandomHexColor();
    const darkText = darkenColor(darkBg, 0.5);  // darkening by 50%

    const lightBg = `#${('FFFFFF' + getRandomHexColor().slice(1))
        .slice(-6)
        .toUpperCase()}` as HexColor; // blending with white to ensure it's lighter
    const lightText = darkenColor(lightBg, 0.3);  // darkening by 30%

    return {
        darkMode: { bg: darkBg, text: darkText },
        lightMode: { bg: lightBg, text: lightText }
    };
}

export default generateThemeColors;
