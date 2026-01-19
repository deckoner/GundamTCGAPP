import type { MiddlewareHandler } from "astro";
import jwt from "jsonwebtoken";

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = [
  "/login",
  "/api/login",
  "/api/cron",
];

/**
 * Verifica si una ruta es pública.
 * @param path La ruta a verificar.
 * @returns true si la ruta es pública, false en caso contrario.
 */
function isPublic(path: string): boolean {
  // Permitir archivos estáticos y favicon
  if (path.startsWith("/public") || path.includes("favicon")) {
    return true;
  }
  return PUBLIC_ROUTES.some((route) => path.startsWith(route));
}

/**
 * Verifica si la ruta actual es la página de login.
 * @param path La ruta a verificar.
 * @returns true si es la página de login.
 */
function isLoginPage(path: string): boolean {
  return path === "/login" || path === "/login/";
}

// Middleware principal para manejar la autenticación
export const onRequest: MiddlewareHandler = async (context, next) => {
  const { request, cookies, redirect } = context;
  const currentPath = new URL(request.url).pathname;
  const token = cookies.get("session")?.value;

  let user = null;

  // Si existe un token, intentar verificarlo
  if (token) {
    try {
      const decoded = jwt.verify(token, import.meta.env.JWT_SECRET) as {
        id: number;
        username: string;
      };
      user = decoded;
    } catch (error) {
      // El token es inválido o ha expirado
      user = null;
    }
  }

  // Guardar la información del usuario en el contexto
  context.locals.user = user;

  // Manejo de redirecciones basado en el estado de autenticación
  if (user) {
    // Si el usuario ya está autenticado e intenta ir al login, redirigir al inicio
    if (isLoginPage(currentPath)) {
      return redirect("/");
    }
    // Permitir el acceso a cualquier otra ruta protegida
    return next();
  }

  // Si el usuario NO está autenticado
  if (
    isPublic(currentPath) ||
    // Permitir ver cartas individuales (ruta dinámica)
    (currentPath.startsWith("/cartas/") && currentPath !== "/cartas/")
  ) {
    return next();
  }

  // Si intenta acceder a una ruta protegida sin sesión, redirigir al login
  return redirect("/login");
};
