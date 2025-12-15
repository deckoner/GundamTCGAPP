export const prerender = false;

import { fetchCartas } from "../../utils/cartasLogic";

export async function GET({ url, locals }: { url: URL; locals: App.Locals }) {
  const page = parseInt(url.searchParams.get("page") || "1", 10);

  const nombre = (url.searchParams.get("nombre") || "").toLowerCase();
  const tipo = url.searchParams.get("tipo")
    ? Number(url.searchParams.get("tipo"))
    : null;
  const anime = url.searchParams.get("anime")
    ? Number(url.searchParams.get("anime"))
    : null;
  const gd = url.searchParams.get("gd")
    ? Number(url.searchParams.get("gd"))
    : null;
  const link = url.searchParams.get("link")
    ? Number(url.searchParams.get("link"))
    : null;
  const rarity = url.searchParams.get("rarity") || null;
  const cost = url.searchParams.get("cost")
    ? Number(url.searchParams.get("cost"))
    : null;
  const level = url.searchParams.get("level")
    ? Number(url.searchParams.get("level"))
    : null;
  const colores = new Set(url.searchParams.getAll("colores").map(Number));
  const tags = new Set(url.searchParams.getAll("tags").map(Number));
  const traits = new Set(url.searchParams.getAll("traits").map(Number));
  const altArt = url.searchParams.get("altArt") === "true";
  const ownedOnly = url.searchParams.get("ownedOnly") === "true";

  try {
    const result = await fetchCartas({
      page,
      nombre,
      tipo,
      anime,
      gd,
      link,
      rarity,
      cost,
      level,
      colores,
      tags,
      traits,
      altArt,
      ownedOnly,
      userId: locals.user?.id,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error fetching cards" }), {
      status: 500,
    });
  }
}
