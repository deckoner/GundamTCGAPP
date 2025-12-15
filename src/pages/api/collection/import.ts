import type { APIRoute } from "astro";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
      });
    }

    const text = await file.text();
    const lines = text.split("\n");

    // Helper para analizar líneas CSV respetando comillas
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase());

    const gdIndex = headers.indexOf("gd");
    const nameIndex = headers.indexOf("name");
    const rarityIndex = headers.indexOf("rarity");
    const belongsGdIndex = headers.indexOf("belongs_gd");
    const quantityIndex = headers.indexOf("quantity");

    if (gdIndex === -1 || nameIndex === -1) {
      return new Response(
        JSON.stringify({ error: "CSV must contain 'gd' and 'name' columns" }),
        { status: 400 },
      );
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line);
      let cardId: number | null = null;
      let quantity = 1;

      if (quantityIndex !== -1 && values[quantityIndex]) {
        quantity = parseInt(values[quantityIndex]) || 1;
      }

      // Búsqueda por campos combinados
      const gd = values[gdIndex];
      const name = values[nameIndex];
      const rarity = rarityIndex !== -1 ? values[rarityIndex] : undefined;
      const belongsGdName =
        belongsGdIndex !== -1 ? values[belongsGdIndex] : undefined;

      if (gd && name) {
        const whereClause: any = {
          gd: gd,
          name: name,
        };

        if (rarity) whereClause.rarity = rarity;
        if (belongsGdName) {
          whereClause.belongs_gd = {
            belongs_gd: belongsGdName,
          };
        }

        const card = await prisma.cards.findFirst({
          where: whereClause,
        });

        if (card) {
          cardId = card.id;
        }
      }

      if (cardId) {
        // Upsert
        const existing = await prisma.user_collections.findUnique({
          where: {
            user_id_card_id: {
              user_id: user.id,
              card_id: cardId,
            },
          },
        });

        if (existing) {
          await prisma.user_collections.update({
            where: {
              user_id_card_id: {
                user_id: user.id,
                card_id: cardId,
              },
            },
            data: { quantity: (existing.quantity || 0) + quantity },
          });
        } else {
          await prisma.user_collections.create({
            data: {
              user_id: user.id,
              card_id: cardId,
              quantity: quantity,
            },
          });
        }
        successCount++;
      } else {
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        message: "Import complete",
        success: successCount,
        errors: errorCount,
      }),
      { status: 200 },
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Import failed" }), {
      status: 500,
    });
  }
};
