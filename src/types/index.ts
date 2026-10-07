// Definición de una Carta en el sistema
export interface Card {
  id: number;
  name: string;
  img: string; // URL de la imagen de la carta
  cost?: number; // Coste de despliegue
  level?: number; // Nivel de la carta (si aplica)
  quantity: number; // Cantidad disponible o en deck
  type_ids?: string; // IDs de tipos asociados
  color_ids?: string; // IDs de colores asociados
  gd?: string; // ID de la carta
  alt_art?: boolean; // Si la variante mostrada es arte alternativo
  variant_id?: number; // ID de la variante (card_variants)
  rarity?: string; // Rareza de la variante mostrada
  set_id?: number; // ID del set de la variante mostrada
}

// Estructura básica de un Deck
export interface Deck {
  id: number;
  name: string;
  totalCards: number;
}

// Estado completo de un Deck incluyendo sus cartas
export interface DeckState {
  id: number;
  name: string;
  cards: Card[];
}

// Metadatos para filtrado y visualización
export interface Metadata {
  colors: Record<number, string>; // Mapa de ID -> Nombre de color
  types: Record<number, string>; // Mapa de ID -> Nombre de tipo
}

// Parámetros para la búsqueda y filtrado de cartas
export interface FetchCartasParams {
  page?: number;
  nombre?: string;
  tipo?: number | null;
  anime?: number | null;
  gd?: number | null;
  link?: string | null;
  rarity?: string | null;
  cost?: number | null;
  level?: number | null;
  colores?: Set<number>;
  tags?: Set<number>;
  traits?: Set<string>;
  altArt?: boolean;
  ownedOnly?: boolean;
  userId?: number;
}
