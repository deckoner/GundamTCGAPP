import prisma from "./prismaClient";
import type { Prisma } from "@prisma/client";
import { ITEMS_PER_PAGE } from "../constants/deckRules";
import type { FetchCartasParams } from "../types";

export async function fetchCartas(params: FetchCartasParams) {
  const {
    page = 1,
    nombre = "",
    tipo = null,
    anime = null,
    gd = null,
    link = null,
    rarity = null,
    cost = null,
    level = null,
    colores = new Set(),
    tags = new Set(),
    traits = new Set(),
    altArt = false,
    ownedOnly = false,
    userId,
  } = params;

  const skip = (page - 1) * ITEMS_PER_PAGE;
  const take = ITEMS_PER_PAGE;

  const where: Prisma.cardsWhereInput = {};

  if (nombre) {
    where.name = { contains: nombre };
  }
  if (tipo) {
    where.card_types = { some: { type_id: tipo } };
  }
  if (anime) {
    where.anime_id = anime;
  }
  if (gd) {
    where.belongs_gd_id = gd;
  }
  if (link) {
    where.link_id = link;
  }
  if (rarity) {
    where.rarity = rarity;
  }
  if (cost !== null) {
    where.cost = cost;
  }
  if (level !== null) {
    where.level = level;
  }
  if (colores.size > 0) {
    where.AND = [
      ...((where.AND as any[]) || []),
      ...Array.from(colores).map((id) => ({
        card_colors: { some: { color_id: id } },
      })),
    ];
  }
  if (tags.size > 0) {
    where.AND = [
      ...((where.AND as any[]) || []),
      ...Array.from(tags).map((id) => ({
        card_tags: { some: { tag_id: id } },
      })),
    ];
  }
  if (traits.size > 0) {
    where.AND = [
      ...((where.AND as any[]) || []),
      ...Array.from(traits).map((id) => ({
        card_traits: { some: { trait_id: id } },
      })),
    ];
  }

  if (!altArt) {
    where.alt_art = { not: true };
  }
  // Si altArt es verdadero, no filtramos, así que mostramos tanto cartas normales como de arte alternativo

  if (ownedOnly && userId) {
    where.user_collections = {
      some: {
        user_id: userId,
        quantity: { gt: 0 },
      },
    };
  }

  try {
    const [total, data] = await prisma.$transaction([
      prisma.cards.count({ where }),
      prisma.cards.findMany({
        where,
        take: ITEMS_PER_PAGE,
        skip: skip,
        orderBy: { id: "asc" },
        include: {
          card_colors: { include: { color: true } },
          card_types: { include: { type: true } },
          card_tags: { include: { tag: true } },
          card_traits: { include: { trait: true } },
          anime: true,
          belongs_gd: true,
          zone: true,
          link: true,
        },
      }),
    ]);

    const mappedData = data.map((c) => ({
      ...c,
      name: c.name || "",
      rarity: c.rarity || "",
      alt_art: c.alt_art ?? false,
    }));

    return {
      cartas: mappedData,
      hasMore: skip + ITEMS_PER_PAGE < total,
      total,
    };
  } catch (error) {
    console.error("Error fetching cards:", error);
    throw error;
  }
}
