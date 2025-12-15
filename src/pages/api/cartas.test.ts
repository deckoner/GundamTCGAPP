import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./cartas";
import prisma from "../../utils/prismaClient";

// Simular la instancia singleton
vi.mock("../../utils/prismaClient", () => {
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

describe("API: /api/cartas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debería devolver 200 y datos de cartas con parámetros por defecto", async () => {
    const url = new URL("http://localhost/api/cartas?page=1");
    const locals = { user: { id: 1 } } as any;

    (prisma.cards.findMany as any).mockResolvedValue([
      { id: 1, name: "Gundam" },
    ]);
    (prisma.cards.count as any).mockResolvedValue(1);

    const response = await GET({ url, locals } as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.cartas).toHaveLength(1);
    expect(data.hasMore).toBe(false);
  });

  it("debería analizar y pasar todos los parámetros de filtro correctamente", async () => {
    const url = new URL(
      "http://localhost/api/cartas?page=1&nombre=Test&tipo=1&anime=2&gd=3&link=4&rarity=SR&cost=5&level=6&colores=1&colores=2&tags=10&traits=20&altArt=true&ownedOnly=true",
    );
    const locals = { user: { id: 1 } } as any;

    (prisma.cards.findMany as any).mockResolvedValue([]);
    (prisma.cards.count as any).mockResolvedValue(0);

    const response = await GET({ url, locals } as any);
    expect(response.status).toBe(200);
    expect(prisma.cards.findMany).toHaveBeenCalled();
  });

  it("debería manejar errores correctamente", async () => {
    const url = new URL("http://localhost/api/cartas");
    const locals = { user: { id: 1 } } as any;
    (prisma.cards.findMany as any).mockRejectedValue(new Error("DB Error"));

    const response = await GET({ url, locals } as any);

    expect(response.status).toBe(500);
  });
});
