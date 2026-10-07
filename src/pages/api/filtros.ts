export const prerender = false;

import prisma from "../../utils/prismaClient";

interface Color {
  id: number;
  color: string | null;
}
interface Type {
  id: number;
  type: string | null;
}
interface Tag {
  id: number;
  tag: string | null;
}
interface Anime {
  id: number;
  anime: string | null;
}
interface SetData {
  id: number;
  code: string | null;
  name: string | null;
  full_name: string | null;
}

interface CachedData {
  colores: Color[];
  tipos: Type[];
  tags: Tag[];
  animes: Anime[];
  sets: SetData[];
  traits: string[];
  links: string[];
  rarities: string[];
  costs: number[];
  levels: number[];
}

// Cache simple en memoria para los filtros
let cached: CachedData | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000 * 6; // 6 horas

/**
 * Parte los valores de una columna de texto (separados por "/") y devuelve
 * la lista única y ordenada de opciones para el filtro.
 */
function partirValores(valores: (string | null)[]): string[] {
  const unicos = new Set<string>();
  for (const valor of valores) {
    if (!valor) continue;
    for (const parte of valor.split("/")) {
      const limpio = parte.trim();
      if (limpio) unicos.add(limpio);
    }
  }
  return Array.from(unicos).sort((a, b) => a.localeCompare(b));
}

/**
 * Obtiene los datos necesarios para popular los filtros.
 * Utiliza caché en memoria para optimizar rendimiento.
 */
export async function getFiltrosData() {
  const now = Date.now();

  // Si no hay caché o expiró, consultar BD
  if (!cached || now - cacheTimestamp > CACHE_TTL) {
    const [
      colores,
      tipos,
      tags,
      animes,
      sets,
      rarities,
      costs,
      levels,
      linksCrudos,
      traitsCrudos,
    ] = await Promise.all([
      prisma.colors.findMany({ select: { id: true, color: true } }),
      prisma.types.findMany({ select: { id: true, type: true } }),
      prisma.tags.findMany({ select: { id: true, tag: true } }),
      prisma.animes.findMany({ select: { id: true, anime: true } }),
      prisma.sets.findMany({
        select: { id: true, code: true, name: true, full_name: true },
        orderBy: { sort_order: "asc" },
      }),

      // Obtener valores únicos de rareza (viven en las variantes)
      prisma.card_variants.findMany({
        select: { rarity: true },
        distinct: ["rarity"],
        where: { rarity: { not: null } },
      }),
      prisma.cards.findMany({
        select: { cost: true },
        distinct: ["cost"],
        where: { cost: { not: null } },
        orderBy: { cost: "asc" },
      }),
      prisma.cards.findMany({
        select: { level: true },
        distinct: ["level"],
        where: { level: { not: null } },
        orderBy: { level: "asc" },
      }),

      // Links y traits son columnas de texto en cards
      prisma.cards.findMany({
        select: { links: true },
        where: { links: { not: null } },
      }),
      prisma.cards.findMany({
        select: { traits: true },
        where: { traits: { not: null } },
      }),
    ]);

    cached = {
      colores,
      tipos,
      tags,
      animes,
      sets,
      traits: partirValores(traitsCrudos.map((t) => t.traits)),
      links: partirValores(linksCrudos.map((l) => l.links)),
      rarities: rarities.map((r) => r.rarity!).filter(Boolean),
      costs: costs.map((c) => c.cost!).filter((c) => c !== null),
      levels: levels.map((l) => l.level!).filter((l) => l !== null),
    };
    cacheTimestamp = now;
  }
  return cached;
}

export async function GET() {
  const data = await getFiltrosData();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
