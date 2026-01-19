import type { APIRoute } from "astro";
import prisma from "../../../utils/prismaClient";

export const GET: APIRoute = async ({ request }) => {
  try {
    // Verificar secreto de Cron para evitar ejecución no autorizada
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${import.meta.env.CRON_SECRET}`) {
      return new Response("No autorizado", { status: 401 });
    }

    // Buscar al usuario demo
    const demoUser = await prisma.users.findUnique({
      where: { username: "demo" },
    });

    if (!demoUser) {
      return new Response(JSON.stringify({ message: "Usuario demo no encontrado" }), {
        status: 404,
      });
    }

    // Usar transacción para borrado atómico
    await prisma.$transaction([
      // Borrar todos los decks
      prisma.decks.deleteMany({
        where: { user_id: demoUser.id },
      }),
      // Borrar toda su colección
      prisma.user_collections.deleteMany({
        where: { user_id: demoUser.id },
      }),
    ]);

    return new Response(
      JSON.stringify({ message: "Datos de usuario demo reiniciados correctamente" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error reseteando usuario demo:", error);
    return new Response(JSON.stringify({ error: "Error Interno del Servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
