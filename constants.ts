import { Gift, Seat, SeatStatus, User, RoomInfo, ChatMessage, ShopItem } from './types';

export const CURRENT_USER: User = {
  id: 'me',
  displayId: '7269194',
  name: 'الكابتن ماجد',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SpaceCadet',
  level: 32,
  vipLevel: 6,
  frame: 'neon',
  gender: 'male',
  age: 24,
  countryFlag: '🇸🇦',
  bio: 'مستكشف في عالم الصوت 🚀',
  
  // Economy - INITIALIZED TO 0 AS REQUESTED
  coins: 50000, // Giving some coins for testing
  gems: 58862,
  stones: 24448,
  
  points: 1200,
  xp: 417299.38,
  nextLevelXp: 750000,
  
  followers: 8028,
  following: 1348,
  visitors: 77,

  // Initial Inventory
  inventory: [
    { id: 'inv1', itemId: 'frame_neon', name: 'إطار النيون', icon: '', type: 'frame', count: 1, isEquipped: true, description: 'إطار مشع بألوان السايبربانك' },
    { id: 'inv2', itemId: 'frame_gold', name: 'الإطار الذهبي', icon: '', type: 'frame', count: 1, isEquipped: false, description: 'إطار للملوك فقط' },
    { id: 'inv3', itemId: 'gift_rose', name: 'وردة جالاكسي', icon: '🌌', type: 'gift', count: 45, description: 'وردة من الفضاء الخارجي' },
    { id: 'inv4', itemId: 'gift_rocket', name: 'صاروخ', icon: '🚀', type: 'gift', count: 2, description: 'إلى اللانهاية وما بعدها' },
    { id: 'inv5', itemId: 'entry_flash', name: 'دخول البرق', icon: '⚡', type: 'entry', count: 1, isEquipped: true, description: 'تأثير دخول يظهر البرق حول اسمك' },
  ]
};

export const SHOP_ITEMS: ShopItem[] = [
  // Frames
  { id: 'shop_f1', itemId: 'frame_fire', name: 'إطار النار', type: 'frame', price: 2000, currency: 'coins', icon: '🔥', description: 'لمن يملكون الشغف' },
  { id: 'shop_f2', itemId: 'frame_wings', name: 'أجنحة الملاك', type: 'frame', price: 5000, currency: 'coins', icon: '🪽', description: 'حلق عالياً في الغرف' },
  { id: 'shop_f3', itemId: 'frame_ice', name: 'إطار الجليد', type: 'frame', price: 1500, currency: 'coins', icon: '❄️', description: 'برودة الأعصاب' },
  
  // Entry Effects
  { id: 'shop_e1', itemId: 'entry_royal', name: 'دخول ملكي', type: 'entry', price: 10000, currency: 'coins', icon: '🎺', description: 'موسيقى وأضواء عند دخولك' },
  { id: 'shop_e2', itemId: 'entry_ghost', name: 'دخول الشبح', type: 'entry', price: 3000, currency: 'coins', icon: '👻', description: 'دخول غامض' },

  // Gifts (Bulk)
  { id: 'shop_g1', itemId: 'gift_rose_10', name: 'باقة ورد (10)', type: 'gift', price: 90, currency: 'coins', icon: '💐', count: 10, description: '10 وردات جالاكسي' },
  { id: 'shop_g2', itemId: 'gift_rocket_5', name: 'صندوق صواريخ (5)', type: 'gift', price: 2200, currency: 'coins', icon: '🚀', count: 5, description: '5 صواريخ للدعم القوي' },
];

