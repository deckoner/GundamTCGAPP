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
      cards: {
        include: {
          belongs_gd: true,
        },
      },
    },
  });

  // Generar cabeceras CSV
  const csvRows = [["gd", "name", "rarity", "belongs_gd", "quantity"]];

  // Poblar filas
  collection.forEach((item) => {
    csvRows.push([
      item.cards.gd || "",
      `"${(item.cards.name || "").replace(/"/g, '""')}"`,
      item.cards.rarity || "",
      item.cards.belongs_gd?.belongs_gd || "",
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
