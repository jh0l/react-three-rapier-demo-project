type COLOR =
    | "black"
    | "white"
    | "red"
    | "green"
    | "blue"
    | "yellow"
    | "cyan"
    | "magenta";

export function getColorName(rgb: number[]): COLOR {
    const [red, green, blue] = rgb;

    // Calculate the color's brightness using the YIQ formula
    const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

    // Determine which color the RGB value maps to
    if (brightness < 128) {
        return "black";
    } else if (brightness > 192) {
        if (red > green && red > blue) {
            return "red";
        } else if (green > red && green > blue) {
            return "green";
        } else if (blue > red && blue > green) {
            return "blue";
        } else {
            return "white";
        }
    } else {
        if (red > green && red > blue && green + blue < red) {
            return "red";
        } else if (green > red && green > blue && red + blue < green) {
            return "green";
        } else if (blue > red && blue > green && red + green < blue) {
            return "blue";
        } else if (red > green && blue > green) {
            return "yellow";
        } else if (green > red && blue > red) {
            return "cyan";
        } else if (red > blue && green > blue) {
            return "magenta";
        } else {
            return "white";
        }
    }
}
