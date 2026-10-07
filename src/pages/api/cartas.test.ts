import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./cartas";
import prisma from "../../utils/prismaClient";

// Simular la instancia singleton
vi.mock("../../utils/prismaClient", () => {
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
    card_tags: [],
    animes: null,
    zones: null,
  },
});

describe("API: /api/cartas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debería devolver 200 y datos de cartas con parámetros por defecto", async () => {
    const url = new URL("http://localhost/api/cartas?page=1");
    const locals = { user: { id: 1 } } as any;

    (prisma.card_variants.findMany as any).mockResolvedValue([varianteRow()]);
    (prisma.card_variants.count as any).mockResolvedValue(1);

    const response = await GET({ url, locals } as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.cartas).toHaveLength(1);
    expect(data.cartas[0].id).toBe(10);
    expect(data.cartas[0].variant_id).toBe(1);
    expect(data.hasMore).toBe(false);
  });

  it("debería analizar y pasar todos los parámetros de filtro correctamente", async () => {
    const url = new URL(
      "http://localhost/api/cartas?page=1&nombre=Test&tipo=1&anime=2&gd=3&link=ST01&rarity=SR&cost=5&level=6&colores=1&colores=2&tags=10&traits=Zeon&altArt=true&ownedOnly=true",
    );
    const locals = { user: { id: 1 } } as any;

    (prisma.card_variants.findMany as any).mockResolvedValue([]);
    (prisma.card_variants.count as any).mockResolvedValue(0);

    const response = await GET({ url, locals } as any);
    expect(response.status).toBe(200);
    expect(prisma.card_variants.findMany).toHaveBeenCalled();
  });

  it("debería manejar errores correctamente", async () => {
    const url = new URL("http://localhost/api/cartas");
    const locals = { user: { id: 1 } } as any;
    (prisma.card_variants.findMany as any).mockRejectedValue(
      new Error("DB Error"),
    );

    const response = await GET({ url, locals } as any);

    expect(response.status).toBe(500);
  });
});
