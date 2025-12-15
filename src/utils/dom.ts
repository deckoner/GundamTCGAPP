/**
 * Función debounce para limitar la frecuencia de ejecución de una función.
 * @param fn La función a ejecutar
 * @param wait Tiempo de espera en milisegundos
 */
export const debounce = (fn: Function, wait = 300) => {
  let t: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
};

/**
 * Crea un elemento DOM con estilos y atributos.
 * @param tag Etiqueta HTML
 * @param styles Objeto con estilos CSS
 * @param text Contenido de texto
 * @param onClick Manejador de evento click
 */
export const crearElemento = (
  tag: string,
  styles: Partial<CSSStyleDeclaration> = {},
  text: string = "",
  onClick?: () => void,
): HTMLElement => {
  const el = document.createElement(tag);
  Object.assign(el.style, styles);
  if (text) el.textContent = text;
  if (onClick) el.addEventListener("click", onClick);
  return el;
};
