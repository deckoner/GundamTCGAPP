import type { APIRoute } from "astro";
import prisma from "../../../utils/prismaClient";

export const GET: APIRoute = async ({ request }) => {
  try {
    // Verificar secreto de Cron
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${import.meta.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const demoUser = await prisma.users.findUnique({
      where: { username: "demo" },
    });

    if (!demoUser) {
      return new Response(JSON.stringify({ message: "Demo user not found" }), {
        status: 404,
      });
    }

    // Usar transacción para borrar decks y colección del usuario demo
    await prisma.$transaction([
      // Borrar decks
      prisma.decks.deleteMany({
        where: { user_id: demoUser.id },
      }),
      // Borrar colección
      prisma.user_collections.deleteMany({
        where: { user_id: demoUser.id },
      }),
    ]);

    return new Response(
      JSON.stringify({ message: "Demo user data reset successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error resetting demo user:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