export const MOCK_GIFTS: Gift[] = [
  // Normal (Main)
  { id: '1', name: 'وردة', price: 1, currency: 'coins', icon: '🌹', type: 'normal' },
  { id: '2', name: 'قلب', price: 10, currency: 'coins', icon: '💙', type: 'normal' },
  { id: '4', name: 'صاروخ', price: 500, currency: 'coins', icon: '🚀', type: 'normal' },
  // Lucky
  { id: '5', name: 'روليت', price: 777, currency: 'coins', icon: '🎡', type: 'lucky' },
  { id: '3', name: 'نيزك', price: 199, currency: 'coins', icon: '☄️', type: 'lucky' },
  
  // Luxury (Formats)
  // SVGA - Using jsdelivr CDN for stable access and correct content-type/compression handling
  { id: 'gift_angel', name: 'الملاك', price: 5000, currency: 'coins', icon: '👼', type: 'luxury', animationType: 'svga', fileUrl: 'https://cdn.jsdelivr.net/gh/yyued/SVGAPlayer-Web@master/examples/angel.svga' },
  { id: 'gift_watch', name: 'ساعة فخمة', price: 8888, currency: 'coins', icon: '⌚', type: 'luxury', animationType: 'svga', fileUrl: 'https://cdn.jsdelivr.net/gh/yyued/SVGAPlayer-Web@master/examples/kingset.svga' },
  
  // VAP / MP4 (Using standard MP4 for demo, acts as VAP/DualChannel placeholder)
  { id: 'gift_car', name: 'سيارة VAP', price: 15000, currency: 'coins', icon: '🏎️', type: 'luxury', animationType: 'vap', fileUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pink-and-blue-ink-swirl-1193-large.mp4' },
  
  // WebP
  { id: 'gift_sticker', name: 'قطة WebP', price: 100, currency: 'coins', icon: '🐱', type: 'luxury', animationType: 'webp', fileUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXN6cndwOW14dWh4eDk3aXh5Z3V5eXJ6eXJ6eXJ6eXJ6eXJ6eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/Lq0h93752f6J9tijWZ/giphy.gif' }, // Using GIF/WebP url
];

// Helper to create mock user
const createMockUser = (id: string, name: string, seed: string, vip: number, frame: any): User => ({
  id, displayId: (1000 + parseInt(id)).toString(), name,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
  level: 10 + Math.floor(Math.random() * 50),
  vipLevel: vip, frame, coins: 0, gems: 0, stones: 0, points: 0, xp: 0, nextLevelXp: 0,
  followers: 0, following: 0, visitors: 0, gender: 'male', age: 20, countryFlag: '🏳️', inventory: []
});

export const INITIAL_SEATS: Seat[] = [
  // Seat 0: Host (Empty now)
  { id: 0, status: SeatStatus.Empty, isMuted: false, isTalking: false },
  // All other seats are empty
  { id: 1, status: SeatStatus.Empty, isMuted: false, isTalking: false },
  { id: 2, status: SeatStatus.Empty, isMuted: false, isTalking: false },
  { id: 3, status: SeatStatus.Empty, isMuted: false, isTalking: false },
  { id: 4, status: SeatStatus.Empty, isMuted: false, isTalking: false },
  { id: 5, status: SeatStatus.Empty, isMuted: false, isTalking: false },
  { id: 6, status: SeatStatus.Empty, isMuted: false, isTalking: false },
  { id: 7, status: SeatStatus.Empty, isMuted: false, isTalking: false },
  { id: 8, status: SeatStatus.Empty, isMuted: false, isTalking: false },
  { id: 9, status: SeatStatus.Empty, isMuted: false, isTalking: false },
];

export const SAMPLE_MESSAGES: ChatMessage[] = [
  { 
    id: '1', 
    userId: '101', 
    userName: 'رائد فضاء', 
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    content: 'يا هلا بملكة المجرة! 🪐', 
    timestamp: Date.now() - 60000,
    vipLevel: 5, 
    userFrame: 'gold' 
  },
  { 
    id: '2', 
    userId: '102', 
    userName: 'النجم الساطع', 
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Star',
    content: 'منورين الروم يا شباب ✨', 
    timestamp: Date.now() - 30000,
    vipLevel: 8, 
    userFrame: 'fire' 
  },
  { 
    id: '3', 
    userId: 'sys', 
    userName: 'VoiceGalaxy', 
    content: 'مرحباً بكم في VoiceGalaxy. انضموا للعائلة الآن!', 
    timestamp: Date.now(),
    isSystem: true 
  },
];

export const CATEGORIES = [
  { id: 'all', name: 'الكل' },
  { id: 'popular', name: 'مشهور' },
  { id: 'friends', name: 'أصدقاء' },
  { id: 'events', name: 'فعاليات' },
  { id: 'nearby', name: 'بالقرب' },
  { id: 'agency', name: 'وكالات' },
];

// MOCK ROOMS MATCHING THE SCREENSHOT
export const MOCK_ROOMS: RoomInfo[] = [
  { id: '101', name: 'Lavender', cover: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300', hostName: 'Lavender', userCount: 17, tags: ['وكالة الملوك'], hasAgency: true },
  { id: '102', name: 'ملوك اللعبة', cover: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300', hostName: 'silent', userCount: 17, tags: ['700'], hasAgency: true },
  { id: '103', name: 'سوالف وضحك للصبح 😂', cover: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=300', hostName: 'نكت', userCount: 2300, tags: ['اجتماعي'] },
  { id: '104', name: 'مسابقة الشعر النبطي', cover: 'https://images.unsplash.com/photo-1478720568477-152d9b164e63?auto=format&fit=crop&q=80&w=300', hostName: 'شاعر المليون', userCount: 540, tags: ['شعر'], isPrivate: true },
];

export const TOP_RANKINGS = [
  { id: 1, title: 'عائلة', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=60&w=100', badge: '1', color: 'blue' },
  { id: 2, title: 'قائمة CP', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=60&w=100', badge: '1', color: 'pink' },
  { id: 3, title: 'غرفة', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=60&w=100', badge: '1', color: 'gold' },
];

export const SERVICE_AGENTS = [
  { id: 1, name: 'خدمة العملاء الرسمية', sub: 'AR Assistant', icon: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Agent1', flag: '🇦🇪', color: 'bg-orange-100' },
  { id: 2, name: 'كوكب روقااان', sub: 'روقااان', icon: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Agent2', flag: '🇪🇬', color: 'bg-white' },
];