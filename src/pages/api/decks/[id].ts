export const prerender = false;

import prisma from "../../../utils/prismaClient";

export async function GET({
  params,
  locals,
}: {
  params: { id: string };
  locals: App.Locals;
}) {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const deckId = parseInt(params.id);

  if (isNaN(deckId)) {
    return new Response(JSON.stringify({ error: "Invalid deck ID" }), {
      status: 400,
    });
  }

  try {
    const deck = await prisma.decks.findUnique({
      where: { id: deckId },
      include: {
        deck_cards: {
          include: {
            cards: true,
          },
        },
      },
    });

    if (!deck) {
      return new Response(JSON.stringify({ error: "Deck not found" }), {
        status: 404,
      });
    }

    if (deck.user_id !== locals.user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify(deck), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching deck:", error);
    return new Response(JSON.stringify({ error: "Error fetching deck" }), {
      status: 500,
    });
  }
}

export async function PUT({
  params,
  request,
  locals,
}: {
  params: { id: string };
  request: Request;
  locals: App.Locals;
}) {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const deckId = parseInt(params.id);
  if (isNaN(deckId)) {
    return new Response(JSON.stringify({ error: "Invalid deck ID" }), {
      status: 400,
    });
  }

  try {
    const body = await request.json();
    const { name, cards } = body;

    // Verificar propiedad
    const existingDeck = await prisma.decks.findUnique({
      where: { id: deckId },
    });

    if (!existingDeck) {
      return new Response(JSON.stringify({ error: "Deck not found" }), {
        status: 404,
      });
    }

    if (existingDeck.user_id !== locals.user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    // Actualizar deck
    const updatedDeck = await prisma.$transaction(async (tx) => {
      // Actualizar nombre si se proporciona
      if (name) {
        await tx.decks.update({
          where: { id: deckId },
          data: { name },
        });
      }

      // Actualizar cartas si se proporcionan
      if (cards) {
        // Eliminar cartas existentes
        await tx.deck_cards.deleteMany({
          where: { deck_id: deckId },
        });

        // Insertar nuevas cartas
        if (cards.length > 0) {
          await tx.deck_cards.createMany({
            data: cards.map((c: any) => ({
              deck_id: deckId,
              card_id: c.card_id,
              quantity: c.quantity,
            })),
          });
        }
      }

      return tx.decks.findUnique({
        where: { id: deckId },
        include: {
          deck_cards: {
            include: {
              cards: true,
            },
          },
        },
      });
    });

    return new Response(JSON.stringify(updatedDeck), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating deck:", error);
    return new Response(JSON.stringify({ error: "Error updating deck" }), {
      status: 500,
    });
  }
}

export async function DELETE({
  params,
  locals,
}: {
  params: { id: string };
  locals: App.Locals;
}) {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const deckId = parseInt(params.id);
  if (isNaN(deckId)) {
    return new Response(JSON.stringify({ error: "Invalid deck ID" }), {
      status: 400,
    });
  }

  try {
    // Verificar propiedad
    const existingDeck = await prisma.decks.findUnique({
      where: { id: deckId },
    });

    if (!existingDeck) {
      return new Response(JSON.stringify({ error: "Deck not found" }), {
        status: 404,
      });
    }

    if (existingDeck.user_id !== locals.user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    await prisma.decks.delete({
      where: { id: deckId },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting deck:", error);
    return new Response(JSON.stringify({ error: "Error deleting deck" }), {
      status: 500,
    });
  }
}
