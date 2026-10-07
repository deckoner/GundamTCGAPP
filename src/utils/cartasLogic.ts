import prisma from "./prismaClient";
import type { Prisma } from "@prisma/client";
import { ITEMS_PER_PAGE } from "../constants/deckRules";
import type { FetchCartasParams } from "../types";

/**
 * Función principal para buscar y filtrar cartas en la base de datos.
 * Construye una consulta dinámica basada en los parámetros proporcionados.
 * La consulta se hace sobre las variantes de carta (card_variants), ya que
 * ahí viven la imagen, la rareza, el set y el arte alternativo.
 *
 * @param params Parámetros de filtrado (nombre, tipo, rareza, colores, etc.)
 * @returns Objeto con las cartas encontradas, si hay más páginas y el total de resultados.
 */
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

  // Calcular paginación
  const skip = (page - 1) * ITEMS_PER_PAGE;
  const take = ITEMS_PER_PAGE;

  // Filtros que dependen de los datos de la carta (tabla cards)
  const cardWhere: Prisma.cardsWhereInput = {};

  // Filtro por nombre (búsqueda parcial)
  if (nombre) {
    cardWhere.name = { contains: nombre };
  }

  // Filtro por tipo de carta (relación muchos a muchos)
  if (tipo) {
    cardWhere.card_types = { some: { type_id: tipo } };
  }

  // Filtro por serie de Anime
  if (anime) {
    cardWhere.anime_id = anime;
  }

  // Filtro por Coste
  if (cost !== null) {
    cardWhere.cost = cost;
  }

  // Filtro por Nivel
  if (level !== null) {
    cardWhere.level = level;
  }

  // Filtro por Link (columna de texto en cards)
  if (link) {
    cardWhere.links = { contains: link };
  }

  const cardAND: Prisma.cardsWhereInput[] = [];

  // Filtro por Colores (debe coincidir con AL MENOS uno de los colores seleccionados)
  if (colores.size > 0) {
    cardAND.push(
      ...Array.from(colores).map((id) => ({
        card_colors: { some: { color_id: id } },
      })),
    );
  }

  // Filtro por Tags (Etiquetas) - Requiere que tenga TODOS los tags seleccionados
  if (tags.size > 0) {
    cardAND.push(
      ...Array.from(tags).map((id) => ({
        card_tags: { some: { tag_id: id } },
      })),
    );
  }

  // Filtro por Traits (Rasgos) - Requiere que tenga TODOS los traits seleccionados
  if (traits.size > 0) {
    cardAND.push(
      ...Array.from(traits).map((trait) => ({
        traits: { contains: trait },
      })),
    );
  }

  if (cardAND.length > 0) {
    cardWhere.AND = cardAND;
  }

  // Filtros que viven en la variante (card_variants)
  const where: Prisma.card_variantsWhereInput = {};

  if (Object.keys(cardWhere).length > 0) {
    where.cards = cardWhere;
  }

  // Filtro por Edición / Set
  if (gd) {
    where.set_id = gd;
  }

  // Filtro por Rareza
  if (rarity) {
    where.rarity = rarity;
  }

  // Filtro de Arte Alternativo
  if (!altArt) {
    where.alt_art = { not: true };
  }

  // Filtro de colección de usuario (solo variantes que el usuario posee)
  if (ownedOnly && userId) {
    where.user_collections = {
      some: {
        user_id: userId,
        quantity: { gt: 0 },
      },
    };
  }

  try {
    // Ejecutar transacción para obtener conteo total y datos paginados
    const [total, data] = await prisma.$transaction([
      prisma.card_variants.count({ where }),
      prisma.card_variants.findMany({
        where,
        take,
        skip,
        orderBy: [{ cards: { id: "asc" } }, { id: "asc" }],
        include: {
          sets: true,
          cards: {
            include: {
              card_colors: { include: { color: true } },
              card_types: { include: { type: true } },
              card_tags: { include: { tag: true } },
              animes: true,
              zones: true,
            },
          },
        },
      }),
    ]);

    // Mapear datos para asegurar estructura consistente con el contrato de la UI
    const mappedData = data.map((v) => ({
      ...v.cards,
      card_colors: v.cards.card_colors,
      card_types: v.cards.card_types,
      card_tags: v.cards.card_tags,
      anime: v.cards.animes,
      zone: v.cards.zones,
      variant_id: v.id,
      set_id: v.set_id,
      set_name: v.sets?.name ?? null,
      set_full_name: v.sets?.full_name ?? null,
      rarity: v.rarity || "",
      img: v.img,
      alt_art: v.alt_art,
      type_ids: v.cards.card_types.map((t) => t.type_id).join(","),
      color_ids: v.cards.card_colors.map((c) => c.color_id).join(","),
      name: v.cards.name || "",
    }));

    return {
      cartas: mappedData,
      hasMore: skip + ITEMS_PER_PAGE < total,
      total,
    };
  } catch (error) {
    console.error("Error al buscar cartas:", error);
    throw error;
  }
}
