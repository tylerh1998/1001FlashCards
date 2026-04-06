"use client"; // This must be the very first line

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

// Replace these with your actual Supabase details from your project settings
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function FlashcardApp() {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCards() {
      const { data, error } = await supabase.from('flashcards').select('*');
      if (data) setCards(data);
      setLoading(false);
    }
    fetchCards();
  }, []);

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % cards.length), 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length), 150);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-900 text-white">Loading NFPA 1001 Study Guide...</div>;
  
  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-red-500">NFPA 1001 Flashcards</h1>
      </div>
      
      {cards.length > 0 ? (
        <>
          <div className="w-full max-w-md bg-slate-800 h-2 rounded-full mb-8">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>

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
              {/* Front */}
              <div 
                className="absolute inset-0 bg-slate-800 border-2 border-slate-700 rounded-2xl p-8 flex items-center justify-center text-center text-xl font-medium shadow-xl"
                style={{ backfaceVisibility: "hidden" }}
              >
                {cards[currentIndex].question}
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 bg-red-700 border-2 border-red-500 rounded-2xl p-8 flex items-center justify-center text-center text-xl font-bold shadow-xl"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                {cards[currentIndex].answer}
              </div>
            </motion.div>
          </div>

          <div className="mt-12 flex items-center gap-8">
            <button onClick={prevCard} className="p-4 rounded-full bg-slate-800 hover:bg-slate-700 transition">
              <ChevronLeft size={32} />
            </button>
            <span className="text-slate-400 font-mono text-lg">
              {currentIndex + 1} / {cards.length}
            </span>
            <button onClick={nextCard} className="p-4 rounded-full bg-slate-800 hover:bg-slate-700 transition">
              <ChevronRight size={32} />
            </button>
          </div>
        </>
      ) : (
        <div className="text-center">
          <p>No cards found. Make sure you uploaded your CSV to Supabase!</p>
        </div>
      )}

      <button 
        onClick={() => {setCurrentIndex(0); setIsFlipped(false);}}
        className="mt-8 flex items-center gap-2 text-slate-500 hover:text-white transition"
      >
        <RotateCcw size={16} /> Reset Deck
      </button>
    </main>
  );
}