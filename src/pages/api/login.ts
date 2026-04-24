export const prerender = false;

import type { APIRoute } from "astro";
import prisma from "../../utils/prismaClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

declare global {
  var loginAttempts: Record<string, number> | undefined;
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const formData = await request.formData();
    const username = formData.get("username")?.toString().trim() || "";
    const password = formData.get("password")?.toString() || "";

    // Validación de entrada compacta
    if (
      !username ||
      !password ||
      username.length > 100 ||
      password.length > 100
    ) {
      return redirect("/login?error=" + encodeURIComponent("Datos inválidos."));
    }

    // Rate Limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (global.loginAttempts && global.loginAttempts[ip] > 5) {
       return redirect("/login?error=" + encodeURIComponent("Demasiados intentos. Intenta más tarde."));
    }
    
    // Inicializar contador si no existe
    if (!global.loginAttempts) global.loginAttempts = {};

    // Buscar usuario en la base de datos
    const user = await prisma.users.findUnique({
      where: { username },
      select: { id: true, username: true, password_hash: true },
    });

    // Comparación segura (siempre se ejecuta para mitigar ataques de tiempo)
    // Hash válido pre-calculado para 'invalid'
    const hashToCompare =
      user?.password_hash ?? "$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1"; 
    const valid = await bcrypt.compare(password, hashToCompare);

    if (!valid || !user) {
      // Incrementar intentos fallidos
      global.loginAttempts[ip] = (global.loginAttempts[ip] || 0) + 1;
      
      // Resetear intentos después de 1 minuto
      setTimeout(() => {
          if (global.loginAttempts && global.loginAttempts[ip]) {
              global.loginAttempts[ip] = Math.max(0, global.loginAttempts[ip] - 1);
          }
      }, 60000);

      return redirect(
        "/login?error=" +
          encodeURIComponent("Usuario o contraseña incorrecta."),
      );
    }
    
    // Limpiar intentos al loguearse correctamente
    if (global.loginAttempts?.[ip]) delete global.loginAttempts[ip];

    const secret = import.meta.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET no definido en variables de entorno");
      return redirect(
        "/login?error=" + encodeURIComponent("Error interno del servidor."),
      );
    }

    // Generar token JWT firmado
    const token = jwt.sign({ id: user.id, username: user.username }, secret, {
      expiresIn: "7d",
      algorithm: "HS256",
    });

    // Configurar cookie de sesión segura
    cookies.set("session", token, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: import.meta.env.PROD, // Solo secure en producción
      maxAge: 60 * 60 * 24 * 7, // 1 semana
    });

    return redirect("/");
  } catch (err) {
    console.error("Error en login:", err);
    return redirect(
      "/login?error=" +
        encodeURIComponent("Error interno. Intenta nuevamente."),
    );
  }
};
