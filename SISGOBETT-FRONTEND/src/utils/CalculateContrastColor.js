export const calculateContrastColor = hexColor => {
    // Convierte el color hexadecimal a RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    // Calcula el valor promedio de RGB
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    // Elige el color del texto en función del brillo del color de fondo
    return brightness > 125 ? '#000000' : '#FFFFFF'; // Cambia a blanco o negro dependiendo del brillo
};
