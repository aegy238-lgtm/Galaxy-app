
export enum UserLevel {
  Newbie = 1,
  Regular = 10,
  Elite = 30,
  King = 99
}

export enum SeatStatus {
  Empty = 'empty',
  Occupied = 'occupied',
  Locked = 'locked'
}

export type FrameType = 'none' | 'gold' | 'neon' | 'wings' | 'fire' | 'ice';
export type ItemType = 'gift' | 'frame' | 'entry' | 'background';
// New supported animation formats
export type AnimationFormat = 'svga' | 'vap' | 'webp' | 'mp4';

export interface InventoryItem {
  id: string;
  itemId: string; // Reference to the base item
  name: string;
  icon: string;
  type: ItemType;
  count: number;
  isEquipped?: boolean;
  description?: string;
  value?: number; // For recycling or display
  // Custom frame properties
  frameUrl?: string;
  isSvga?: boolean;
}

export interface User {
  id: string;
  displayId: string; // The visible serial ID (e.g., 7269194)
  name: string;
  avatar: string;
  level: number;
  vipLevel: number; // 1-15
  frame?: FrameType;
  
  // Custom Frame Support
  frameUrl?: string;
  frameIsSvga?: boolean;
  
  // Profile Info
  gender: 'male' | 'female';
  age: number;
  countryFlag: string;
  bio?: string;

  // Economy
  coins: number;
  gems: number; 
  stones: number; // Magic Stones
  
  // Progress
  points: number;
  xp: number;
  nextLevelXp: number;
  
  // Social Stats
  followers: number;
  following: number;
  visitors: number;

  bookingPrice?: number;
  
  // Bag
  inventory: InventoryItem[];
}

export interface ShopItem {
  id: string;
  itemId: string;
  name: string;
  type: ItemType;
  price: number;
  currency: 'coins' | 'gems';
  icon: string;
  description?: string;
  count?: number;
  // Custom properties
  fileUrl?: string;
  isSvga?: boolean;
}

export interface Gift {
  id: string;
  name: string;
  price: number;
  currency: 'coins' | 'gems';
  icon: string;
  type: 'normal' | 'lucky' | 'luxury' | 'event' | 'svga';
  effect?: string;
  count?: number; // For inventory
  isSvga?: boolean; // Deprecated, prefer animationType
  animationType?: AnimationFormat; // Specifically determines player type
  fileUrl?: string; // URL for the SVGA/Animation file
  previewUrl?: string; // URL for the static image in the gift box
  soundUrl?: string; // URL for the sound effect
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: number;
  isSystem?: boolean;
  isGift?: boolean;
  giftData?: {
    giftName: string;
    count: number;
    icon: string;
    isSvga?: boolean;
    animationType?: AnimationFormat;
    previewUrl?: string;
  };
  vipLevel?: number;
  userFrame?: FrameType;
}

export interface Seat {
  id: number;
  status: SeatStatus;
  user?: User;
  isMuted: boolean;
  isTalking: boolean;
}

export interface RoomInfo {
  id: string;
  name: string;
  cover: string;
  hostName: string;
  userCount: number;
  tags: string[];
  isPrivate?: boolean;
  hasAgency?: boolean;
}

export type AppScreen = 'home' | 'room' | 'shop' | 'messages' | 'profile';
