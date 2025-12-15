export const prerender = false;

import type { APIRoute } from "astro";
import prisma from "../../../utils/prismaClient";
import bcrypt from "bcryptjs";

export const PUT: APIRoute = async ({ request, cookies, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
    });
  }
  if (user.username === "demo") {
    return new Response(
      JSON.stringify({ error: "No puedes modificar la cuenta demo" }),
      {
        status: 403,
      },
    );
  }

  try {
    const data = await request.json();
    const { currentPassword, newUsername, newPassword } = data;

    if (!currentPassword) {
      return new Response(
        JSON.stringify({ error: "Contraseña actual requerida" }),
        { status: 400 },
      );
    }

    // Verificar contraseña actual
    const dbUser = await prisma.users.findUnique({
      where: { id: user.id },
    });

    if (!dbUser || !dbUser.password_hash) {
      return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
        status: 404,
      });
    }

    const valid = await bcrypt.compare(currentPassword, dbUser.password_hash);
    if (!valid) {
      return new Response(
        JSON.stringify({ error: "Contraseña actual incorrecta" }),
        { status: 403 },
      );
    }

    const updates: any = {};

    // Actualizar Username
    if (newUsername && newUsername.trim() !== user.username) {
      const existing = await prisma.users.findUnique({
        where: { username: newUsername },
      });
      if (existing) {
        return new Response(
          JSON.stringify({ error: "El nombre de usuario ya existe" }),
          { status: 409 },
        );
      }
      updates.username = newUsername.trim();
    }

    // Actualizar Password
    if (newPassword) {
      if (newPassword.length < 6) {
        return new Response(
          JSON.stringify({
            error: "La nueva contraseña debe tener al menos 6 caracteres",
          }),
          { status: 400 },
        );
      }
      const salt = await bcrypt.genSalt(10);
      updates.password_hash = await bcrypt.hash(newPassword, salt);
    }

    if (Object.keys(updates).length === 0) {
      return new Response(
        JSON.stringify({ message: "No se realizaron cambios" }),
        { status: 200 },
      );
    }

    await prisma.users.update({
      where: { id: user.id },
      data: updates,
    });

    // Cerrar sesión para obligar a re-loguear
    cookies.delete("session", { path: "/" });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Perfil actualizado. Por favor inicia sesión nuevamente.",
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
    });
  }
};
