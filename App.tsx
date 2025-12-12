import React, { useState, useEffect, useRef } from 'react';
import { User, Seat, ChatMessage, Gift, SeatStatus, FrameType, RoomInfo, AppScreen, InventoryItem, ShopItem, AnimationFormat } from './types';
import { CURRENT_USER, INITIAL_SEATS, MOCK_GIFTS, SAMPLE_MESSAGES, CATEGORIES, MOCK_ROOMS, SHOP_ITEMS, SERVICE_AGENTS, TOP_RANKINGS } from './constants';
import { getSmartReply } from './services/geminiService';
import { 
  loginUser, registerUser, subscribeToRooms, createRoom, 
  subscribeToRoomData, updateRoomSeats, subscribeToMessages, 
  sendChatMessage, handleTransaction, subscribeToUser, updateUser,
  subscribeToGifts, subscribeToShopItems, addGiftToDb, deleteGiftFromDb,
  addShopItemToDb, deleteShopItemFromDb, findUserByDisplayId, db
} from './services/firebase';

// Add definition for SVGA global if not exists
declare global {
  interface Window {
    SVGA: any;
  }
}

// --- Icons Component Collection ---
const Icons = {
  Mic: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
  MicOff: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" stroke="currentColor" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>,
  Gift: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Emoji: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Menu: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>,
  Lock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Add: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Crown: () => <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
  Diamond: () => <svg className="w-3 h-3 text-cyan-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 1l10 6-10 13L0 7l10-6z"/></svg>,
  Bag: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
  Game: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>,
  Home: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Grid: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Chat: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  User: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Bell: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  ChevronLeft: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>,
  Exit: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Settings: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.066 2.573c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  Copy: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  Verified: () => <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
  Stone: () => <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>,
  History: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Medal: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Check: () => <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>,
  Close: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Camera: ({ size = 'md' }: { size?: 'sm' | 'md' }) => <svg className={size === 'sm' ? "w-3 h-3" : "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Puzzle: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>,
  Coin: () => <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="14" fill="currentColor" className="font-bold">$</text></svg>,
  Shop: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
  Shield: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Trash: () => <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Frame: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  // New Bottom Bar Icons
  Moon: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z" /></svg>,
  Envelope: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67z" /><path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908z" /></svg>,
  Lamp: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10.5 2a.75.75 0 0 1 .75.75v3.284c4.175.768 7.5 4.148 7.5 8.466v.75a2.25 2.25 0 0 1-2.25 2.25H7.5A2.25 2.25 0 0 1 5.25 15.25v-.75c0-4.318 3.325-7.698 7.5-8.466V2.75a.75.75 0 0 1-.75-.75z" /><path d="M12 21.75a3 3 0 0 1-3-3h6a3 3 0 0 1-3 3z" /></svg>,
  Mosque: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.25 2.5a.75.75 0 0 1 1.5 0v2.75l2.25 1.5V5.5a.75.75 0 0 1 1.5 0v2.09l1.78.966a.75.75 0 0 1 .306 1.025l-.97 1.792a.75.75 0 0 1-.95.312l-1.666-.834V20a1.5 1.5 0 0 1-1.5 1.5H10.5A1.5 1.5 0 0 1 9 20v-9.149l-1.666.834a.75.75 0 0 1-.95-.312l-.97-1.792a.75.75 0 0 1 .306-1.025l1.78-.966V5.5a.75.75 0 0 1 1.5 0v1.25l2.25-1.5V2.5z" /></svg>,
  Party: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.75 2.25h-1.5v3.265A10.505 10.505 0 0 0 2.25 14.5v1.875A3.375 3.375 0 0 0 5.625 19.75h12.75a3.375 3.375 0 0 0 3.375-3.375V14.5a10.505 10.505 0 0 0-9-8.985V2.25z" /><path d="M11.25 16.5v2.25h1.5V16.5a.75.75 0 0 0-1.5 0z" /><path d="M7.5 16.5v2.25h1.5V16.5a.75.75 0 0 0-1.5 0z" /><path d="M15 16.5v2.25h1.5V16.5a.75.75 0 0 0-1.5 0z" /></svg>
};

// --- Helper Functions ---

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const SVGAFrame = ({ url }: { url: string }) => {
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let mounted = true;
    if (window.SVGA && divRef.current && url) {
      const player = new window.SVGA.Player(divRef.current);
      const parser = new window.SVGA.Parser();
      try {
        parser.load(url, (videoItem: any) => {
          if (!mounted) return;
          player.setVideoItem(videoItem);
          player.startAnimation();
        }, (err: any) => {
          console.error("SVGA Parse Error (Async):", err);
        });
      } catch (e) { console.error("SVGA Parse Error (Sync):", e); }
      return () => { mounted = false; player.clear(); };
    }
  }, [url]);
  return <div ref={divRef} className="absolute inset-0 w-full h-full pointer-events-none z-10 scale-100" />;
};

const UniversalGiftPlayer = ({ url, animationType, soundUrl, onFinish }: { url: string, animationType: AnimationFormat, soundUrl?: string, onFinish: () => void }) => {
  const svgaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let mounted = true;
    
    // Sound Logic
    if (soundUrl) {
      const audio = new Audio(soundUrl);
      audio.volume = 0.6;
      audio.play().catch(e => console.error("Audio playback failed:", e));
    }

    if (animationType === 'svga' && window.SVGA && svgaRef.current && url) {
      const player = new window.SVGA.Player(svgaRef.current);
      const parser = new window.SVGA.Parser();
      player.loops = 1;
      player.clearsAfterStop = true;
      player.setContentMode('AspectFill'); 
      try {
        parser.load(url, (videoItem: any) => {
          if (!mounted) return;
          player.setVideoItem(videoItem);
          player.startAnimation();
          player.onFinished(() => { if (mounted) onFinish(); });
        }, (err: any) => {
          console.error("SVGA Parse Error (Async):", err);
          if (mounted) onFinish(); // Fallback to finish if animation fails
        });
      } catch (e) { 
        if (mounted) onFinish(); 
      }
      return () => { mounted = false; player.clear(); };
    } else if ((animationType === 'vap' || animationType === 'mp4') && videoRef.current && url) {
        videoRef.current.play().catch(e => onFinish());
    } else {
        const timer = setTimeout(onFinish, 3000);
        return () => clearTimeout(timer);
    }
  }, [url, animationType, soundUrl, onFinish]);

  if (animationType === 'svga') return <div className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden"><div ref={svgaRef} className="w-full h-full"></div></div>;
  if (animationType === 'vap' || animationType === 'mp4') return <div className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden"><video ref={videoRef} src={url} className="w-full h-full object-cover" playsInline muted onEnded={onFinish} style={{ mixBlendMode: 'screen' }} /></div>;
  return <div className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center animate-in fade-in duration-300 overflow-hidden"><img src={url} className="w-full h-full object-contain drop-shadow-2xl" /></div>;
};

