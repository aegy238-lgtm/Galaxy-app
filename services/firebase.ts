import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, doc, setDoc, addDoc, getDocs, 
  query, where, onSnapshot, updateDoc, orderBy, limit, increment, deleteDoc 
} from "firebase/firestore";
import { User, RoomInfo, ChatMessage, Seat, SeatStatus, Gift, ShopItem } from "../types";
import { INITIAL_SEATS, CURRENT_USER } from "../constants";

const firebaseConfig = {
  apiKey: "AIzaSyCeFETWYSgYfEXrCAWoOf-iTaPmMvH6giU",
  authDomain: "galaxy-app-99165.firebaseapp.com",
  projectId: "galaxy-app-99165",
  storageBucket: "galaxy-app-99165.firebasestorage.app",
  messagingSenderId: "56446832930",
  appId: "1:56446832930:web:931a67ed088867ef1b157b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// --- User Functions ---

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  const q = query(collection(db, "users"), where("email", "==", email));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    if (userData.password === password) {
      // Return user data without password
      const { password: _, ...safeUser } = userData;
      return { ...safeUser, id: userDoc.id } as User;
    }
  }
  return null;
};

export const registerUser = async (email: string, password: string): Promise<User> => {
  // Generate a simple numeric Display ID
  const displayId = Math.floor(1000000 + Math.random() * 9000000).toString();
  
  const newUser: any = {
    ...CURRENT_USER,
    id: "", // Will be set by docref
    email,
    password, // Storing plain text for this demo only
    name: email.split('@')[0],
    displayId,
    coins: 1000, // Starting bonus
    inventory: CURRENT_USER.inventory || []
  };

  // Create document in "users" collection
  const docRef = await addDoc(collection(db, "users"), newUser);
  
  // Return user with the new ID
  return { ...newUser, id: docRef.id, password: undefined };
};

export const subscribeToUser = (userId: string, callback: (user: User) => void) => {
  return onSnapshot(doc(db, "users", userId), (doc) => {
    if (doc.exists()) {
      callback({ ...doc.data(), id: doc.id } as User);
    }
  });
};

export const updateUser = async (userId: string, data: Partial<User>) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, data);
};

// --- Admin Helper Functions ---

export const findUserByDisplayId = async (displayId: string): Promise<string | null> => {
  const q = query(collection(db, "users"), where("displayId", "==", displayId));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].id; // Return the Document ID (not the displayId)
  }
  return null;
};

// --- Room Functions ---

export const subscribeToRooms = (callback: (rooms: RoomInfo[]) => void) => {
  const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const rooms = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as RoomInfo));
    callback(rooms);
  });
};

export const createRoom = async (name: string, cover: string, host: User) => {
  const newRoom: any = {
    name,
    cover,
    hostName: host.name,
    hostId: host.id,
    userCount: 1,
    tags: ['جديد'],
    createdAt: Date.now(),
    seats: INITIAL_SEATS // Initialize seats in DB
  };
  await addDoc(collection(db, "rooms"), newRoom);
};

export const subscribeToRoomData = (roomId: string, callback: (data: any) => void) => {
  return onSnapshot(doc(db, "rooms", roomId), (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

export const updateRoomSeats = async (roomId: string, seats: Seat[]) => {
  const roomRef = doc(db, "rooms", roomId);
  await updateDoc(roomRef, { seats });
};

// --- Chat Functions ---

export const subscribeToMessages = (roomId: string, callback: (msgs: ChatMessage[]) => void) => {
  const q = query(collection(db, "rooms", roomId, "messages"), orderBy("timestamp", "asc"), limit(50));
  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ChatMessage));
    callback(msgs);
  });
};

export const sendChatMessage = async (roomId: string, message: Partial<ChatMessage>) => {
  await addDoc(collection(db, "rooms", roomId, "messages"), {
    ...message,
    timestamp: Date.now()
  });
};

// --- Economy Functions ---

export const handleTransaction = async (senderId: string, amount: number) => {
  const userRef = doc(db, "users", senderId);
  await updateDoc(userRef, {
    coins: increment(-amount)
  });
};

// --- Global Data (Gifts & Shop) ---

export const subscribeToGifts = (callback: (gifts: Gift[]) => void) => {
    return onSnapshot(collection(db, "gifts"), (snapshot) => {
        const gifts = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Gift));
        callback(gifts);
    });
};

export const addGiftToDb = async (gift: Gift) => {
    // Remove ID if present to let Firestore generate it, or use it as doc ID
    const { id, ...data } = gift;
    await addDoc(collection(db, "gifts"), data);
};

export const deleteGiftFromDb = async (giftId: string) => {
    await deleteDoc(doc(db, "gifts", giftId));
};

export const subscribeToShopItems = (callback: (items: ShopItem[]) => void) => {
    return onSnapshot(collection(db, "shopItems"), (snapshot) => {
        const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ShopItem));
        callback(items);
    });
};

export const addShopItemToDb = async (item: ShopItem) => {
    const { id, ...data } = item;
    await addDoc(collection(db, "shopItems"), data);
};

export const deleteShopItemFromDb = async (itemId: string) => {
    await deleteDoc(doc(db, "shopItems", itemId));
};