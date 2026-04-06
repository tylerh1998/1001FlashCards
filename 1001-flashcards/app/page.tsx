"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle } from 'lucide-react';

// Initialize Supabase safely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Define the structure of a Flashcard for TypeScript
interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

export default function FlashcardApp() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to shuffle an array (Fisher-Yates Algorithm)
  const shuffleArray = (array: Flashcard[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    async function fetchCards() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase.from('flashcards').select('*');
      
      if (data) {
        // Randomize the cards immediately after fetching
        setCards(shuffleArray(data));
      }
      setLoading(false);
    }
    fetchCards();
  }, []);

  const handleShuffle = () => {
    setIsFlipped(false);
    // Brief timeout to allow the flip animation to reset before changing the card
    setTimeout(() => {
      setCards(shuffleArray(cards));
      setCurrentIndex(0);
    }, 150);
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % (cards.length || 1)), 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + (cards.length || 1)) % (cards.length || 1)), 150);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-900 text-white font-sans">Loading NFPA 1001 Study Guide...</div>;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return <div className="flex h-screen items-center justify-center bg-slate-900 text-white p-4 text-center">Missing Supabase Keys in Vercel Settings!</div>;
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-red-500 uppercase tracking-tighter">NFPA 1001 Level I Flashcards</h1>
      </div>
      
      {cards.length > 0 ? (
        <>
          {/* Progress Bar */}
          <div className="w-full max-w-md bg-slate-800 h-2 rounded-full mb-8 overflow-hidden">
            <motion.div 
              className="bg-red-500 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>

          {/* Flashcard Card */}
          <div 
            className="relative w-full max-w-md aspect-[4/3] cursor-pointer"
            style={{ perspective: "1000px" }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div
              className="w-full h-full relative"
              initial={false}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front Side */}
              <div 
                className="absolute inset-0 bg-slate-800 border-2 border-slate-700 rounded-2xl p-8 flex items-center justify-center text-center text-xl shadow-2xl"
                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
              >
                {cards[currentIndex].question}
              </div>

              {/* Back Side */}
              <div 
                className="absolute inset-0 bg-red-700 border-2 border-red-500 rounded-2xl p-8 flex items-center justify-center text-center text-xl font-bold shadow-2xl"
                style={{ 
                  backfaceVisibility: "hidden", 
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)" 
                }}
              >
                {cards[currentIndex].answer}
              </div>
            </motion.div>
          </div>

          {/* Navigation Controls */}
          <div className="mt-12 flex items-center gap-8">
            <button onClick={prevCard} className="p-4 rounded-full bg-slate-800 hover:bg-slate-700 transition active:scale-90 shadow-lg">
              <ChevronLeft size={32} />
            </button>
            <span className="text-slate-400 font-mono text-xl font-bold">
              {currentIndex + 1} / {cards.length}
            </span>
            <button onClick={nextCard} className="p-4 rounded-full bg-slate-800 hover:bg-slate-700 transition active:scale-90 shadow-lg">
              <ChevronRight size={32} />
            </button>
          </div>
        </>
      ) : (
        <div className="text-center text-slate-500">No cards found in your Supabase table.</div>
      )}

      {/* Action Buttons */}
      <div className="mt-10 flex gap-6">
        <button 
          onClick={handleShuffle}
          className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition font-semibold uppercase text-sm tracking-widest"
        >
          <Shuffle size={18} /> Shuffle Deck
        </button>
        
        <button 
          onClick={() => {setCurrentIndex(0); setIsFlipped(false);}}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition font-semibold uppercase text-sm tracking-widest"
        >
          <RotateCcw size={18} /> Reset
        </button>
      </div>
    </main>
  );
}
