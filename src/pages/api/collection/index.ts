import type { APIRoute } from "astro";
import prisma from "../../../utils/prismaClient";

export const GET: APIRoute = async ({ request, locals }) => {
  const user = locals.user;

  if (!user) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
    });
  }

  const url = new URL(request.url);
  const mode = url.searchParams.get("mode");

  const collection = await prisma.user_collections.findMany({
    where: { user_id: user.id },
    include: {
      cards: mode !== "map", // Solo incluir datos de cartas si no estamos en modo mapa
    },
  });

  // Modo mapa: devuelve objeto simple { card_id: quantity }
  if (mode === "map") {
    const map: Record<number, number> = {};
    collection.forEach((item) => {
      map[item.card_id] = item.quantity || 0;
    });
    return new Response(JSON.stringify(map), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(collection), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;

  if (!user) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
    });
  }

  const body = await request.json();
  const { cardId, quantity = 1 } = body;

  if (!cardId) {
    console.error("Collection POST Error: Falta cardId", body);
    return new Response(JSON.stringify({ error: "ID de carta es requerido" }), {
      status: 400,
    });
  }

  try {
    // Verificar si la carta ya existe en la colección
    const existingEntry = await prisma.user_collections.findUnique({
      where: {
        user_id_card_id: {
          user_id: user.id,
          card_id: parseInt(cardId),
        },
      },
    });

    let result;
    if (existingEntry) {
      // Actualizar cantidad
      result = await prisma.user_collections.update({
        where: {
          user_id_card_id: {
            user_id: user.id,
            card_id: parseInt(cardId),
          },
        },
        data: {
          quantity: (existingEntry.quantity || 0) + quantity,
        },
      });
    } else {
      // Crear nueva entrada
      result = await prisma.user_collections.create({
        data: {
          user_id: user.id,
          card_id: parseInt(cardId),
          quantity: quantity,
        },
      });
    }

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error("Error BD en Collection POST:", error);
    return new Response(
      JSON.stringify({
        error: "Operación de base de datos fallida",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 },
    );
  }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  const user = locals.user;

  if (!user) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
    });
  }

  const body = await request.json();
  const { cardId, removeAll = false } = body;

  if (!cardId) {
    return new Response(JSON.stringify({ error: "ID de carta requerido" }), {
      status: 400,
    });
  }

  const existingEntry = await prisma.user_collections.findUnique({
    where: {
      user_id_card_id: {
        user_id: user.id,
        card_id: parseInt(cardId),
      },
    },
  });

  if (!existingEntry) {
    return new Response(JSON.stringify({ error: "Carta no encontrada en colección" }), {
      status: 404,
    });
  }

  let result;
  // Eliminar si se solicita borrar todo o si la cantidad llega a 0
  if (removeAll || (existingEntry.quantity || 0) <= 1) {
    result = await prisma.user_collections.delete({
      where: {
        user_id_card_id: {
          user_id: user.id,
          card_id: parseInt(cardId),
        },
      },
    });
  } else {
    // Decrementar cantidad
    result = await prisma.user_collections.update({
      where: {
        user_id_card_id: {
          user_id: user.id,
          card_id: parseInt(cardId),
        },
      },
      data: {
        quantity: (existingEntry.quantity || 0) - 1,
      },
    });
  }

  return new Response(JSON.stringify(result), { status: 200 });
};
