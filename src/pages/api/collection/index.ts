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
      card_variants: { include: { cards: true, sets: true } },
    },
  });

  // Modo mapa: devuelve objeto simple { variant_id: quantity }
  if (mode === "map") {
    const map: Record<number, number> = {};
    collection.forEach((item) => {
      map[item.variant_id] = item.quantity || 0;
    });
    return new Response(JSON.stringify(map), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Conservar el formato antiguo de respuesta (fila con sus datos de carta)
  const filas = collection.map((item) => ({
    user_id: item.user_id,
    variant_id: item.variant_id,
    quantity: item.quantity,
    card_id: item.card_variants?.card_id ?? 0,
    cards: item.card_variants?.cards ?? null,
    variant: item.card_variants ?? null,
  }));

  return new Response(JSON.stringify(filas), {
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
  const { variantId, cardId, quantity = 1 } = body;
  const variant = variantId ?? cardId;

  if (!variant) {
    console.error("Collection POST Error: Falta variantId", body);
    return new Response(
      JSON.stringify({ error: "ID de variante es requerido" }),
      {
        status: 400,
      },
    );
  }

  try {
    // Verificar si la variante ya existe en la colección
    const existingEntry = await prisma.user_collections.findUnique({
      where: {
        user_id_variant_id: {
          user_id: user.id,
          variant_id: parseInt(variant),
        },
      },
    });

    let result;
    if (existingEntry) {
      // Actualizar cantidad
      result = await prisma.user_collections.update({
        where: {
          user_id_variant_id: {
            user_id: user.id,
            variant_id: parseInt(variant),
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
          variant_id: parseInt(variant),
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
  const { variantId, cardId, removeAll = false } = body;
  const variant = variantId ?? cardId;

  if (!variant) {
    return new Response(JSON.stringify({ error: "ID de variante requerido" }), {
      status: 400,
    });
  }

  const existingEntry = await prisma.user_collections.findUnique({
    where: {
      user_id_variant_id: {
        user_id: user.id,
        variant_id: parseInt(variant),
      },
    },
  });

  if (!existingEntry) {
    return new Response(
      JSON.stringify({ error: "Carta no encontrada en colección" }),
      {
        status: 404,
      },
    );
  }

  let result;
  // Eliminar si se solicita borrar todo o si la cantidad llega a 0
  if (removeAll || (existingEntry.quantity || 0) <= 1) {
    result = await prisma.user_collections.delete({
      where: {
        user_id_variant_id: {
          user_id: user.id,
          variant_id: parseInt(variant),
        },
      },
    });
  } else {
    // Decrementar cantidad
    result = await prisma.user_collections.update({
      where: {
        user_id_variant_id: {
          user_id: user.id,
          variant_id: parseInt(variant),
        },
      },
      data: {
        quantity: (existingEntry.quantity || 0) - 1,
      },
    });
  }

  return new Response(JSON.stringify(result), { status: 200 });
};
