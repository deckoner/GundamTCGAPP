import type { MiddlewareHandler } from "astro";
import jwt from "jsonwebtoken";

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { request, cookies, redirect } = context;
  const currentPath = new URL(request.url).pathname;

  if (
    currentPath.startsWith("/login") ||
    currentPath.startsWith("/api/login") ||
    currentPath.startsWith("/api/cron") ||
    currentPath.startsWith("/public") ||
    currentPath.includes("favicon")
  ) {
    return next();
  }

  const token = cookies.get("session")?.value;

  if (!token) {
    context.locals.user = null;
    if (isProtectedRoute(currentPath)) {
      return redirect("/login");
    }
    return next();
  }

  try {
    const decoded = jwt.verify(token, import.meta.env.JWT_SECRET) as {
      id: number;
      username: string;
    };
    context.locals.user = decoded;
  } catch (error) {
    context.locals.user = null;
    if (isProtectedRoute(currentPath)) {
      return redirect("/login");
    }
  }

  return next();
};

function isProtectedRoute(path: string): boolean {
  if (
    path === "/" ||
    path.startsWith("/cartas") ||
    path.startsWith("/login") ||
    path.startsWith("/api/login") ||
    path.startsWith("/api/cron") ||
    path.startsWith("/public") ||
    path.includes("favicon")
  ) {
    return false;
  }
  return true;
}
