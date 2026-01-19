export type ToastType = "success" | "error" | "info";

/**
 * Muestra una notificación tipo Toast en la interfaz.
 * @param message Mensaje a mostrar
 * @param type Tipo de notificación (éxito, error, info)
 */
export function showToast(message: string, type: ToastType = "info"): void {
  const container = document.getElementById("toast-container");

  if (!container) {
    console.warn("Contenedor de Toasts no encontrado en el DOM");
    return;
  }

  const toast = document.createElement("div");

  // Estilos del Toast (Tailwind CSS)
  toast.className = `
    pointer-events-auto
    flex
    items-center
    gap-3
    px-4
    py-3
    rounded-lg
    shadow-lg
    backdrop-blur-md
    border
    transition-all
    duration-300
    transform
    translate-y-10
    opacity-0
    ${
      type === "error"
        ? "bg-red-900/90 border-red-500/50 text-white"
        : type === "success"
        ? "bg-green-900/90 border-green-500/50 text-white"
        : "bg-slate-900/90 border-slate-500/50 text-white"
    }
  `;

  toast.innerHTML = `<span class="text-sm font-medium">${message}</span>`;
  container.appendChild(toast);

  // Animación de entrada
  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-10", "opacity-0");
  });

  // Animación de salida y eliminación automática
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    // Esperar a que termine la transición CSS antes de eliminar del DOM
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