const UserFrame: React.FC<{ type?: FrameType, children: React.ReactNode, isTalking?: boolean, size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl', customFrameUrl?: string, isSvga?: boolean }> = ({ type, children, isTalking, size = 'md', customFrameUrl, isSvga }) => {
  const sizeClasses = size === '2xl' ? 'w-32 h-32' : size === 'xl' ? 'w-24 h-24' : size === 'lg' ? 'w-20 h-20' : size === 'sm' ? 'w-10 h-10' : 'w-16 h-16';
  return (
    <div className={`relative flex items-center justify-center ${sizeClasses}`}>
       <div className="absolute inset-2 z-0 rounded-full overflow-hidden">{children}</div>
       {isTalking && <div className="absolute inset-1 rounded-full border-2 border-green-500 animate-pulse z-10 shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>}
       {customFrameUrl ? (
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center transform scale-[1.35]">
             {isSvga ? <SVGAFrame url={customFrameUrl} /> : <img src={customFrameUrl} className="w-full h-full object-contain" />}
          </div>
       ) : type !== 'none' && type ? (
          <div className={`absolute inset-0 pointer-events-none z-20 rounded-full border-2 border-transparent scale-110 
            ${type === 'gold' ? 'border-yellow-400 shadow-[0_0_10px_#fbbf24]' : ''}
            ${type === 'neon' ? 'border-purple-500 shadow-[0_0_10px_#a855f7]' : ''}
            ${type === 'fire' ? 'border-red-500 shadow-[0_0_10px_#ef4444]' : ''}
            ${type === 'wings' ? 'border-pink-400' : ''}
          `}>
             {type === 'wings' && <><div className="absolute -right-4 top-0 text-2xl drop-shadow-md">🪽</div><div className="absolute -left-4 top-0 text-2xl drop-shadow-md transform -scale-x-100">🪽</div></>}
          </div>
       ) : null}
    </div>
  );
};

// --- NEW VIP BADGE COMPONENT ---
const VipBadge = ({ level }: { level: number }) => {
  if (level <= 0) return null;
  
  let styleClass = "bg-gray-600";
  let icon = "🛡️";
  let label = `VIP ${level}`;

  if (level >= 1 && level < 10) {
      styleClass = "bg-gradient-to-r from-green-600 to-teal-600 border border-green-400/30";
      icon = "⚔️";
  } else if (level >= 10 && level < 30) {
      styleClass = "bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]";
      icon = "💎";
  } else if (level >= 30 && level < 60) {
      styleClass = "bg-gradient-to-r from-purple-600 to-pink-600 border border-purple-400/30 shadow-[0_0_10px_rgba(168,85,247,0.4)]";
      icon = "🚀";
  } else if (level >= 60 && level < 90) {
      styleClass = "bg-gradient-to-r from-yellow-500 to-orange-600 border border-yellow-300/50 shadow-[0_0_15px_rgba(234,179,8,0.5)]";
      icon = "👑";
  } else if (level >= 90) {
      styleClass = "bg-gradient-to-r from-red-600 to-rose-900 border border-red-500 shadow-[0_0_20px_rgba(225,29,72,0.6)] animate-pulse-fast";
      icon = "🐲"; // Dragon for max levels
  }

  return (
    <div className={`flex items-center gap-1 px-3 py-0.5 rounded-full text-white text-[10px] font-bold tracking-wide shadow-sm ${styleClass}`}>
       <span>{icon}</span> {label}
    </div>
  );
};

const SeatComponent: React.FC<{ seat: Seat, isHost: boolean, onClick?: () => void, isMe?: boolean }> = ({ seat, isHost, onClick }) => {
  return (
    <div onClick={onClick} className={`relative flex flex-col items-center justify-center transition-all duration-300 ${isHost ? 'z-10' : ''} cursor-pointer`}>
      {seat.status === SeatStatus.Occupied && seat.user ? (
        <UserFrame type={seat.user.frame} isTalking={seat.isTalking} customFrameUrl={seat.user.frameUrl} isSvga={seat.user.frameIsSvga} size={isHost ? 'lg' : 'md'}>
            <img src={seat.user.avatar} className="w-full h-full object-cover" />
            {isHost && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 z-30 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black text-[8px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-yellow-200">HOST</div>}
        </UserFrame>
      ) : (
        <div className={`relative rounded-full border-2 border-dashed border-white/10 w-16 h-16 flex items-center justify-center bg-white/5 backdrop-blur-sm shadow-inner hover:bg-white/10 hover:border-white/30 transition-colors group`}>
          <div className="text-white/20 group-hover:text-white/50 transition-colors"><Icons.Add /></div>
        </div>
      )}
      {seat.status === SeatStatus.Occupied && seat.user ? (
        <div className="mt-1 flex flex-col items-center">
          <span className="text-[10px] text-white font-medium truncate max-w-[70px] drop-shadow-md">{seat.user.name}</span>
          <span className="text-[8px] text-gray-400/80 font-mono tracking-wider -mt-0.5 mb-0.5">ID: {seat.user.displayId}</span>
          <div className="flex items-center gap-1 scale-90">
             <VipBadge level={seat.user.vipLevel} />
          </div>
        </div>
      ) : (
        <div className="mt-1 text-[10px] text-white/20 font-medium">{seat.id + 1}</div>
      )}
    </div>
  );
};

// --- ADMIN PANEL ---

const AdminPanel = ({ isOpen, onClose, rooms, users, gifts, shopItems, onCloseRoom, onBanUser, onAddGift, onDeleteGift, onRechargeUser, onAddShopItem, onDeleteShopItem, onUpdateShopItem, onUpdateUserVip, onUpdateBanner, currentBanner }: any) => {
   const [activeTab, setActiveTab] = useState('dashboard');
   // Gifts State
   const [newGiftName, setNewGiftName] = useState('');
   const [newGiftPrice, setNewGiftPrice] = useState(100);
   const [giftType, setGiftType] = useState<Gift['type']>('normal');
   const [animFormat, setAnimFormat] = useState<AnimationFormat>('svga');
   const [animationFile, setAnimationFile] = useState<File | null>(null);
   const [animationUrl, setAnimationUrl] = useState('');
   const [iconFile, setIconFile] = useState<File | null>(null);
   const [iconUrlText, setIconUrlText] = useState('');
   const [soundFile, setSoundFile] = useState<File | null>(null);
   
   // Shop Item State
   const [shopItemName, setShopItemName] = useState('');
   const [shopItemPrice, setShopItemPrice] = useState(500);
   const [shopItemType, setShopItemType] = useState<'frame' | 'entry'>('frame');
   const [shopItemFile, setShopItemFile] = useState<File | null>(null);
   const [shopItemFileUrl, setShopItemFileUrl] = useState('');
   const [shopItemIcon, setShopItemIcon] = useState<File | null>(null);
   const [shopItemIconUrl, setShopItemIconUrl] = useState('');
   
   // Recharge
   const [rechargeAmount, setRechargeAmount] = useState(1000);
   const [targetUserId, setTargetUserId] = useState('');

   if (!isOpen) return null;

   const handleAddGift = async () => {
      let fileUrl = animationUrl;
      let iconUrl = iconUrlText || '🎁';
      let soundUrl = undefined;

      // Process Icon File (Prefer Base64 for icons as they are small)
      if (iconFile) {
          try {
              const base64 = await fileToBase64(iconFile);
              if (base64.length > 500000) { // 500KB limit warning
                  alert('حجم صورة الأيقونة كبير جداً، يفضل استخدام رابط مباشر');
                  return;
              }
              iconUrl = base64;
          } catch (e) {
              console.error("Error converting icon", e);
          }
      }

      // Process Animation File (Prefer URL, fallback to Base64 with warning)
      if (animationFile && !fileUrl) {
           try {
              const base64 = await fileToBase64(animationFile);
              if (base64.length > 1000000) { // 1MB limit check
                  alert('حجم ملف الحركة كبير جداً لقاعدة البيانات! يرجى استخدام رابط مباشر (URL) لملف الـ SVGA/MP4');
                  return;
              }
              fileUrl = base64;
          } catch (e) {
              console.error("Error converting animation", e);
          }
      }
      
      const newGift = { 
          id: Date.now().toString(), 
          name: newGiftName || 'هدية', 
          price: newGiftPrice, 
          currency: 'coins' as const, 
          icon: iconUrl, 
          type: giftType, 
          isSvga: animFormat === 'svga', 
          animationType: (giftType === 'luxury' || giftType === 'svga') ? animFormat : undefined, 
          fileUrl: fileUrl, 
          previewUrl: iconUrl, 
          soundUrl: soundUrl 
      };

      await onAddGift(newGift);
      setNewGiftName(''); setAnimationFile(null); setAnimationUrl(''); setIconFile(null); setIconUrlText(''); setSoundFile(null); 
      alert('تمت إضافة الهدية بنجاح! 🎁 ستظهر لجميع المستخدمين.');
   };

   const handleSaveShopItem = async () => {
       let iconUrl = shopItemIconUrl || '✨';
       let fileUrl = shopItemFileUrl;

       if (shopItemIcon) {
           try {
               const base64 = await fileToBase64(shopItemIcon);
               iconUrl = base64;
           } catch (e) {}
       }

       if (shopItemFile && !fileUrl) {
           try {
               const base64 = await fileToBase64(shopItemFile);
               if (base64.length > 1000000) {
                   alert('ملف الإطار كبير جداً! يرجى استخدام رابط URL مباشر.');
                   return;
               }
               fileUrl = base64;
           } catch (e) {}
       }

       const newItem = { 
           id: Date.now().toString(), 
           itemId: `${shopItemType}_${Date.now()}`, 
           name: shopItemName, 
           type: shopItemType, 
           price: shopItemPrice, 
           currency: 'coins' as const, 
           icon: iconUrl, 
           fileUrl: fileUrl, 
           isSvga: (shopItemFile?.name.endsWith('.svga') || fileUrl?.endsWith('.svga')) 
       };
       
       await onAddShopItem(newItem);
       setShopItemName(''); setShopItemFile(null); setShopItemFileUrl(''); setShopItemIcon(null); setShopItemIconUrl('');
       alert('تمت إضافة الغرض للمتجر! 🛒 سيظهر للجميع.');
   };

   const handleRecharge = async () => {
       if (!targetUserId) return alert('يرجى إدخال ID المستخدم');
       await onRechargeUser(targetUserId, rechargeAmount);
       alert('تم تنفيذ العملية بنجاح ✅');
   };

   return (
      <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
         <div className="bg-[#16162a] w-full max-w-4xl max-h-[90vh] rounded-2xl flex flex-col border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#0B0B1E]">
               <div className="flex items-center gap-3"><div className="p-2 bg-purple-600 rounded-lg"><Icons.Shield /></div><h2 className="text-xl font-bold text-white">لوحة الإدارة المتقدمة</h2></div>
               <button onClick={onClose} className="hover:text-red-500 transition-colors"><Icons.Close /></button>
            </div>
            <div className="flex flex-1 overflow-hidden">
               <div className="w-48 bg-[#0f0f1a] border-l border-white/10 flex flex-col p-3 gap-2">
                  {[
                      {id: 'dashboard', icon: <Icons.Grid />, label: 'الرئيسية'},
                      {id: 'rooms', icon: <Icons.Home />, label: 'الغرف'},
                      {id: 'users', icon: <Icons.User />, label: 'المستخدمين'},
                      {id: 'gifts', icon: <Icons.Gift />, label: 'الهدايا'},
                      {id: 'shop', icon: <Icons.Shop />, label: 'المتجر'},
                      {id: 'recharge', icon: <Icons.Coin />, label: 'الشحن & VIP'}
                  ].map(tab => ( 
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
                          {tab.icon} <span className="font-bold text-sm">{tab.label}</span>
                      </button> 
                  ))}
               </div>
               <div className="flex-1 overflow-y-auto p-8 bg-[#16162a]">
                  {activeTab === 'dashboard' && (
                      <div className="space-y-6">
                          <div className="grid grid-cols-3 gap-6">
                              <div className="bg-gradient-to-br from-purple-900 to-[#1e1e2e] p-6 rounded-2xl border border-white/5 shadow-xl">
                                  <h3 className="text-gray-400 text-sm mb-2">المستخدمين النشطين</h3>
                                  <p className="text-4xl font-bold text-white">{users.length}</p>
                              </div>
                              <div className="bg-gradient-to-br from-pink-900 to-[#1e1e2e] p-6 rounded-2xl border border-white/5 shadow-xl">
                                  <h3 className="text-gray-400 text-sm mb-2">الغرف المفتوحة</h3>
                                  <p className="text-4xl font-bold text-white">{rooms.length}</p>
                              </div>
                              <div className="bg-gradient-to-br from-yellow-900 to-[#1e1e2e] p-6 rounded-2xl border border-white/5 shadow-xl">
                                  <h3 className="text-gray-400 text-sm mb-2">الهدايا المتاحة</h3>
                                  <p className="text-4xl font-bold text-white">{gifts.length}</p>
                              </div>
                          </div>
                      </div>
                  )}

                  {activeTab === 'rooms' && (
                      <div className="space-y-4">
                          <h3 className="text-xl font-bold mb-4">إدارة الغرف</h3>
                          {rooms.map((r: any) => (
                              <div key={r.id} className="flex justify-between items-center bg-[#252535] p-4 rounded-xl border border-white/5">
                                  <div className="flex items-center gap-3">
                                      <img src={r.cover} className="w-10 h-10 rounded-lg object-cover" />
                                      <div><div className="font-bold">{r.name}</div><div className="text-xs text-gray-500">ID: {r.id}</div></div>
                                  </div>
                                  <button onClick={() => onCloseRoom(r.id)} className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all text-sm font-bold">إغلاق الغرفة</button>
                              </div>
                          ))}
                      </div>
                  )}

                  {activeTab === 'users' && (
                      <div className="space-y-4">
                          <h3 className="text-xl font-bold mb-4">المستخدمين</h3>
                          {users.map((u: any) => (
                              <div key={u.id} className="flex justify-between items-center bg-[#252535] p-4 rounded-xl border border-white/5">
                                  <div className="flex items-center gap-3">
                                      <img src={u.avatar} className="w-10 h-10 rounded-full" />
                                      <div><div className="font-bold">{u.name}</div><div className="text-xs text-gray-500">ID: {u.displayId}</div></div>
                                  </div>
                                  <div className="flex gap-2">
                                      <div className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded text-xs font-bold">VIP {u.vipLevel}</div>
                                      <button onClick={() => onBanUser(u.displayId)} className="text-red-500 hover:text-red-400 font-bold text-sm">حظر</button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}

                  {activeTab === 'recharge' && (
                      <div className="space-y-6">
                          <div className="bg-[#252535] p-6 rounded-2xl border border-white/5">
                              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Icons.Coin /> إدارة رصيد المستخدمين</h3>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                  <input value={targetUserId} onChange={e => setTargetUserId(e.target.value)} placeholder="معرف المستخدم (ID)" className="bg-black/30 border border-white/10 rounded-xl p-3 text-white" />
                                  <input type="number" value={rechargeAmount} onChange={e => setRechargeAmount(parseInt(e.target.value))} placeholder="الكمية" className="bg-black/30 border border-white/10 rounded-xl p-3 text-white" />
                              </div>
                              <div className="flex gap-4">
                                  <button onClick={() => handleRecharge()} className="flex-1 bg-gradient-to-r from-green-600 to-green-500 py-3 rounded-xl font-bold text-white hover:scale-[1.02] transition-transform">شحن (إضافة) ➕</button>
                                  <button onClick={() => { setRechargeAmount(-rechargeAmount); handleRecharge(); }} className="flex-1 bg-gradient-to-r from-red-600 to-red-500 py-3 rounded-xl font-bold text-white hover:scale-[1.02] transition-transform">خصم (تنزيل) ➖</button>
                              </div>
                          </div>

                          <div className="bg-[#252535] p-6 rounded-2xl border border-white/5">
                              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Icons.Crown /> تعديل VIP</h3>
                              <p className="text-xs text-gray-400 mb-4">المستخدم الحالي: {users[0]?.name}</p>
                              {users.length > 0 && <div className="flex items-center gap-4">
                                  <input type="range" min="0" max="99" value={users[0]?.vipLevel || 0} onChange={e => onUpdateUserVip(users[0]?.displayId, parseInt(e.target.value))} className="flex-1 accent-purple-500" />
                                  <input type="number" min="0" max="99" value={users[0]?.vipLevel || 0} onChange={e => onUpdateUserVip(users[0]?.displayId, parseInt(e.target.value))} className="w-16 bg-black/40 border border-white/10 rounded-lg text-center text-white font-bold" />
                                  <VipBadge level={users[0]?.vipLevel || 0} />
                              </div>}
                          </div>
                      </div>
                  )}

                  {activeTab === 'gifts' && (
                      <div className="space-y-6">
                          <div className="bg-[#252535] p-6 rounded-2xl border border-white/5">
                              <h3 className="text-lg font-bold mb-4">إضافة هدية جديدة</h3>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                  <input value={newGiftName} onChange={e => setNewGiftName(e.target.value)} placeholder="اسم الهدية" className="bg-black/30 border border-white/10 rounded-xl p-3" />
                                  <input type="number" value={newGiftPrice} onChange={e => setNewGiftPrice(parseInt(e.target.value))} placeholder="السعر" className="bg-black/30 border border-white/10 rounded-xl p-3" />
                              </div>
                              <div className="flex gap-4 mb-4">
                                  {['normal', 'lucky', 'luxury', 'svga'].map(t => (
                                      <button key={t} onClick={() => setGiftType(t as any)} className={`flex-1 py-2 rounded-xl text-sm font-bold border ${giftType === t ? 'bg-purple-600 border-purple-500' : 'border-white/10 text-gray-400'}`}>{t.toUpperCase()}</button>
                                  ))}
                              </div>
                              {(giftType === 'luxury' || giftType === 'svga') && (
                                  <div className="mb-4">
                                      <label className="text-xs text-gray-400 mb-2 block">نوع الملف:</label>
                                      <div className="flex gap-2">
                                          {['svga', 'mp4', 'vap', 'webp'].map(f => (
                                              <button key={f} onClick={() => setAnimFormat(f as any)} className={`px-4 py-1 rounded-lg text-xs font-bold ${animFormat === f ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500'}`}>{f}</button>
                                          ))}
                                      </div>
                                  </div>
                              )}
                              <div className="grid grid-cols-2 gap-4 mb-6">
                                  <div>
                                      <label className="text-xs text-gray-400 mb-2 block">ملف الحركة (SVGA/MP4):</label>
                                      <input type="file" onChange={e => setAnimationFile(e.target.files?.[0] || null)} className="text-xs text-gray-400 mb-2 w-full file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-purple-600 file:text-white" />
                                      <input value={animationUrl} onChange={e => setAnimationUrl(e.target.value)} placeholder="أو رابط مباشر (URL)" className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs" />
                                  </div>
                                  <div>
                                      <label className="text-xs text-gray-400 mb-2 block">أيقونة الهدية (صورة):</label>
                                      <input type="file" onChange={e => setIconFile(e.target.files?.[0] || null)} className="text-xs text-gray-400 mb-2 w-full file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-purple-600 file:text-white" />
                                      <input value={iconUrlText} onChange={e => setIconUrlText(e.target.value)} placeholder="أو رابط مباشر (URL)" className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs" />
                                  </div>
                              </div>
                              <button onClick={handleAddGift} className="w-full bg-green-600 py-3 rounded-xl font-bold text-white hover:bg-green-500 transition-colors">إضافة الهدية للقائمة (عام) 🎁</button>
                          </div>
                          
                          <div>
                             <h4 className="font-bold mb-3">الهدايا الحالية (ستظهر للجميع)</h4>
                             <div className="grid grid-cols-4 gap-3">
                                 {gifts.map((g: any) => (
                                     <div key={g.id} className="bg-black/20 p-2 rounded-lg text-center relative group">
                                         <div className="text-2xl mb-1">{(g.icon.startsWith('http') || g.icon.startsWith('data:')) ? <img src={g.icon} className="w-8 h-8 mx-auto object-contain"/> : g.icon}</div>
                                         <div className="text-[10px] truncate">{g.name}</div>
                                         <button onClick={() => onDeleteGift(g.id)} className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100"><Icons.Close /></button>
                                     </div>
                                 ))}
                             </div>
                          </div>
                      </div>
                  )}

                  {activeTab === 'shop' && (
                      <div className="space-y-6">
                          <div className="bg-[#252535] p-6 rounded-2xl border border-white/5">
                              <h3 className="text-lg font-bold mb-4">إضافة للمتجر (إطارات/دخول)</h3>
                              <div className="flex gap-4 mb-4">
                                  <button onClick={() => setShopItemType('frame')} className={`flex-1 py-2 rounded-xl text-sm font-bold ${shopItemType === 'frame' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400'}`}>إطار (Frame)</button>
                                  <button onClick={() => setShopItemType('entry')} className={`flex-1 py-2 rounded-xl text-sm font-bold ${shopItemType === 'entry' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'}`}>تأثير دخول</button>
                              </div>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                  <input value={shopItemName} onChange={e => setShopItemName(e.target.value)} placeholder="اسم العنصر" className="bg-black/30 border border-white/10 rounded-xl p-3" />
                                  <input type="number" value={shopItemPrice} onChange={e => setShopItemPrice(parseInt(e.target.value))} placeholder="السعر" className="bg-black/30 border border-white/10 rounded-xl p-3" />
                              </div>
                              <div className="grid grid-cols-2 gap-4 mb-6">
                                  <div>
                                      <label className="text-xs text-gray-400 mb-2 block">ملف الإطار/الدخول (SVGA/PNG):</label>
                                      <input type="file" onChange={e => setShopItemFile(e.target.files?.[0] || null)} className="text-xs text-gray-400 mb-2 w-full file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-blue-600 file:text-white" />
                                      <input value={shopItemFileUrl} onChange={e => setShopItemFileUrl(e.target.value)} placeholder="أو رابط مباشر (URL)" className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs" />
                                  </div>
                                  <div>
                                      <label className="text-xs text-gray-400 mb-2 block">أيقونة المتجر:</label>
                                      <input type="file" onChange={e => setShopItemIcon(e.target.files?.[0] || null)} className="text-xs text-gray-400 mb-2 w-full file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-blue-600 file:text-white" />
                                      <input value={shopItemIconUrl} onChange={e => setShopItemIconUrl(e.target.value)} placeholder="أو رابط مباشر (URL)" className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs" />
                                  </div>
                              </div>
                              <button onClick={handleSaveShopItem} className="w-full bg-blue-600 py-3 rounded-xl font-bold text-white hover:bg-blue-500 transition-colors">إضافة للمتجر (عام) 🛒</button>
                          </div>
                          
                          <div>
                             <h4 className="font-bold mb-3">عناصر المتجر (ستظهر للجميع)</h4>
                             <div className="grid grid-cols-2 gap-3">
                                 {shopItems.map((item: any) => (
                                     <div key={item.id} className="bg-black/20 p-3 rounded-lg flex items-center justify-between border border-white/5">
                                         <div className="flex items-center gap-2">
                                             <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-lg">{(item.icon.startsWith('http') || item.icon.startsWith('data:')) ? <img src={item.icon} className="w-full h-full object-contain"/> : item.icon}</div>
                                             <div><div className="text-xs font-bold">{item.name}</div><div className="text-[9px] text-yellow-500">{item.price}</div></div>
                                         </div>
                                         <button onClick={() => onDeleteShopItem(item.id)} className="text-red-500 hover:text-red-400"><Icons.Trash /></button>
                                     </div>
                                 ))}
                             </div>
                          </div>
                      </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

// --- APP SCREENS & COMPONENTS ---

const AuthPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setError('');
    try {
      let user;
      if (isLogin) {
        user = await loginUser(email, password);
      } else {
        user = await registerUser(email, password);
      }
      if (user) {
        onLogin(user);
      } else {
        setError('فشل المصادقة');
      }
    } catch (e) {
      setError('حدث خطأ');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f0f1a] text-white p-6">
      <div className="w-full max-w-sm bg-[#1e1e2e] p-8 rounded-2xl shadow-2xl border border-white/5">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">VoiceGalaxy</h1>
          <p className="text-gray-400 mt-2">عالمك الصوتي الخاص</p>
        </div>
        <div className="space-y-4">
          <input 
            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500" 
            placeholder="البريد الإلكتروني" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500" 
            placeholder="كلمة المرور" 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button 
            onClick={handleAuth}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
          >
            {isLogin ? 'دخول' : 'تسجيل جديد'}
          </button>
          <div className="text-center text-sm text-gray-500 cursor-pointer hover:text-white" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب؟ سجل دخول'}
          </div>
        </div>
      </div>
    </div>
  );
};

const HomePage = ({ user, rooms, onJoinRoom, onCreateRoom, activeTab, onTabChange }: any) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomName, setRoomName] = useState('');

  return (
    <div className="pb-24">
       {/* Header */}
       <div className="bg-[#16162a] p-4 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                <img src={user.avatar} className="w-full h-full rounded-full object-cover border-2 border-[#16162a]" />
             </div>
             <div>
                <h2 className="font-bold text-white">{user.name}</h2>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                   <span className="bg-yellow-500/10 text-yellow-500 px-1.5 rounded">LV.{user.level}</span>
                   <span>ID: {user.displayId}</span>
                </div>
             </div>
          </div>
          <div className="flex gap-3 text-white">
             <Icons.Search />
             <Icons.Bell />
          </div>
       </div>

       {/* Banner */}
       <div className="p-4">
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-4 h-32 flex items-center justify-between relative overflow-hidden">
             <div className="z-10">
                <h3 className="font-bold text-xl mb-1">بطولة المجرة 🏆</h3>
                <p className="text-sm text-purple-200">شارك واربح جوائز قيمة</p>
                <button className="mt-2 bg-white text-purple-900 px-4 py-1 rounded-full text-xs font-bold">اشترك الآن</button>
             </div>
             <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-black/20 to-transparent"></div>
          </div>
       </div>

       {/* Categories */}
       <div className="px-4 mb-4 overflow-x-auto flex gap-3 no-scrollbar">
          {CATEGORIES.map(cat => (
             <button key={cat.id} 
                onClick={() => onTabChange(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === cat.id ? 'bg-white text-black' : 'bg-white/5 text-gray-400'}`}>
                {cat.name}
             </button>
          ))}
       </div>

       {/* Rooms Grid */}
       <div className="px-4 grid grid-cols-2 gap-3">
          {rooms.map((room: RoomInfo) => (
             <div key={room.id} onClick={() => onJoinRoom(room)} className="bg-[#1e1e2e] rounded-xl overflow-hidden cursor-pointer group">
                <div className="relative h-32">
                   <img src={room.cover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      {room.userCount}
                   </div>
                   {room.hasAgency && <div className="absolute top-2 right-2 bg-purple-600 px-2 py-0.5 rounded text-[9px] font-bold">AGENCY</div>}
                </div>
                <div className="p-3">
                   <h3 className="font-bold text-sm truncate">{room.name}</h3>
                   <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400">{room.hostName}</span>
                      <div className="flex gap-1">
                         {room.tags.slice(0, 1).map(tag => (
                            <span key={tag} className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400">{tag}</span>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          ))}
       </div>

       {/* Create Room Modal */}
       {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
             <div className="bg-[#1e1e2e] p-6 rounded-2xl w-full max-w-sm">
                <h3 className="text-xl font-bold mb-4">إنشاء غرفة جديدة</h3>
                <input 
                   className="w-full bg-black/30 border border-white/10 rounded-xl p-3 mb-4 text-white"
                   placeholder="اسم الغرفة"
                   value={roomName}
                   onChange={e => setRoomName(e.target.value)}
                />
                <div className="flex gap-3">
                   <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10">إلغاء</button>
                   <button onClick={() => { onCreateRoom(roomName, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'); setShowCreateModal(false); }} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold">إنشاء</button>
                </div>
             </div>
          </div>
       )}

       <button onClick={() => setShowCreateModal(true)} className="fixed bottom-24 right-4 w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-pink-600/30 z-40">
          <Icons.Add />
       </button>
    </div>
  );
};

const RoomPage = ({ user, room, onExit, gifts }: any) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [seats, setSeats] = useState<Seat[]>(INITIAL_SEATS);
  const [activeGift, setActiveGift] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     // Subscribe to room data and messages
     const unsubData = subscribeToRoomData(room.id, (data) => {
        if (data.seats) setSeats(data.seats);
     });
     const unsubMsgs = subscribeToMessages(room.id, (msgs) => {
        setMessages(msgs);
        // Check for gift messages to play animation
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg && lastMsg.isGift && Date.now() - lastMsg.timestamp < 3000) {
           if (lastMsg.giftData) {
              setActiveGift({
                 url: lastMsg.giftData.animationType === 'svga' ? (lastMsg.giftData.previewUrl || '') : (lastMsg.giftData.previewUrl || ''),
                 // Logic to handle actual animation URL would need to be passed in message or looked up.
                 // For demo, we assume previewUrl contains the animation file if SVGA/MP4, or we need to lookup in gifts list
                 // Let's optimize: ChatMessage should contain fileUrl
              });
              // Better: find gift in global list
              const giftDef = gifts.find((g: Gift) => g.name === lastMsg.giftData?.giftName);
              if (giftDef) {
                 setActiveGift({
                    url: giftDef.fileUrl || giftDef.icon,
                    type: giftDef.animationType || (giftDef.isSvga ? 'svga' : 'normal'),
                    sound: giftDef.soundUrl
                 });
              }
           }
        }
     });

     // Join room logic (take a seat if host, etc) - Simplified
     if (user.id === room.hostId && seats[0].status === SeatStatus.Empty) {
        const newSeats = [...seats];
        newSeats[0] = { ...newSeats[0], status: SeatStatus.Occupied, user: user };
        updateRoomSeats(room.id, newSeats);
     }

     return () => {
        unsubData();
        unsubMsgs();
     }
  }, [room.id]);

  useEffect(() => {
     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
     if (!inputValue.trim()) return;
     await sendChatMessage(room.id, {
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: inputValue,
        userFrame: user.frame,
        vipLevel: user.vipLevel
     });
     setInputValue('');
  };

  const handleSendGift = async (gift: Gift) => {
      // 1. Deduct balance (mock)
      await handleTransaction(user.id, gift.price);
      // 2. Send gift message
      await sendChatMessage(room.id, {
         userId: user.id,
         userName: user.name,
         content: `أرسل ${gift.name} x1`,
         isGift: true,
         giftData: {
            giftName: gift.name,
            count: 1,
            icon: gift.icon,
            isSvga: gift.isSvga,
            animationType: gift.animationType
         }
      });
  };

  // Simple Gift Picker
  const [showGiftPicker, setShowGiftPicker] = useState(false);

  return (
     <div className="h-screen flex flex-col relative bg-[#16162a]">
        {/* Background */}
        <div className="absolute inset-0 opacity-30">
           <img src={room.cover} className="w-full h-full object-cover blur-xl" />
        </div>

        {/* Animation Layer */}
        {activeGift && (
           <UniversalGiftPlayer 
              url={activeGift.url} 
              animationType={activeGift.type} 
              soundUrl={activeGift.sound} 
              onFinish={() => setActiveGift(null)} 
           />
        )}

        {/* Header */}
        <div className="relative z-10 p-4 flex justify-between items-start">
           <div className="flex gap-2">
              <div className="bg-black/40 backdrop-blur-md rounded-full p-1 pr-4 flex items-center gap-2">
                 <img src={room.cover} className="w-8 h-8 rounded-full border border-white/20" />
                 <div>
                    <h3 className="text-xs font-bold text-white max-w-[100px] truncate">{room.name}</h3>
                    <p className="text-[9px] text-gray-300">ID: {room.id}</p>
                 </div>
                 <button onClick={onExit} className="bg-white/10 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-500/50 transition-colors ml-2">
                    <Icons.Exit />
                 </button>
              </div>
           </div>
           <div className="flex gap-2">
              {/* Online Users Mock */}
              <div className="flex -space-x-2">
                 {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-gray-500 border-2 border-[#16162a]"></div>)}
              </div>
              <div className="bg-black/40 rounded-full px-3 py-1 text-xs font-bold flex items-center">{room.userCount} 👤</div>
           </div>
        </div>

        {/* Seats Grid */}
        <div className="relative z-10 flex-1 overflow-y-auto px-2 mt-4">
           <div className="grid grid-cols-5 gap-y-6 gap-x-2 justify-items-center">
              {seats.map((seat) => (
                 <SeatComponent key={seat.id} seat={seat} isHost={seat.id === 0} />
              ))}
           </div>
        </div>

        {/* Chat Area */}
        <div className="relative z-10 h-1/3 bg-gradient-to-t from-[#16162a] via-[#16162a]/90 to-transparent p-4 flex flex-col justify-end">
           <div className="overflow-y-auto space-y-2 mb-4 mask-image-linear-to-t">
              {messages.map((msg) => (
                 <div key={msg.id} className="flex items-start gap-2 animate-in slide-in-from-left-2">
                    {msg.isSystem ? (
                       <span className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded">{msg.content}</span>
                    ) : msg.isGift ? (
                       <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-2 flex items-center gap-2 border border-pink-500/20">
                          <span className="font-bold text-pink-400 text-xs">{msg.userName}:</span>
                          <span className="text-xs text-white">أرسل {msg.giftData?.giftName}</span>
                          <img src={msg.giftData?.icon} className="w-5 h-5" />
                       </div>
                    ) : (
                       <div className="bg-black/40 rounded-2xl rounded-tl-none px-3 py-1.5 max-w-[80%]">
                           <div className="flex items-center gap-2 mb-0.5">
                              {msg.vipLevel && <VipBadge level={msg.vipLevel} />}
                              <span className="font-bold text-[10px] text-gray-300">{msg.userName}</span>
                           </div>
                           <p className="text-sm text-white">{msg.content}</p>
                       </div>
                    )}
                 </div>
              ))}
              <div ref={chatEndRef} />
           </div>

           {/* Controls */}
           <div className="flex items-center gap-2">
              <button className="p-2 bg-white/10 rounded-full"><Icons.Mic /></button>
              <div className="flex-1 bg-black/40 rounded-full flex items-center px-4 py-2 border border-white/5">
                 <input 
                    className="flex-1 bg-transparent text-sm outline-none text-white placeholder-gray-500" 
                    placeholder="قل شيئاً..."
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                 />
                 <button onClick={() => setInputValue(prev => prev + "❤️")} className="text-gray-400 hover:text-red-500"><Icons.Emoji /></button>
              </div>
              <button onClick={() => setShowGiftPicker(!showGiftPicker)} className="p-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full animate-pulse-slow">
                 <Icons.Gift />
              </button>
              <button onClick={handleSend} className="p-2 bg-blue-600 rounded-full"><Icons.ArrowRight /></button>
           </div>
        </div>

        {/* Gift Picker Modal (Inline for simplicity) */}
        {showGiftPicker && (
           <div className="absolute bottom-0 left-0 right-0 bg-[#1e1e2e] rounded-t-3xl p-4 z-50 animate-in slide-in-from-bottom border-t border-white/10">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold">إرسال هدية</h3>
                 <button onClick={() => setShowGiftPicker(false)}><Icons.Close /></button>
              </div>
              <div className="grid grid-cols-4 gap-4 max-h-60 overflow-y-auto">
                 {gifts.map((g: Gift) => (
                    <div key={g.id} onClick={() => { handleSendGift(g); setShowGiftPicker(false); }} className="flex flex-col items-center gap-1 cursor-pointer hover:bg-white/5 p-2 rounded-lg">
                       <div className="text-3xl">{(g.icon.startsWith('http') || g.icon.startsWith('data:')) ? <img src={g.icon} className="w-10 h-10 object-contain"/> : g.icon}</div>
                       <span className="text-xs truncate max-w-full">{g.name}</span>
                       <span className="text-[10px] text-yellow-500 font-mono">{g.price}</span>
                    </div>
                 ))}
              </div>
           </div>
        )}
     </div>
  );
};

// Simple Arrow Right Icon locally
Icons.ArrowRight = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>;

const ShopPage = ({ user, items }: any) => {
  return (
    <div className="pb-24 p-4 min-h-screen">
       <h2 className="text-2xl font-bold mb-6">المتجر 🛒</h2>
       <div className="grid grid-cols-2 gap-4">
          {items.map((item: ShopItem) => (
             <div key={item.id} className="bg-[#1e1e2e] p-4 rounded-xl border border-white/5 flex flex-col items-center gap-3">
                <div className="w-20 h-20 bg-black/30 rounded-full flex items-center justify-center relative">
                   {item.type === 'frame' ? (
                      <UserFrame type={item.itemId as any} customFrameUrl={item.fileUrl} isSvga={item.isSvga} size="lg"><div className="bg-gray-700 w-full h-full"></div></UserFrame>
                   ) : (
                      <div className="text-4xl">{item.icon.length > 20 ? <img src={item.icon} className="w-12 h-12"/> : item.icon}</div>
                   )}
                </div>
                <div className="text-center">
                   <div className="font-bold">{item.name}</div>
                   <div className="text-yellow-500 font-mono text-sm">{item.price} 💰</div>
                </div>
                <button className="w-full bg-white/10 hover:bg-white/20 py-2 rounded-lg text-sm font-bold">شراء</button>
             </div>
          ))}
       </div>
    </div>
  );
}

const ProfilePage = ({ user }: any) => {
  return (
     <div className="pb-24 min-h-screen bg-[#0f0f1a]">
        <div className="h-40 bg-gradient-to-r from-purple-800 to-blue-800"></div>
        <div className="px-6 -mt-16 flex justify-between items-end">
           <div className="w-24 h-24 rounded-full border-4 border-[#0f0f1a] relative">
              <UserFrame type={user.frame} customFrameUrl={user.frameUrl} isSvga={user.frameIsSvga} size="xl">
                 <img src={user.avatar} className="w-full h-full object-cover" />
              </UserFrame>
           </div>
           <button className="bg-white/10 px-4 py-2 rounded-full text-sm font-bold mb-2">تعديل الملف</button>
        </div>
        <div className="p-6">
           <h2 className="text-2xl font-bold flex items-center gap-2">
              {user.name} 
              <VipBadge level={user.vipLevel} />
           </h2>
           <p className="text-gray-400 text-sm mt-1">ID: {user.displayId}</p>
           
           <div className="flex gap-8 mt-6 border-b border-white/5 pb-6">
              <div className="text-center"><div className="font-bold text-xl">{user.following}</div><div className="text-xs text-gray-500">متابِع</div></div>
              <div className="text-center"><div className="font-bold text-xl">{user.followers}</div><div className="text-xs text-gray-500">متابَع</div></div>
              <div className="text-center"><div className="font-bold text-xl">{user.visitors}</div><div className="text-xs text-gray-500">زائر</div></div>
           </div>

           <div className="mt-6 space-y-4">
              <div className="bg-[#1e1e2e] p-4 rounded-xl flex justify-between items-center">
                 <div className="flex items-center gap-3"><div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500"><Icons.Coin /></div><span>المحفظة</span></div>
                 <div className="font-mono text-yellow-500">{user.coins}</div>
              </div>
              <div className="bg-[#1e1e2e] p-4 rounded-xl flex justify-between items-center">
                 <div className="flex items-center gap-3"><div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Icons.Bag /></div><span>حقيبتي</span></div>
                 <Icons.ChevronLeft />
              </div>
              <div className="bg-[#1e1e2e] p-4 rounded-xl flex justify-between items-center">
                 <div className="flex items-center gap-3"><div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Icons.Settings /></div><span>الإعدادات</span></div>
                 <Icons.ChevronLeft />
              </div>
           </div>
        </div>
     </div>
  );
}

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<AppScreen>('home');
  const [currentRoom, setCurrentRoom] = useState<RoomInfo | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  
  // Admin Panel State
  const [showAdmin, setShowAdmin] = useState(false);
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);

  useEffect(() => {
    // Initial data loading
    const unsubRooms = subscribeToRooms(setRooms);
    const unsubGifts = subscribeToGifts(setGifts);
    const unsubShop = subscribeToShopItems(setShopItems);
    
    return () => {
      unsubRooms();
      unsubGifts();
      unsubShop();
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    subscribeToUser(u.id, (updatedUser) => {
      setUser(updatedUser);
    });
  };

  const handleCreateRoom = async (name: string, cover: string) => {
    if (user) {
      await createRoom(name, cover, user);
    }
  };

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="bg-[#0f0f1a] min-h-screen text-white font-sans select-none overflow-hidden relative">
       {/* Screen Content */}
       {screen === 'home' && <HomePage 
          user={user} 
          rooms={rooms} 
          onJoinRoom={(room: RoomInfo) => { setCurrentRoom(room); setScreen('room'); }} 
          onCreateRoom={handleCreateRoom}
          activeTab={activeTab}
          onTabChange={setActiveTab}
       />}
       
       {screen === 'room' && currentRoom && <RoomPage 
          user={user} 
          room={currentRoom} 
          onExit={() => { setScreen('home'); setCurrentRoom(null); }} 
          gifts={gifts}
       />}
       
       {screen === 'shop' && <ShopPage user={user} items={shopItems} />}
       {screen === 'profile' && <ProfilePage user={user} />}

       {/* Bottom Navigation */}
       {screen !== 'room' && (
         <div className="fixed bottom-0 left-0 right-0 bg-[#16162a]/90 backdrop-blur-md border-t border-white/5 pb-6 pt-3 px-6 flex justify-between items-center z-50">
            <button onClick={() => setScreen('home')} className={`flex flex-col items-center gap-1 ${screen === 'home' ? 'text-white' : 'text-gray-500'}`}>
              <Icons.Home /> <span className="text-[10px]">الرئيسية</span>
            </button>
            <button onClick={() => setScreen('shop')} className={`flex flex-col items-center gap-1 ${screen === 'shop' ? 'text-white' : 'text-gray-500'}`}>
              <Icons.Shop /> <span className="text-[10px]">المتجر</span>
            </button>
            <div className="relative -top-5">
               <button onClick={() => setShowAdmin(true)} className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 border-4 border-[#0f0f1a]">
                  <Icons.Add />
               </button>
            </div>
            <button className={`flex flex-col items-center gap-1 text-gray-500`}>
              <Icons.Chat /> <span className="text-[10px]">الرسائل</span>
            </button>
            <button onClick={() => setScreen('profile')} className={`flex flex-col items-center gap-1 ${screen === 'profile' ? 'text-white' : 'text-gray-500'}`}>
              <Icons.User /> <span className="text-[10px]">ملفي</span>
            </button>
         </div>
       )}

       {/* Admin Panel */}
       <AdminPanel 
          isOpen={showAdmin} 
          onClose={() => setShowAdmin(false)}
          rooms={rooms}
          users={users.length > 0 ? users : [user]} 
          gifts={gifts}
          shopItems={shopItems}
          onCloseRoom={(id: string) => { /* Implement close room */ }}
          onBanUser={(id: string) => { /* Implement ban */ }}
          onAddGift={addGiftToDb}
          onDeleteGift={deleteGiftFromDb}
          onRechargeUser={async (displayId: string, amount: number) => {
              // Note: AdminPanel passes displayID, but handleTransaction needs Doc ID.
              // In a real app we would search. For now we use displayId to search.
              const uid = await findUserByDisplayId(displayId);
              if (uid) {
                  // handleTransaction subtracts amount, so pass negative to add
                  await handleTransaction(uid, -amount);
              } else {
                  alert('المستخدم غير موجود');
              }
          }}
          onAddShopItem={addShopItemToDb}
          onDeleteShopItem={deleteShopItemFromDb}
          onUpdateShopItem={() => {}}
          onUpdateUserVip={async (displayId: string, level: number) => {
              const uid = await findUserByDisplayId(displayId);
              if (uid) await updateUser(uid, { vipLevel: level });
          }}
          onUpdateBanner={() => {}}
       />
    </div>
  );
};

export default App;