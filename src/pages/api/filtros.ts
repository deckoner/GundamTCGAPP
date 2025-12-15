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
interface Trait {
  id: number;
  trait: string | null;
}
interface Anime {
  id: number;
  anime: string | null;
}
interface BelongsGD {
  id: number;
  belongs_gd: string | null;
}
interface Link {
  id: number;
  link: string | null;
}

interface CachedData {
  colores: Color[];
  tipos: Type[];
  tags: Tag[];
  traits: Trait[];
  animes: Anime[];
  gd: BelongsGD[];
  links: Link[];
  rarities: string[];
  costs: number[];
  levels: number[];
}

// Cache simple en memoria para los filtros
let cached: CachedData | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 60 * 1000 * 6; // 6 horas

export async function getFiltrosData() {
  const now = Date.now();

  if (!cached || now - cacheTimestamp > CACHE_TTL) {
    const [
      colores,
      tipos,
      tags,
      traits,
      animes,
      gd,
      links,
      rarities,
      costs,
      levels,
    ] = await Promise.all([
      prisma.colors.findMany({ select: { id: true, color: true } }),
      prisma.types.findMany({ select: { id: true, type: true } }),
      prisma.tags.findMany({ select: { id: true, tag: true } }),
      prisma.traits.findMany({ select: { id: true, trait: true } }),
      prisma.animes.findMany({ select: { id: true, anime: true } }),
      prisma.belongs_gd.findMany({ select: { id: true, belongs_gd: true } }),
      prisma.links.findMany({ select: { id: true, link: true } }),
      prisma.cards.findMany({
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
    ]);

    cached = {
      colores,
      tipos,
      tags,
      traits,
      animes,
      gd,
      links,
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
