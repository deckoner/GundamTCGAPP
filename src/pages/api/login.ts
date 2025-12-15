export const prerender = false;

import type { APIRoute } from "astro";
import prisma from "../../utils/prismaClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

    // Buscar usuario
    const user = await prisma.users.findUnique({
      where: { username },
      select: { id: true, username: true, password_hash: true },
    });

    // Comparación aunque el usuario no exista
    const hashToCompare =
      user?.password_hash ?? "$2a$10$abcdefghijklmnopqrstuv";
    const valid = await bcrypt.compare(password, hashToCompare);

    if (!valid || !user) {
      return redirect(
        "/login?error=" +
          encodeURIComponent("Usuario o contraseña incorrecta."),
      );
    }

    const secret = import.meta.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET no definido");
      return redirect(
        "/login?error=" + encodeURIComponent("Error interno del servidor."),
      );
    }

    // Generar token JWT
    const token = jwt.sign({ id: user.id, username: user.username }, secret, {
      expiresIn: "7d",
      algorithm: "HS256",
    });

    // Configurar cookie de sesión
    cookies.set("session", token, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: import.meta.env.PROD,
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
