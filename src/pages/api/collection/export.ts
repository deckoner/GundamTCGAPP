import type { APIRoute } from "astro";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const GET: APIRoute = async ({ request, locals }) => {
  const user = locals.user;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

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

  const csvRows = [["gd", "name", "rarity", "belongs_gd", "quantity"]];

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

  return new Response(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="collection_export_${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
};
