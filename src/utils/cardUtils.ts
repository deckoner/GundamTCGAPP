/**
 * Genera el HTML para los indicadores (flags) de una carta.
 * Muestra etiquetas para cartas "ALT" (Arte Alternativo) y "BETA".
 *
 * @param carta Objeto con la información de la carta
 * @returns String con el HTML de las etiquetas
 */
export const getCardFlagsHTML = (carta: any) => {
  // Verificar si la carta pertenece a las ediciones Beta
  const isBeta = [15, 35, 42].includes(carta.belongs_gd_id ?? -1);
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

  // Etiqueta para Edición Beta
  if (isBeta) {
    // Si ya tiene etiqueta ALT, bajar la etiqueta BETA
    const betaTop = isAlt ? "top-10" : "top-2";
    flagsHTML += `
      <span class="absolute ${betaTop} right-2 text-black font-bold text-xs px-5 py-1 rounded z-10 shadow-lg"
            style="background-color: var(--color-accent);">
        BETA
      </span>
    `;
  }

  return flagsHTML;
};
