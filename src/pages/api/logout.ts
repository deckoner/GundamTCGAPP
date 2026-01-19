export const prerender = false;

import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ cookies, redirect }) => {
  // Eliminar la cookie de sesión para cerrar sesión
  cookies.delete("session", { path: "/" });
  return redirect("/login");
};
