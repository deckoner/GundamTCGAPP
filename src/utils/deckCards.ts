import type { Prisma } from "@prisma/client";

/**
 * Include común para las filas de deck_cards: además de la carta, trae los
 * tipos, colores y las variantes (con su set) necesarios para serializar
 * cada fila con el formato que espera el frontend.
 */
export const deckCardsInclude = {
  cards: {
    include: {
      card_types: true,
      card_colors: true,
      card_variants: {
        include: { sets: true },
        orderBy: { id: "asc" as const },
      },
    },
  },
} satisfies Prisma.deck_cardsInclude;

export type DeckCardConDatos = Prisma.deck_cardsGetPayload<{
  include: typeof deckCardsInclude;
}>;

/**
 * Serializa las filas de deck_cards al formato plano que consume la UI:
 * campos de la carta en nivel raíz + quantity, type_ids/color_ids como CSV
 * y los datos de la variante preferida (img, rareza, arte alternativo, set).
 */
export function serializarDeckCards(filas: DeckCardConDatos[]) {
  return filas.map((dc) => {
    const variantes = dc.cards.card_variants;
    const variante =
      variantes.find((v) => v.id === dc.preferred_variant_id) ??
      variantes.find((v) => !v.alt_art) ??
      variantes[0];

    const { card_variants: _variantes, ...carta } = dc.cards;

    return {
      ...carta,
      card_types: dc.cards.card_types,
      card_colors: dc.cards.card_colors,
      type_ids: dc.cards.card_types.map((t) => t.type_id).join(","),
      color_ids: dc.cards.card_colors.map((c) => c.color_id).join(","),
      quantity: dc.quantity,
      zone: dc.zone,
      preferred_variant_id: dc.preferred_variant_id,
      variant_id: variante?.id ?? null,
      set_id: variante?.set_id ?? null,
      set_name: variante?.sets?.name ?? null,
      rarity: variante?.rarity ?? "",
      img: variante?.img ?? null,
      alt_art: variante?.alt_art ?? false,
    };
  });
}
