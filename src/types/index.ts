export interface Card {
  id: number;
  name: string;
  img: string;
  cost?: number;
  level?: number;
  quantity: number;
  type_ids?: string;
  color_ids?: string;
  gd?: string;
  alt_art?: boolean;
  belongs_gd_id?: number;
}

export interface Deck {
  id: number;
  name: string;
  totalCards: number;
}

export interface DeckState {
  id: number;
  name: string;
  cards: Card[];
}

export interface Metadata {
  colors: Record<number, string>;
  types: Record<number, string>;
}

export interface FetchCartasParams {
  page?: number;
  nombre?: string;
  tipo?: number | null;
  anime?: number | null;
  gd?: number | null;
  link?: number | null;
  rarity?: string | null;
  cost?: number | null;
  level?: number | null;
  colores?: Set<number>;
  tags?: Set<number>;
  traits?: Set<number>;
  altArt?: boolean;
  ownedOnly?: boolean;
  userId?: number;
}
