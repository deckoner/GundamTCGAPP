import type { APIRoute } from "astro";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const GET: APIRoute = async ({ request, locals }) => {
  const user = locals.user;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const url = new URL(request.url);
  const mode = url.searchParams.get("mode");

  const collection = await prisma.user_collections.findMany({
    where: { user_id: user.id },
    include: {
      cards: mode !== "map",
    },
  });

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
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const body = await request.json();
  const { cardId, quantity = 1 } = body;

  if (!cardId) {
    console.error("Collection POST Error: Missing cardId", body);
    return new Response(JSON.stringify({ error: "Card ID is required" }), {
      status: 400,
    });
  }

  try {
    // Verificar si la carta existe en la colección
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
    console.error("Database Error in Collection POST:", error);
    return new Response(
      JSON.stringify({
        error: "Database operation failed",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 },
    );
  }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  const user = locals.user;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const body = await request.json();
  const { cardId, removeAll = false } = body;

  if (!cardId) {
    return new Response(JSON.stringify({ error: "Card ID is required" }), {
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
    return new Response(JSON.stringify({ error: "Card not in collection" }), {
      status: 404,
    });
  }

  let result;
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
