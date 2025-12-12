
import React, { useState, useEffect, useRef } from 'react';
import { User, Seat, ChatMessage, Gift, SeatStatus, FrameType, RoomInfo, AppScreen, InventoryItem, ShopItem, AnimationFormat } from './types';
import { CURRENT_USER, INITIAL_SEATS, MOCK_GIFTS, SAMPLE_MESSAGES, CATEGORIES, MOCK_ROOMS, SHOP_ITEMS, SERVICE_AGENTS } from './constants';
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

// --- Helper Components ---

const SVGAFrame = ({ url }: { url: string }) => {
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let mounted = true;
    if (window.SVGA && divRef.current) {
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

    if (animationType === 'svga' && window.SVGA && svgaRef.current) {
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
    } else if ((animationType === 'vap' || animationType === 'mp4') && videoRef.current) {
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

// --- Screen Components ---

const AuthPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
      if(!email || !password) {
          setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
          return;
      }
      setIsLoading(true);
      setError('');
      try {
          const user = await loginUser(email, password);
          if (user) {
              onLogin(user);
          } else {
              // Auto-register for demo purposes
              const newUser = await registerUser(email, password);
              onLogin(newUser);
          }
      } catch (err) {
          setError('حدث خطأ في الاتصال');
          console.error(err);
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] bg-[#0B0B1E] text-white space-y-8 p-6">
      <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-6xl shadow-[0_0_30px_rgba(59,130,246,0.5)]">🚀</div>
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">VoiceGalaxy</h1>
      
      <div className="w-full max-w-sm space-y-4">
          <input 
            type="email" 
            placeholder="البريد الإلكتروني" 
            className="w-full bg-[#16162a] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-purple-500 transition-colors"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="كلمة المرور" 
            className="w-full bg-[#16162a] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-purple-500 transition-colors"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && <div className="text-red-400 text-xs text-center">{error}</div>}
          
          <button onClick={handleLogin} disabled={isLoading} className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-lg disabled:opacity-50">
             {isLoading ? 'جاري التحميل...' : 'تسجيل الدخول / إنشاء حساب'}
          </button>
          
          <p className="text-xs text-gray-500 text-center">سيتم إنشاء حساب جديد تلقائياً وتعيين ID مميز لك إذا لم يكن لديك حساب.</p>
      </div>
    </div>
  );
};

const CreateRoomModal = ({ isOpen, onClose, onCreate }: { isOpen: boolean, onClose: () => void, onCreate: (name: string, cover: string) => void }) => {
   const [name, setName] = useState('');
   const [cover, setCover] = useState('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=300');
   if (!isOpen) return null;
   return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
         <div className="bg-[#16162a] w-full max-w-sm rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-4">إنشاء غرفة جديدة</h2>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white mb-4" placeholder="اسم الغرفة" />
            <input value={cover} onChange={e => setCover(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-xs mb-6" placeholder="رابط الصورة" />
            <div className="flex gap-3">
                  <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/10">إلغاء</button>
                  <button onClick={() => { if (name) { onCreate(name, cover); onClose(); setName(''); } }} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold">إنشاء</button>
            </div>
         </div>
      </div>
   );
};

const GiftModal = ({ isOpen, onClose, gifts, onSend, userCoins }: any) => {
   const [activeTab, setActiveTab] = useState('normal');
   const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
   if (!isOpen) return null;
   const filteredGifts = gifts.filter((g: Gift) => g.type === activeTab || (activeTab === 'svga' && g.animationType === 'svga'));

   return (
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
         <div className="absolute inset-0 bg-black/50 pointer-events-auto" onClick={onClose}></div>
         <div className="bg-[#121225]/95 backdrop-blur-xl w-full max-w-md rounded-t-3xl border-t border-white/10 pointer-events-auto flex flex-col max-h-[70vh] pb-[env(safe-area-inset-bottom)]">
            <div className="w-full px-4 pt-4 pb-2 border-b border-white/5">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-gray-400">اختر هدية 🎁</span>
                    <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                        <div className="scale-75"><Icons.Coin /></div>
                        <span className="text-yellow-400 font-bold text-sm">{userCoins.toLocaleString()}</span>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-2">
                   {['normal', 'lucky', 'luxury', 'svga'].map((t) => (
                      <button key={t} onClick={() => { setActiveTab(t); setSelectedGift(null); }} className={`w-full py-2 rounded-xl text-xs font-bold ${activeTab === t ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'}`}>{t}</button>
                   ))}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 gap-3 min-h-[250px]">
               {filteredGifts.map((gift: Gift) => (
                  <div key={gift.id} onClick={() => setSelectedGift(gift)} className={`flex flex-col items-center justify-center gap-1 cursor-pointer p-2 rounded-xl border ${selectedGift?.id === gift.id ? 'bg-purple-600/20 border-purple-500' : 'border-transparent hover:bg-white/5'}`}>
                     <div className="w-12 h-12 flex items-center justify-center text-3xl">{(gift.icon.startsWith('http') || gift.icon.startsWith('blob:')) ? <img src={gift.icon} className="w-full h-full object-contain" /> : gift.icon}</div>
                     <span className="text-[10px] text-gray-300">{gift.name}</span>
                     <div className="text-[9px] text-yellow-400">{gift.price}</div>
                  </div>
               ))}
            </div>
            <div className="p-4 border-t border-white/5 bg-black/20 flex gap-4">
               <button onClick={() => selectedGift && onSend(selectedGift, 1)} disabled={!selectedGift} className="flex-1 bg-purple-600 py-3 rounded-xl font-bold text-white disabled:opacity-50">إرسال</button>
            </div>
         </div>
      </div>
   );
};

const InventoryModal = ({ isOpen, onClose, user, onEquip }: any) => {
   const [activeTab, setActiveTab] = useState('all');
   if (!isOpen) return null;
   const filteredItems = user.inventory.filter((item: any) => activeTab === 'all' || item.type === activeTab);

   return (
      <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
         <div className="bg-[#1e1e2e] w-full max-w-md rounded-3xl border border-white/10 flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#161622]">
                <h2 className="text-lg font-bold text-white">🎒 حقيبتي</h2>
                <button onClick={onClose}><Icons.Close /></button>
            </div>
            
            {/* NEW: Wallet Display Section */}
            <div className="px-5 py-3 bg-[#0f0f15] border-b border-white/5 flex justify-between items-center">
                <span className="text-sm text-gray-400">رصيدك:</span>
                <div className="flex items-center gap-2 bg-yellow-500/10 px-4 py-1.5 rounded-xl border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                    <Icons.Coin />
                    <span className="text-yellow-400 font-bold text-lg">{user.coins.toLocaleString()}</span>
                </div>
            </div>

            <div className="flex p-2 gap-2 bg-[#12121a]">
                {['all', 'gift', 'frame', 'entry'].map((t) => (
                    <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-2 rounded-xl text-xs font-bold ${activeTab === t ? 'bg-purple-600' : 'bg-white/5'}`}>{t}</button>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-3 bg-[#161622]">
               {filteredItems.map((item: any) => (
                  <div key={item.id} className={`bg-[#252535] p-3 rounded-2xl flex flex-col items-center border ${item.isEquipped ? 'border-green-500' : 'border-white/5'}`}>
                     <div className="w-14 h-14 bg-black/30 rounded-xl flex items-center justify-center text-3xl mb-2">{(item.icon?.startsWith('http') || item.icon?.startsWith('blob:')) ? <img src={item.icon} className="w-full h-full object-contain" /> : (item.icon || '✨')}</div>
                     <h3 className="text-xs font-bold text-white truncate w-full text-center">{item.name}</h3>
                     {item.type !== 'gift' && <button onClick={() => onEquip(item)} disabled={item.isEquipped} className={`w-full py-1.5 rounded-lg text-[10px] mt-2 font-bold ${item.isEquipped ? 'bg-green-500/10 text-green-500' : 'bg-purple-600 text-white'}`}>{item.isEquipped ? 'تستخدمه' : 'تجهيز'}</button>}
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
};

const HomePage = ({ onRoomJoin, user, rooms, onCreateRoom, bannerUrl }: any) => {
  return (
    <div className="flex flex-col h-full bg-[#e6f5eb] text-gray-800 font-sans">
      {/* Top Header - Green Gradient - Adjusted for SAFE AREA TOP */}
      <div className="bg-gradient-to-b from-[#257d54] to-[#4ade80] rounded-b-3xl px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-6 shadow-lg relative overflow-hidden">
        {/* Background Pattern Effect (Optional) */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>

        {/* Top Nav Row */}
        <div className="flex justify-between items-center mb-6 relative z-10 text-white">
            <div className="flex gap-3">
                 <button className="text-white/90"><Icons.Menu /></button>
                 <button className="text-white/90"><Icons.Search /></button>
            </div>
            <div className="flex items-center gap-6 font-bold text-sm">
                <button className="opacity-80 hover:opacity-100">الدولة</button>
                <button className="opacity-80 hover:opacity-100">الأنشطة</button>
                <button className="text-yellow-300 border-b-2 border-yellow-300 pb-1">حفلات</button>
                <button className="opacity-80 hover:opacity-100">أنا</button>
            </div>
            <div className="relative">
                <img src={user.avatar} className="w-9 h-9 rounded-full border-2 border-white/50" />
            </div>
        </div>

        {/* Banner Area - mb-0 since last child */}
        <div className="relative w-full h-28 rounded-2xl overflow-hidden shadow-lg border-2 border-yellow-400/30">
            <img src={bannerUrl} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Middle Action Bar */}
      <div className="flex justify-between items-center px-4 py-3">
          <button className="flex items-center gap-1 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold shadow-md">
              <span>🔥</span> شايع
          </button>
          <button onClick={onCreateRoom} className="flex items-center gap-1 bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
             <span>🎉</span> غرفة جديدة
          </button>
      </div>

      {/* Rooms Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-3">
         <div className="grid grid-cols-2 gap-3">
            {rooms.map((room: any, idx: number) => (
              <div key={room.id} onClick={() => onRoomJoin(room)} className="relative h-44 rounded-2xl overflow-hidden cursor-pointer shadow-md group">
                  <img src={room.cover} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  
                  {/* Custom Frame Overlay based on index/type */}
                  <div className={`absolute inset-0 border-[3px] rounded-2xl pointer-events-none ${idx === 0 ? 'border-blue-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.5)]' : idx === 1 ? 'border-yellow-500 shadow-[inset_0_0_20px_rgba(234,179,8,0.5)]' : 'border-transparent'}`}></div>
                  
                  {/* Top Right Rank Badge */}
                  {idx < 3 && (
                      <div className="absolute top-0 right-4 w-6 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-sm rounded-b-lg shadow-lg border border-yellow-200">
                          {idx + 1}
                      </div>
                  )}

                  {/* Room Details Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent pt-8">
                      <div className="flex justify-between items-end">
                          <div>
                              <div className="flex items-center gap-1 mb-1">
                                  <div className="bg-black/40 backdrop-blur-md px-1.5 rounded text-[10px] text-white flex items-center gap-1">
                                      <span className="w-1 h-3 bg-red-500 inline-block animate-pulse"></span> 17
                                  </div>
                                  <span className="text-[10px] text-white/80 font-mono">ID:{room.id}</span>
                              </div>
                              <h3 className="text-white font-bold text-sm drop-shadow-md">{room.name}</h3>
                          </div>
                          <div className="flex flex-col items-center">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${room.hostName}`} className="w-8 h-8 rounded-full border-2 border-white" />
                              <span className="text-[9px] text-white mt-0.5">{room.hostName}</span>
                          </div>
                      </div>
                  </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

const ShopPage = ({ user, onBuyItem, items }: any) => {
   const [activeTab, setActiveTab] = useState('frame');
   const filteredItems = items.filter((item: any) => item.type === activeTab);
   return (
      <div className="h-full bg-[#0B0B1E] flex flex-col pt-[env(safe-area-inset-top)]">
         <div className="p-4 bg-gradient-to-b from-purple-900/50 to-transparent">
            <h1 className="text-xl font-bold mb-4">المتجر 🛒</h1>
            <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/10">
               <div className="text-sm text-gray-300">رصيدك:</div>
               <div className="flex gap-4"><div className="flex items-center gap-1 text-yellow-400 font-bold"><Icons.Coin /> {user.coins}</div></div>
            </div>
         </div>
         <div className="flex px-4 border-b border-white/10">
             <button onClick={() => setActiveTab('frame')} className={`flex-1 pb-3 text-sm font-bold ${activeTab === 'frame' ? 'text-white border-b-2 border-purple-500' : 'text-gray-500'}`}>إطارات</button>
             <button onClick={() => setActiveTab('entry')} className={`flex-1 pb-3 text-sm font-bold ${activeTab === 'entry' ? 'text-white border-b-2 border-purple-500' : 'text-gray-500'}`}>دخوليات</button>
         </div>
         <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4 pb-24">
            {filteredItems.map((item: any) => (
               <div key={item.id} className="bg-[#16162a] rounded-xl p-3 border border-white/5 flex flex-col items-center">
                  <div className="w-24 h-24 bg-black/50 rounded-full flex items-center justify-center text-4xl mb-2 relative">
                     {(item.icon.startsWith('http') || item.icon.startsWith('blob:')) ? <img src={item.icon} className="w-full h-full object-contain opacity-90" /> : <span className="text-4xl">{item.icon}</span>}
                  </div>
                  <h3 className="font-bold text-sm">{item.name}</h3>
                  <button onClick={() => onBuyItem(item)} className="w-full mt-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-xs font-bold py-2 rounded-lg">{item.price} 💰 شراء</button>
               </div>
            ))}
         </div>
      </div>
   );
};

const ProfilePage = ({ user, onUpdateUser, onOpenAdmin, onOpenInventory }: any) => {
   return (
      <div className="h-full overflow-y-auto pb-20 bg-[#0B0B1E]">
         <div className="relative h-40 bg-gradient-to-b from-purple-800 to-[#0B0B1E]">
            {/* SETTINGS BUTTON ONLY HERE - ADJUSTED FOR TOP NOTCH */}
            <button onClick={onOpenAdmin} className="absolute top-[calc(1rem+env(safe-area-inset-top))] right-4 bg-black/40 p-2 rounded-full text-white/50 hover:text-white z-20"><Icons.Settings /></button>
         </div>
         <div className="px-4 -mt-12 flex flex-col items-center">
            <UserFrame type={user.frame} size="xl" customFrameUrl={user.frameUrl} isSvga={user.frameIsSvga}>
                  <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-[#0B0B1E]" />
            </UserFrame>
            <h2 className="text-xl font-bold mt-2">{user.name}</h2>
            <div className="text-sm font-mono text-purple-300 bg-purple-900/30 px-3 py-1 rounded-full mb-1 border border-purple-500/30">ID: {user.displayId}</div>
            <div className="flex items-center gap-2 mt-1">
               <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded">Lv.{user.level}</span>
               {/* UPDATED VIP BADGE COMPONENT */}
               <VipBadge level={user.vipLevel} />
            </div>
            <div className="grid grid-cols-3 gap-4 w-full mt-6">
               <div className="bg-[#16162a] p-3 rounded-xl border border-white/5 text-center"><div className="text-lg font-bold">{user.following}</div><div className="text-[10px] text-gray-500">متابِع</div></div>
               <div className="bg-[#16162a] p-3 rounded-xl border border-white/5 text-center"><div className="text-lg font-bold">{user.followers}</div><div className="text-[10px] text-gray-500">متابَع</div></div>
               <div className="bg-[#16162a] p-3 rounded-xl border border-white/5 text-center"><div className="text-lg font-bold">{user.visitors}</div><div className="text-[10px] text-gray-500">زائر</div></div>
            </div>
            
            {/* Wallet Section Added Here */}
            <div className="w-full mt-4">
               <div className="bg-gradient-to-r from-indigo-900/80 to-purple-900/80 rounded-2xl p-4 border border-white/10 flex justify-between items-center shadow-lg backdrop-blur-sm relative overflow-hidden group">
                   <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                   <div>
                       <div className="text-gray-400 text-xs mb-1 flex items-center gap-1"><Icons.Coin /> محفظتي</div>
                       <div className="text-2xl font-bold text-yellow-400 flex items-center gap-2 drop-shadow-md">
                          {user.coins.toLocaleString()} <span className="text-sm font-normal text-yellow-200">كوينز</span>
                       </div>
                   </div>
                   <button onClick={() => alert('تواصل مع الوكيل للشحن')} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-5 py-2 rounded-xl text-xs hover:scale-105 transition-transform shadow-lg">شحن</button>
               </div>
            </div>

            <div className="w-full mt-4 space-y-3">
               <button onClick={onOpenInventory} className="w-full bg-[#16162a] p-4 rounded-xl flex items-center justify-between border border-white/5"><div className="flex items-center gap-3"><span>🎒</span><span className="font-bold text-sm">الحقيبة</span></div><Icons.ChevronLeft /></button>
               <button className="w-full bg-[#16162a] p-4 rounded-xl flex items-center justify-between border border-white/5"><div className="flex items-center gap-3"><span>🛡️</span><span className="font-bold text-sm">مركز العائلة</span></div><Icons.ChevronLeft /></button>
            </div>
         </div>
      </div>
   );
};

const RoomPage = ({ room, seats, messages, currentUser, onLeave, onToggleMic, onSendMessage, onOpenGifts, onOpenInventory, onSeatClick }: any) => {
  const [inputText, setInputText] = useState('');
  return (
    <div className="flex flex-col h-full bg-[#050510] relative overflow-hidden">
       {/* Professional Dark Background */}
       <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] to-[#050510] z-0 pointer-events-none"></div>
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent z-0 pointer-events-none"></div>
       
       {/* Top Bar - Transparent - ADJUSTED FOR TOP NOTCH */}
       <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-[calc(2rem+env(safe-area-inset-top))] flex justify-between items-start pointer-events-none">
          <div className="flex gap-2 pointer-events-auto bg-black/40 backdrop-blur-md p-1 pr-3 rounded-full border border-white/5 items-center">
             <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10"><img src={room.cover} className="w-full h-full object-cover" /></div>
             <div>
                <h2 className="text-white font-bold text-xs">{room.name}</h2>
                <div className="text-[8px] text-gray-300">ID: {room.id}</div>
             </div>
             <button className="bg-purple-600 text-white text-[9px] px-2 py-0.5 rounded-full mr-1">متابعة</button>
          </div>
          <div className="flex gap-2 pointer-events-auto">
             <div className="bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/5 flex items-center gap-1 text-xs">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> {room.userCount}
             </div>
             <button onClick={onLeave} className="bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/5 hover:bg-red-500/20 transition-colors"><Icons.Exit /></button>
          </div>
       </div>
       
       {/* Main Stage Area */}
       <div className="flex-1 mt-20 px-2 overflow-y-auto no-scrollbar relative z-10 flex flex-col items-center">
          
          {/* Seats Grid - 10 Seats (5x2) */}
          <div className="w-full grid grid-cols-5 gap-y-6 gap-x-2 mt-4 max-w-sm">
             {seats.map((seat: any) => (
                <SeatComponent key={seat.id} seat={seat} isHost={false} isMe={seat.user?.id === currentUser.id} onClick={() => onSeatClick(seat.id)} />
             ))}
          </div>

          {/* Chat Area - Floating Bottom Left - ADJUSTED FOR BOTTOM SAFE AREA */}
          <div className="w-full flex-1 flex flex-col justify-end pb-[calc(1rem+env(safe-area-inset-bottom))] px-2 mt-4 min-h-[200px] relative">
              <div className="absolute bottom-[calc(5rem+env(safe-area-inset-bottom))] left-0 w-[80%] max-h-[200px] overflow-y-auto no-scrollbar space-y-2 mask-gradient-top">
                {messages.map((msg: any) => (
                    <div key={msg.id} className={`flex flex-col items-start animate-in slide-in-from-left-2 duration-300`}>
                    {msg.isSystem ? (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-[10px] px-3 py-1 rounded-r-full rounded-tl-full self-start mb-1 backdrop-blur-sm">{msg.content}</div>
                    ) : msg.isGift ? (
                        <div className="bg-gradient-to-r from-purple-900/60 to-pink-900/60 p-2 rounded-r-xl rounded-tl-xl text-xs text-white flex items-center gap-2 border border-pink-500/20 backdrop-blur-sm">
                            <span className="font-bold text-pink-300 text-[11px]">{msg.userName}:</span>
                            <span className="text-[10px]">أرسل {msg.giftData?.giftName}</span>
                            <span className="text-lg">{msg.giftData?.icon}</span>
                            <span className="text-yellow-400 font-bold">x{msg.giftData?.count}</span>
                        </div>
                    ) : (
                        <div className="flex gap-2 max-w-full group">
                            <div className="p-2 rounded-r-2xl rounded-tl-2xl text-xs text-white bg-black/40 backdrop-blur-md border border-white/5 group-hover:bg-black/60 transition-colors">
                                <div className="font-bold text-[10px] text-purple-300 mb-0.5">{msg.userName}</div>
                                {msg.content}
                            </div>
                        </div>
                    )}
                    </div>
                ))}
             </div>
          </div>
       </div>

       {/* Floating Bottom Control Bar - ADJUSTED FOR BOTTOM SAFE AREA */}
       <div className="absolute bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-4 right-4 h-14 bg-[#1e1e2e]/90 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-2 px-2 shadow-2xl z-30">
          <button onClick={onOpenInventory} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"><Icons.Bag /></button>
          
          <div className="flex-1 h-10 bg-black/30 rounded-full flex items-center px-4 border border-white/5 mx-1">
             <input value={inputText} onChange={e => setInputText(e.target.value)} placeholder="تحدث..." className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500" />
             <button onClick={() => { if(inputText) { onSendMessage(inputText); setInputText(''); } }} className="text-purple-400 font-bold hover:text-purple-300"><Icons.Chat /></button>
          </div>
          
          <button onClick={onOpenGifts} className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"><Icons.Gift /></button>
          <button onClick={onToggleMic} className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${seats.find((s:any) => s.user?.id === currentUser.id)?.isMuted ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-green-500 text-green-500 bg-green-500/10'}`}><Icons.Mic /></button>
       </div>
    </div>
  );
};

const AdminPanel = ({ isOpen, onClose, rooms, users, gifts, shopItems, onCloseRoom, onBanUser, onAddGift, onDeleteGift, onRechargeUser, onAddShopItem, onDeleteShopItem, onUpdateShopItem, onUpdateUserVip, onUpdateBanner, currentBanner }: any) => {
   const [activeTab, setActiveTab] = useState('dashboard');
   // Gifts State
   const [newGiftName, setNewGiftName] = useState('');
   const [newGiftPrice, setNewGiftPrice] = useState(100);
   const [giftType, setGiftType] = useState<Gift['type']>('normal');
   const [animFormat, setAnimFormat] = useState<AnimationFormat>('svga');
   const [animationFile, setAnimationFile] = useState<File | null>(null);
   const [iconFile, setIconFile] = useState<File | null>(null);
   const [soundFile, setSoundFile] = useState<File | null>(null);
   // Shop Item State
   const [shopItemName, setShopItemName] = useState('');
   const [shopItemPrice, setShopItemPrice] = useState(500);
   const [shopItemType, setShopItemType] = useState<'frame' | 'entry'>('frame');
   const [shopItemFile, setShopItemFile] = useState<File | null>(null);
   const [shopItemIcon, setShopItemIcon] = useState<File | null>(null);
   // Recharge
   const [rechargeAmount, setRechargeAmount] = useState(1000);
   const [targetUserId, setTargetUserId] = useState('');

   if (!isOpen) return null;

   const handleAddGift = async () => {
      const fileUrl = animationFile ? URL.createObjectURL(animationFile) : undefined;
      const iconUrl = iconFile ? URL.createObjectURL(iconFile) : '🎁';
      const soundUrl = soundFile ? URL.createObjectURL(soundFile) : undefined;
      
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
      setNewGiftName(''); setAnimationFile(null); setIconFile(null); setSoundFile(null); alert('تمت إضافة الهدية بنجاح! 🎁');
   };

   const handleSaveShopItem = async () => {
       const iconUrl = shopItemIcon ? URL.createObjectURL(shopItemIcon) : '✨';
       const fileUrl = shopItemFile ? URL.createObjectURL(shopItemFile) : undefined;
       const newItem = { 
           id: Date.now().toString(), 
           itemId: `${shopItemType}_${Date.now()}`, 
           name: shopItemName, 
           type: shopItemType, 
           price: shopItemPrice, 
           currency: 'coins' as const, 
           icon: iconUrl, 
           fileUrl: fileUrl, 
           isSvga: shopItemFile?.name.endsWith('.svga') 
       };
       
       await onAddShopItem(newItem);
       setShopItemName(''); setShopItemFile(null); setShopItemIcon(null); alert('تمت إضافة الغرض للمتجر! 🛒');
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

                          <div className="bg-[#252535] p-6 rounded-2xl border border-white/5">
                              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Icons.Edit /> إعدادات التطبيق (البنر الرئيسي)</h3>
                              <div className="mb-4">
                                  <p className="text-xs text-gray-400 mb-2">البنر الحالي للصفحة الرئيسية:</p>
                                  <img src={currentBanner} className="w-full h-32 object-cover rounded-xl border border-white/10 mb-3" />
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const url = URL.createObjectURL(file);
                                            onUpdateBanner(url);
                                        }
                                    }}
                                    className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-purple-600 file:text-white hover:file:bg-purple-700" 
                                  />
                                  <p className="text-[10px] text-gray-500 mt-2">اختر صورة جديدة لتحديث البنر في الصفحة الرئيسية فوراً.</p>
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
                              <p className="text-xs text-gray-400 mb-4">المستخدم الحالي: {users[0].name}</p>
                              <div className="flex items-center gap-4">
                                  {/* Cumulative VIP Slider 0-99 */}
                                  <input type="range" min="0" max="99" value={users[0].vipLevel} onChange={e => onUpdateUserVip(users[0].displayId, parseInt(e.target.value))} className="flex-1 accent-purple-500" />
                                  
                                  {/* Direct Input for precise number */}
                                  <input 
                                    type="number" 
                                    min="0" 
                                    max="99" 
                                    value={users[0].vipLevel} 
                                    onChange={e => onUpdateUserVip(users[0].displayId, parseInt(e.target.value))} 
                                    className="w-16 bg-black/40 border border-white/10 rounded-lg text-center text-white font-bold"
                                  />
                                  
                                  {/* Visual Badge Preview */}
                                  <VipBadge level={users[0].vipLevel} />
                              </div>
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
                                      <input type="file" onChange={e => setAnimationFile(e.target.files?.[0] || null)} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-purple-600 file:text-white hover:file:bg-purple-700" />
                                  </div>
                                  <div>
                                      <label className="text-xs text-gray-400 mb-2 block">أيقونة الهدية (صورة):</label>
                                      <input type="file" onChange={e => setIconFile(e.target.files?.[0] || null)} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-purple-600 file:text-white hover:file:bg-purple-700" />
                                  </div>
                              </div>
                              <div className="mb-6">
                                    <label className="text-xs text-gray-400 mb-2 block">ملف الصوت (اختياري):</label>
                                    <input type="file" accept="audio/*" onChange={e => setSoundFile(e.target.files?.[0] || null)} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-purple-600 file:text-white hover:file:bg-purple-700" />
                              </div>
                              <button onClick={handleAddGift} className="w-full bg-green-600 py-3 rounded-xl font-bold text-white hover:bg-green-500 transition-colors">إضافة الهدية للقائمة 🎁</button>
                          </div>
                          
                          <div>
                             <h4 className="font-bold mb-3">الهدايا الحالية</h4>
                             <div className="grid grid-cols-4 gap-3">
                                 {gifts.map((g: any) => (
                                     <div key={g.id} className="bg-black/20 p-2 rounded-lg text-center relative group">
                                         <div className="text-2xl mb-1">{(g.icon.startsWith('http') || g.icon.startsWith('blob:')) ? <img src={g.icon} className="w-8 h-8 mx-auto object-contain"/> : g.icon}</div>
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
                                      <input type="file" onChange={e => setShopItemFile(e.target.files?.[0] || null)} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
                                  </div>
                                  <div>
                                      <label className="text-xs text-gray-400 mb-2 block">أيقونة المتجر:</label>
                                      <input type="file" onChange={e => setShopItemIcon(e.target.files?.[0] || null)} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
                                  </div>
                              </div>
                              <button onClick={handleSaveShopItem} className="w-full bg-blue-600 py-3 rounded-xl font-bold text-white hover:bg-blue-500 transition-colors">إضافة للمتجر 🛒</button>
                          </div>
                          
                          <div>
                             <h4 className="font-bold mb-3">عناصر المتجر</h4>
                             <div className="grid grid-cols-2 gap-3">
                                 {shopItems.map((item: any) => (
                                     <div key={item.id} className="bg-black/20 p-3 rounded-lg flex items-center justify-between border border-white/5">
                                         <div className="flex items-center gap-2">
                                             <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-lg">{(item.icon.startsWith('http') || item.icon.startsWith('blob:')) ? <img src={item.icon} className="w-full h-full object-contain"/> : item.icon}</div>
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

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [screen, setScreen] = useState<AppScreen>('home'); 
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [activeRoom, setActiveRoom] = useState<RoomInfo | null>(null);
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [seats, setSeats] = useState<Seat[]>(INITIAL_SEATS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Use Mocks initially, but will be overwritten by Firestore
  const [gifts, setGifts] = useState<Gift[]>([]); 
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [currentGiftAnim, setCurrentGiftAnim] = useState<{url: string, type: AnimationFormat, soundUrl?: string} | null>(null);
  
  // App Settings State
  const [homeBanner, setHomeBanner] = useState('https://img.freepik.com/premium-photo/golden-lion-logo-design_985290-7634.jpg');

  // Subscribe to Room List, Gifts, and Shop Items on Mount
  useEffect(() => {
    if (isAuthenticated) {
      const unsubRooms = subscribeToRooms((updatedRooms) => setRooms(updatedRooms));
      const unsubGifts = subscribeToGifts((updatedGifts) => {
         // Fallback to mocks if empty for demo purposes (optional)
         if(updatedGifts.length === 0) setGifts(MOCK_GIFTS);
         else setGifts(updatedGifts);
      });
      const unsubShop = subscribeToShopItems((updatedItems) => {
          if(updatedItems.length === 0) setShopItems(SHOP_ITEMS);
          else setShopItems(updatedItems);
      });

      return () => {
          unsubRooms();
          unsubGifts();
          unsubShop();
      };
    }
  }, [isAuthenticated]);

  // Subscribe to Active Room Data (Seats, Messages)
  useEffect(() => {
    if (activeRoom && isAuthenticated) {
      const unsubRoom = subscribeToRoomData(activeRoom.id, (data) => {
        if (data && data.seats) {
          setSeats(data.seats);
        }
      });

      const unsubMsgs = subscribeToMessages(activeRoom.id, (msgs) => {
        setMessages(msgs);
        
        // Check for new gift messages to animate
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg && lastMsg.isGift && lastMsg.timestamp > Date.now() - 2000) {
            // Find gift details to animate
            const gift = gifts.find(g => g.name === lastMsg.giftData?.giftName);
            if (gift && (gift.fileUrl || gift.previewUrl)) {
                setCurrentGiftAnim({
                    url: gift.fileUrl || gift.previewUrl!,
                    type: gift.animationType || (gift.isSvga ? 'svga' : 'webp'),
                    soundUrl: gift.soundUrl
                });
            }
        }
      });

      return () => {
        unsubRoom();
        unsubMsgs();
      };
    }
  }, [activeRoom, isAuthenticated, gifts]); // Added gifts dependency

  // Subscribe to Current User Updates (Wallet, Inventory)
  useEffect(() => {
    if (isAuthenticated && currentUser.id) {
        const unsubUser = subscribeToUser(currentUser.id, (userData) => {
            setCurrentUser(userData);
        });
        return () => unsubUser();
    }
  }, [isAuthenticated, currentUser.id]);

  const handleLogin = (user: User) => {
      setCurrentUser(user);
      setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
      return <AuthPage onLogin={handleLogin} />;
  }

  const handleCreateRoom = (name: string, cover: string) => {
    createRoom(name, cover, currentUser);
  };

  const handleJoinRoom = (room: RoomInfo) => {
    setActiveRoom(room);
    setScreen('room');
  };

  const handleSeatClick = async (seatId: number) => {
     if (!activeRoom) return;

     const targetSeat = seats.find(s => s.id === seatId);
     const mySeat = seats.find(s => s.user?.id === currentUser.id);

     if (targetSeat?.status === SeatStatus.Locked) return;
     if (targetSeat?.status === SeatStatus.Occupied && targetSeat?.user?.id !== currentUser.id) return;

     const newSeats = [...seats];

     if (targetSeat?.status === SeatStatus.Empty) {
         if (mySeat) {
             newSeats[mySeat.id] = { ...mySeat, status: SeatStatus.Empty, user: undefined, isMuted: false, isTalking: false };
         }
         newSeats[seatId] = { ...targetSeat, status: SeatStatus.Occupied, user: currentUser, isMuted: false, isTalking: false };
         await updateRoomSeats(activeRoom.id, newSeats);
     }
     else if (targetSeat?.user?.id === currentUser.id) {
         newSeats[seatId] = { ...targetSeat, status: SeatStatus.Empty, user: undefined, isMuted: false, isTalking: false };
         await updateRoomSeats(activeRoom.id, newSeats);
     }
  };

  const handleSendMessage = async (text: string) => {
    if (!activeRoom) return;
    await sendChatMessage(activeRoom.id, {
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        content: text,
        vipLevel: currentUser.vipLevel,
        userFrame: currentUser.frame
    });
  };

  const handleSendGift = async (gift: Gift, count: number) => {
     if (!activeRoom) return;
     if (currentUser.coins < gift.price * count) return alert('لا يوجد رصيد كافي');
     
     await handleTransaction(currentUser.id, gift.price * count);

     await sendChatMessage(activeRoom.id, {
         userId: currentUser.id,
         userName: currentUser.name,
         userAvatar: currentUser.avatar,
         content: '',
         isGift: true,
         giftData: { giftName: gift.name, count, icon: gift.icon },
         vipLevel: currentUser.vipLevel,
         userFrame: currentUser.frame
     });

     setShowGiftModal(false);
  };

  const handleBuyItem = async (item: ShopItem) => {
      if (currentUser.coins < item.price) return alert('No coins');
      
      const updatedInventory = [...currentUser.inventory, { 
          id: Date.now().toString(), 
          itemId: item.itemId, 
          name: item.name, 
          icon: item.icon, 
          type: item.type, 
          count: 1, 
          isEquipped: false, 
          frameUrl: item.fileUrl || null, 
          isSvga: item.isSvga || false 
      }];

      await updateUser(currentUser.id, {
          coins: currentUser.coins - item.price,
          inventory: updatedInventory
      });
      alert('تم الشراء');
  };

  const handleEquipItem = async (item: InventoryItem) => {
      const newInv = currentUser.inventory.map(i => i.type === item.type ? { ...i, isEquipped: false } : i);
      const target = newInv.find(i => i.id === item.id);
      if (target) target.isEquipped = true;
      
      let newFrame: FrameType = currentUser.frame || 'none';
      if (item.type === 'frame') {
          newFrame = 'none';
          if (item.itemId.includes('neon')) newFrame = 'neon';
          else if (item.itemId.includes('gold')) newFrame = 'gold';
          else if (item.itemId.includes('fire')) newFrame = 'fire';
          else if (item.itemId.includes('wings')) newFrame = 'wings';
          else if (item.itemId.includes('ice')) newFrame = 'ice';
      }

      await updateUser(currentUser.id, {
          inventory: newInv,
          frame: newFrame,
          frameUrl: item.frameUrl || null, 
          frameIsSvga: item.isSvga || false 
      });
      setCurrentUser({ ...currentUser, inventory: newInv, frame: newFrame, frameUrl: item.frameUrl, frameIsSvga: item.isSvga });
  };

  // --- Admin Handlers (Now Integrated with Firebase) ---
  const handleRechargeUser = async (displayId: string, amount: number) => {
      try {
        const userId = await findUserByDisplayId(displayId);
        if (userId) {
            await handleTransaction(userId, -amount); // Negative amount adds coins because handleTransaction subtracts
        } else {
            alert('المستخدم غير موجود (تحقق من الـ ID)');
        }
      } catch (e) {
          console.error(e);
          alert('حدث خطأ أثناء الشحن');
      }
  };

  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto bg-[#0B0B1E] text-white relative shadow-2xl overflow-hidden flex flex-col font-sans">
        {currentGiftAnim && <UniversalGiftPlayer url={currentGiftAnim.url} animationType={currentGiftAnim.type} soundUrl={currentGiftAnim.soundUrl} onFinish={() => setCurrentGiftAnim(null)} />}
        <div className="flex-1 overflow-hidden relative">
            {screen === 'home' && <HomePage user={currentUser} rooms={rooms} onRoomJoin={handleJoinRoom} onCreateRoom={() => setShowCreateRoom(true)} bannerUrl={homeBanner} />}
            {screen === 'room' && activeRoom && <RoomPage room={activeRoom} seats={seats} messages={messages} currentUser={currentUser} onLeave={() => setScreen('home')} onToggleMic={() => {}} onSendMessage={handleSendMessage} onOpenGifts={() => setShowGiftModal(true)} onOpenInventory={() => setShowInventory(true)} onSeatClick={handleSeatClick} />}
            {screen === 'shop' && <ShopPage user={currentUser} items={shopItems} onBuyItem={handleBuyItem} />}
            {screen === 'profile' && <ProfilePage user={currentUser} onUpdateUser={setCurrentUser} onOpenAdmin={() => setShowAdmin(true)} onOpenInventory={() => setShowInventory(true)} />}
        </div>
        {screen !== 'room' && (
           <div className="h-[calc(5rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-gradient-to-t from-[#257d54] to-[#4ade80] rounded-t-3xl flex justify-around items-center px-4 z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.2)]">
               <button onClick={() => setScreen('profile')} className={`flex flex-col items-center gap-1 ${screen === 'profile' ? 'text-yellow-200' : 'text-white/80'}`}>
                   <Icons.Moon />
                   <span className="text-[10px] font-bold">أنا</span>
               </button>
               
               <button onClick={() => setScreen('shop')} className={`flex flex-col items-center gap-1 ${screen === 'shop' ? 'text-yellow-200' : 'text-white/80'}`}>
                   <Icons.Shop />
                   <span className="text-[10px] font-bold">المتجر</span>
               </button>
               
               <button onClick={() => setShowCreateRoom(true)} className="flex flex-col items-center gap-1 text-white/80">
                   <Icons.Lamp />
                   <span className="text-[10px] font-bold">اكتشف</span>
               </button>
               
               <button onClick={() => setScreen('home')} className={`flex flex-col items-center gap-1 ${screen === 'home' ? 'text-yellow-200' : 'text-white/80'}`}>
                   <Icons.Mosque />
                   <span className="text-[10px] font-bold">حفلات</span>
               </button>
           </div>
        )}
        <CreateRoomModal isOpen={showCreateRoom} onClose={() => setShowCreateRoom(false)} onCreate={handleCreateRoom} />
        <GiftModal isOpen={showGiftModal} onClose={() => setShowGiftModal(false)} gifts={gifts} onSend={handleSendGift} userCoins={currentUser.coins} />
        <InventoryModal isOpen={showInventory} onClose={() => setShowInventory(false)} user={currentUser} onEquip={handleEquipItem} />
        
        {/* Updated Admin Panel passing async handlers */}
        <AdminPanel 
            isOpen={showAdmin} 
            onClose={() => setShowAdmin(false)} 
            rooms={rooms} 
            users={[currentUser]} 
            gifts={gifts} 
            shopItems={shopItems} 
            onCloseRoom={(id: string) => setRooms(rooms.filter(r => r.id !== id))} 
            onBanUser={() => alert('User Banned')} 
            onAddGift={addGiftToDb} 
            onDeleteGift={deleteGiftFromDb} 
            onRechargeUser={handleRechargeUser} 
            onAddShopItem={addShopItemToDb} 
            onDeleteShopItem={deleteShopItemFromDb} 
            onUpdateShopItem={(item: ShopItem) => setShopItems(shopItems.map(i => i.id === item.id ? item : i))} 
            onUpdateUserVip={(id: string, vip: number) => updateUser(currentUser.id, { vipLevel: vip })} 
            onUpdateBanner={setHomeBanner} 
            currentBanner={homeBanner} 
        />
    </div>
  );
};

export default App;
