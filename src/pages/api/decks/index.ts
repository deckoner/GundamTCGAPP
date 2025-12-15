export const prerender = false;

import prisma from "../../../utils/prismaClient";
import { EXCLUDED_DECK_TYPES } from "../../../constants/deckRules";

export async function GET({ locals }: { locals: App.Locals }) {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const decks = await prisma.decks.findMany({
      where: { user_id: locals.user.id },
      include: {
        deck_cards: {
          include: {
            cards: true,
          },
        },
      },
    });

    const types = await prisma.types.findMany();
    const typesMap = types.reduce(
      (acc, t) => {
        acc[t.id] = (t.type || "").toUpperCase();
        return acc;
      },
      {} as Record<number, string>,
    );

    // Calcular estadísticas para cada deck
    const decksWithStats = decks.map((deck) => {
      const totalCards = deck.deck_cards
        .filter((dc) => {
          const cardTypeIds = (dc.cards.type_ids || "")
            .split(",")
            .filter(Boolean)
            .map(Number);
          // Verificar si alguno de los tipos de la carta es especial
          const isSpecial = cardTypeIds.some((tid) =>
            EXCLUDED_DECK_TYPES.includes(typesMap[tid] || ""),
          );
          return !isSpecial;
        })
        .reduce((sum, dc) => sum + (dc.quantity || 0), 0);
      return {
        ...deck,
        totalCards,
      };
    });

    return new Response(JSON.stringify(decksWithStats), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching decks:", error);
    return new Response(JSON.stringify({ error: "Error fetching decks" }), {
      status: 500,
    });
  }
}

export async function POST({
  request,
  locals,
}: {
  request: Request;
  locals: App.Locals;
}) {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return new Response(JSON.stringify({ error: "Name is required" }), {
        status: 400,
      });
    }

    const newDeck = await prisma.decks.create({
      data: {
        name,
        user_id: locals.user.id,
      },
    });

    return new Response(JSON.stringify(newDeck), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating deck:", error);
    return new Response(JSON.stringify({ error: "Error creating deck" }), {
      status: 500,
    });
  }
}
