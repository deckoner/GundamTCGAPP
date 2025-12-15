import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchCartas } from "./cartasLogic";
import prisma from "./prismaClient";

// Simular la instancia singleton en prismaClient.ts
vi.mock("./prismaClient", () => {
  return {
    default: {
      cards: {
        findMany: vi.fn(),
        count: vi.fn(),
      },
      $transaction: vi.fn((promises) => Promise.all(promises)),
      $disconnect: vi.fn(),
    },
  };
});

describe("cartasLogic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debería obtener cartas con paginación por defecto", async () => {
    (prisma.cards.findMany as any).mockResolvedValue([
      { id: 1, name: "Gundam" },
    ]);
    (prisma.cards.count as any).mockResolvedValue(1);

    const result = await fetchCartas({ page: 1 });

    expect(prisma.cards.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 50,
      }),
    );
    expect(result.cartas).toHaveLength(1);
    expect(result.hasMore).toBe(false);
  });

  it("debería filtrar por arte alternativo (false = excluir arte alternativo)", async () => {
    (prisma.cards.findMany as any).mockResolvedValue([]);
    (prisma.cards.count as any).mockResolvedValue(0);

    await fetchCartas({ page: 1, altArt: false });

    expect(prisma.cards.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          alt_art: { not: true },
        }),
      }),
    );
  });

  it("debería filtrar por arte alternativo (true = incluir todo)", async () => {
    (prisma.cards.findMany as any).mockResolvedValue([]);
    (prisma.cards.count as any).mockResolvedValue(0);

    await fetchCartas({ page: 1, altArt: true });

    // Si altArt es true, no añadimos el filtro, así que no deberíamos ver alt_art en where
    expect(prisma.cards.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.not.objectContaining({
          alt_art: expect.anything(),
        }),
      }),
    );
  });

  it("debería filtrar por todos los campos específicos", async () => {
    (prisma.cards.findMany as any).mockResolvedValue([]);
    (prisma.cards.count as any).mockResolvedValue(0);

    await fetchCartas({
      page: 1,
      colores: new Set([1, 2]),
      tipo: 2,
      anime: 3,
      gd: 4,
      link: 5,
      rarity: "SR",
      cost: 5,
      level: 6,
      tags: new Set([10]),
      traits: new Set([20]),
      nombre: "Gundam",
      ownedOnly: true,
      userId: 123,
    });

    expect(prisma.cards.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          name: { contains: "Gundam" },
          card_types: { some: { type_id: 2 } },
          anime_id: 3,
          belongs_gd_id: 4,
          link_id: 5,
          rarity: "SR",
          cost: 5,
          level: 6,
          user_collections: {
            some: {
              user_id: 123,
              quantity: { gt: 0 },
            },
          },
          AND: expect.arrayContaining([
            expect.objectContaining({ card_colors: { some: { color_id: 1 } } }),
            expect.objectContaining({ card_colors: { some: { color_id: 2 } } }),
            expect.objectContaining({ card_tags: { some: { tag_id: 10 } } }),
            expect.objectContaining({
              card_traits: { some: { trait_id: 20 } },
            }),
          ]),
        }),
      }),
    );
  });
});
