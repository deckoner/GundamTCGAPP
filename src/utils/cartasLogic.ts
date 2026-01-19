import prisma from "./prismaClient";
import type { Prisma } from "@prisma/client";
import { ITEMS_PER_PAGE } from "../constants/deckRules";
import type { FetchCartasParams } from "../types";

/**
 * Función principal para buscar y filtrar cartas en la base de datos.
 * Construye una consulta dinámica basada en los parámetros proporcionados.
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

  // Construccion del objeto 'where' para Prisma
  const where: Prisma.cardsWhereInput = {};

  // Filtro por nombre (búsqueda parcial)
  if (nombre) {
    where.name = { contains: nombre };
  }

  // Filtro por tipo de carta (relación muchos a muchos)
  if (tipo) {
    where.card_types = { some: { type_id: tipo } };
  }

  // Filtro por serie de Anime
  if (anime) {
    where.anime_id = anime;
  }

  // Filtro por Edición / Gundam Design
  if (gd) {
    where.belongs_gd_id = gd;
  }

  // Filtro por Link
  if (link) {
    where.link_id = link;
  }

  // Filtro por Rareza
  if (rarity) {
    where.rarity = rarity;
  }

  // Filtro por Coste
  if (cost !== null) {
    where.cost = cost;
  }

  // Filtro por Nivel
  if (level !== null) {
    where.level = level;
  }

  // Filtro por Colores (debe coincidir con AL MENOS uno de los colores seleccionados)
  // Nota: Esto busca cartas que tengan alguno de los colores, no necesariamente todos.
  if (colores.size > 0) {
    where.AND = [
      ...((where.AND as any[]) || []),
      ...Array.from(colores).map((id) => ({
        card_colors: { some: { color_id: id } },
      })),
    ];
  }

  // Filtro por Tags (Etiquetas) - Requiere que tenga TODOS los tags seleccionados
  if (tags.size > 0) {
    where.AND = [
      ...((where.AND as any[]) || []),
      ...Array.from(tags).map((id) => ({
        card_tags: { some: { tag_id: id } },
      })),
    ];
  }

  // Filtro por Traits (Rasgos) - Requiere que tenga TODOS los traits seleccionados
  if (traits.size > 0) {
    where.AND = [
      ...((where.AND as any[]) || []),
      ...Array.from(traits).map((id) => ({
        card_traits: { some: { trait_id: id } },
      })),
    ];
  }

  // Filtro de Arte Alternativo
  if (!altArt) {
    where.alt_art = { not: true };
  }

  // Filtro de colección de usuario (solo cartas que el usuario posee)
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
      prisma.cards.count({ where }),
      prisma.cards.findMany({
        where,
        take: ITEMS_PER_PAGE,
        skip: skip,
        orderBy: { id: "asc" },
        include: {
          // Incluir relaciones necesarias para mostrar detalles
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

    // Mapear datos para asegurar estructura consistente
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
    console.error("Error al buscar cartas:", error);
    throw error;
  }
}
