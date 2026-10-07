import type { APIRoute } from "astro";
import prisma from "../../../utils/prismaClient";

export const GET: APIRoute = async ({ request, locals }) => {
  const user = locals.user;

  if (!user) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
    });
  }

  // Obtener la colección completa del usuario
  const collection = await prisma.user_collections.findMany({
    where: { user_id: user.id },
    include: {
      card_variants: {
        include: {
          cards: true,
          sets: true,
        },
      },
    },
  });

  // Generar cabeceras CSV
  const csvRows = [["gd", "name", "rarity", "belongs_gd", "quantity"]];

  // Poblar filas
  collection.forEach((item) => {
    const variante = item.card_variants;
    csvRows.push([
      variante?.cards.gd || "",
      `"${(variante?.cards.name || "").replace(/"/g, '""')}"`,
      variante?.rarity || "",
      variante?.sets.full_name || "",
      (item.quantity || 0).toString(),
    ]);
  });

  const csvContent = csvRows.map((row) => row.join(",")).join("\n");

  // Devolver archivo CSV para descarga
  return new Response(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="collection_export_${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
};
