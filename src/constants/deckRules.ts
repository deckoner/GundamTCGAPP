// Cantidad de elementos a mostrar por página en los listados de cartas
export const ITEMS_PER_PAGE = 50;

// Tipos de cartas que NO cuentan para el límite del deck principal (50 cartas)
export const EXCLUDED_DECK_TYPES = [
  "UNIT TOKEN",
  "RESOURCE",
  "EX BASE",
  "EX RESOURCE",
];

// Tipos de cartas que corresponden a recursos
export const RESOURCE_CARD_TYPES = ["RESOURCE", "EX RESOURCE"];

// IDs de las ediciones Beta del juego
export const BETA_EDITION_IDS = [15, 35, 42];

// Orden preferido para mostrar los tipos de cartas en la interfaz
export const CARD_TYPE_ORDER = [
  "Unit",
  "Pilot",
  "Command",
  "Base",
  "Resource",
  "Unit Token",
  "Ex Base",
  "Ex Resource",
  "Otros",
];

// Reglas de Construcción de Decks

// Tamaño exacto requerido para el deck principal (excluyendo cartas especiales)
export const MAX_CARDS_IN_DECK = 50;

// Tamaño máximo permitido para el deck de recursos
export const MAX_RESOURCE_DECK_SIZE = 10;

// Límite máximo de copias de una misma carta permitidas en el deck
export const MAX_COPIES_PER_CARD = 4;

// Límite máximo de colores diferentes permitidos en un deck
export const MAX_ALLOWED_COLORS = 2;
