import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchCartas } from "./cartasLogic";
import prisma from "./prismaClient";

// Simular la instancia singleton en prismaClient.ts
vi.mock("./prismaClient", () => {
  return {
    default: {
      card_variants: {
        findMany: vi.fn(),
        count: vi.fn(),
      },
      $transaction: vi.fn((promises) => Promise.all(promises)),
      $disconnect: vi.fn(),
    },
  };
});

// Fila de card_variants con la estructura que devuelve el include
const varianteRow = (id = 1) => ({
  id,
  card_id: 10,
  set_id: 4,
  rarity: "SR",
  img: "GD01-001_p6",
  alt_art: false,
  sets: { id: 4, code: "GD01", name: "Set 1", full_name: "Set 1" },
  cards: {
    id: 10,
    gd: "GD01-001",
    name: "Gundam",
    level: 3,
    cost: 5,
    text_card: null,
    ap: 12,
    hp: 8,
    traits: "Earth / Federation",
    links: "[Amuro Ray]",
    zone_id: null,
    anime_id: null,
    card_colors: [
      { card_id: 10, color_id: 1, color: { id: 1, color: "Rojo" } },
    ],
    card_types: [{ card_id: 10, type_id: 2, type: { id: 2, type: "Unit" } }],
    card_tags: [{ card_id: 10, tag_id: 7, tag: { id: 7, tag: "Gundam" } }],
    animes: null,
    zones: null,
  },
});

describe("cartasLogic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debería obtener cartas con paginación por defecto", async () => {
    (prisma.card_variants.findMany as any).mockResolvedValue([varianteRow()]);
    (prisma.card_variants.count as any).mockResolvedValue(1);

    const result = await fetchCartas({ page: 1 });

    expect(prisma.card_variants.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 50,
      }),
    );
    expect(result.cartas).toHaveLength(1);
    expect(result.hasMore).toBe(false);

    // Contrato de salida que consume la UI
    const carta = result.cartas[0];
    expect(carta.id).toBe(10);
    expect(carta.variant_id).toBe(1);
    expect(carta.name).toBe("Gundam");
    expect(carta.img).toBe("GD01-001_p6");
    expect(carta.rarity).toBe("SR");
    expect(carta.type_ids).toBe("2");
    expect(carta.color_ids).toBe("1");
    expect(carta.set_id).toBe(4);
    expect(carta.alt_art).toBe(false);
    expect(carta.anime).toBeNull();
    expect(carta.zone).toBeNull();
  });

  it("debería filtrar por arte alternativo (false = excluir arte alternativo)", async () => {
    (prisma.card_variants.findMany as any).mockResolvedValue([]);
    (prisma.card_variants.count as any).mockResolvedValue(0);

    await fetchCartas({ page: 1, altArt: false });

    expect(prisma.card_variants.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          alt_art: { not: true },
        }),
      }),
    );
  });

  it("debería filtrar por arte alternativo (true = incluir todo)", async () => {
    (prisma.card_variants.findMany as any).mockResolvedValue([]);
    (prisma.card_variants.count as any).mockResolvedValue(0);

    await fetchCartas({ page: 1, altArt: true });

    // Si altArt es true, no añadimos el filtro, así que no deberíamos ver alt_art en where
    expect(prisma.card_variants.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.not.objectContaining({
          alt_art: expect.anything(),
        }),
      }),
    );
  });

  it("debería filtrar por todos los campos específicos", async () => {
    (prisma.card_variants.findMany as any).mockResolvedValue([]);
    (prisma.card_variants.count as any).mockResolvedValue(0);

    await fetchCartas({
      page: 1,
      colores: new Set([1, 2]),
      tipo: 2,
      anime: 3,
      gd: 4,
      link: "ST01",
      rarity: "SR",
      cost: 5,
      level: 6,
      tags: new Set([10]),
      traits: new Set(["Zeon"]),
      nombre: "Gundam",
      ownedOnly: true,
      userId: 123,
    });

    expect(prisma.card_variants.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          // Filtros que viven en la variante
          set_id: 4,
          rarity: "SR",
          alt_art: { not: true },
          user_collections: {
            some: {
              user_id: 123,
              quantity: { gt: 0 },
            },
          },
          // Filtros que viven en la carta
          cards: expect.objectContaining({
            name: { contains: "Gundam" },
            card_types: { some: { type_id: 2 } },
            anime_id: 3,
            links: { contains: "ST01" },
            cost: 5,
            level: 6,
            AND: expect.arrayContaining([
              expect.objectContaining({
                card_colors: { some: { color_id: 1 } },
              }),
              expect.objectContaining({
                card_colors: { some: { color_id: 2 } },
              }),
              expect.objectContaining({
                card_tags: { some: { tag_id: 10 } },
              }),
              expect.objectContaining({ traits: { contains: "Zeon" } }),
            ]),
          }),
        }),
      }),
    );
  });
});
