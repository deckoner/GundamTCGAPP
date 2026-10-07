import type { APIRoute } from "astro";
import prisma from "../../../utils/prismaClient";

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;

  if (!user) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No se subió ningún archivo" }),
        {
          status: 400,
        },
      );
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

    // Procesar cabeceras
    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase());

    const gdIndex = headers.indexOf("gd");
    const nameIndex = headers.indexOf("name");
    const rarityIndex = headers.indexOf("rarity");
    const belongsGdIndex = headers.indexOf("belongs_gd");
    const quantityIndex = headers.indexOf("quantity");

    if (gdIndex === -1 || nameIndex === -1) {
      return new Response(
        JSON.stringify({
          error: "El CSV debe contener columnas 'gd' y 'name'",
        }),
        { status: 400 },
      );
    }

    let successCount = 0;
    let errorCount = 0;

    // Procesar cada línea del CSV
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line);
      let variantId: number | null = null;
      let quantity = 1;

      if (quantityIndex !== -1 && values[quantityIndex]) {
        quantity = parseInt(values[quantityIndex]) || 1;
      }

      // Búsqueda por campos combinados para identificar la variante exacta
      const gd = values[gdIndex];
      const name = values[nameIndex];
      const rarity = rarityIndex !== -1 ? values[rarityIndex] : undefined;
      const setName =
        belongsGdIndex !== -1 ? values[belongsGdIndex] : undefined;

      if (gd && name) {
        const card = await prisma.cards.findFirst({
          where: { gd, name },
          include: {
            card_variants: {
              include: { sets: true },
              orderBy: { id: "asc" },
            },
          },
        });

        if (card && card.card_variants.length > 0) {
          // Preferencia: variante que coincida con rareza y set del CSV
          const candidatas = card.card_variants.filter((v) => {
            const coincideRareza = rarity ? v.rarity === rarity : true;
            const coincideSet = setName
              ? v.sets.full_name === setName ||
                v.sets.name === setName ||
                v.sets.code === setName
              : true;
            return coincideRareza && coincideSet;
          });

          const elegida =
            candidatas.find((v) => !v.alt_art) ??
            candidatas[0] ??
            card.card_variants.find((v) => !v.alt_art) ??
            card.card_variants[0];

          variantId = elegida.id;
        }
      }

      if (variantId) {
        // Upsert: Actualizar cantidad si existe, crear si no
        const existing = await prisma.user_collections.findUnique({
          where: {
            user_id_variant_id: {
              user_id: user.id,
              variant_id: variantId,
            },
          },
        });

        if (existing) {
          await prisma.user_collections.update({
            where: {
              user_id_variant_id: {
                user_id: user.id,
                variant_id: variantId,
              },
            },
            data: { quantity: (existing.quantity || 0) + quantity },
          });
        } else {
          await prisma.user_collections.create({
            data: {
              user_id: user.id,
              variant_id: variantId,
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
        message: "Importación completada",
        success: successCount,
        errors: errorCount,
      }),
      { status: 200 },
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Falló la importación" }), {
      status: 500,
    });
  }
};
