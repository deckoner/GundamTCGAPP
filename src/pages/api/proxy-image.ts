export const prerender = false;

import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const imageUrl = url.searchParams.get("url");

  if (!imageUrl) {
    return new Response("Falta el parámetro URL", { status: 400 });
  }

  try {
    // Realizar la petición a la imagen externa
    // Esto es necesario para evitar problemas de CORS y para ocultar la fuente real si fuera necesario
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return new Response(`Error obteniendo la imagen: ${response.statusText}`, {
        status: response.status,
      });
    }

    const blob = await response.blob();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error del proxy:", error);
    return new Response("Error Interno del Servidor", { status: 500 });
  }
};
