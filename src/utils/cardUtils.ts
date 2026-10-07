/**
 * Genera el HTML para los indicadores (flags) de una carta.
 * Muestra la etiqueta "ALT" para las variantes de arte alternativo.
 *
 * @param carta Objeto con la información de la carta
 * @returns String con el HTML de las etiquetas
 */
export const getCardFlagsHTML = (carta: any) => {
  const isAlt = carta.alt_art === true;
  let flagsHTML = "";

  // Etiqueta para Arte Alternativo
  if (isAlt) {
    flagsHTML += `
      <span class="absolute top-2 right-2 text-black bg-purple-500 text-white font-bold text-xs px-5 py-1 rounded z-10 shadow-lg">
        ALT
      </span>
    `;
  }

  return flagsHTML;
};
