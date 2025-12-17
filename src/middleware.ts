import type { MiddlewareHandler } from "astro";
import jwt from "jsonwebtoken";

const PUBLIC_ROUTES = [
  "/login",
  "/api/login",
  "/api/cron",
];

function isPublic(path: string): boolean {
  if (path.startsWith("/public") || path.includes("favicon")) {
    return true;
  }
  return PUBLIC_ROUTES.some((route) => path.startsWith(route));
}

function isLoginPage(path: string): boolean {
  return path === "/login" || path === "/login/";
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { request, cookies, redirect } = context;
  const currentPath = new URL(request.url).pathname;
  const token = cookies.get("session")?.value;

  let user = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, import.meta.env.JWT_SECRET) as {
        id: number;
        username: string;
      };
      user = decoded;
    } catch (error) {
      // Token inválido o expirado
      user = null;
    }
  }

  context.locals.user = user;

  // Si el usuario está autenticado
  if (user) {
    // Si intenta acceder al login, redirigir al inicio (index)
    if (isLoginPage(currentPath)) {
      return redirect("/");
    }
    // Permitir acceso a cualquier otra parte
    return next();
  }

  // Si el usuario NO está autenticado
  // Permitir rutas públicas
  if (isPublic(currentPath)) {
    return next();
  }

  // Redirigir a login para cualquier otra ruta
  return redirect("/login");
};
