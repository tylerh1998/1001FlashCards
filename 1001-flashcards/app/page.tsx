"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, CheckCircle2, XCircle } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

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

  // Session Score State
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

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
      const { data } = await supabase.from('flashcards').select('*');
      if (data) setCards(shuffleArray(data));
      setLoading(false);
    }
    fetchCards();
  }, []);

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % (cards.length || 1)), 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + (cards.length || 1)) % (cards.length || 1)), 150);
  };

  const handleScore = (type: 'correct' | 'wrong') => {
    setScore(prev => ({ ...prev, [type]: prev[type] + 1 }));
    nextCard(); // Automatically move to the next card after scoring
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setScore({ correct: 0, wrong: 0 });
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-900 text-white">Loading NFPA 1001 Study Guide...</div>;
  if (!supabaseUrl || !supabaseAnonKey) return <div className="flex h-screen items-center justify-center bg-slate-900 text-white p-4 text-center">Missing Supabase Keys in Vercel Settings!</div>;

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold text-red-500 uppercase tracking-tighter">NFPA 1001 Flashcards</h1>
        <p className="text-slate-400 mt-1 font-medium">Progress: {currentIndex + 1} / {cards.length}</p>
      </div>
      
      {cards.length > 0 ? (
        <>
          <div className="w-full max-w-md bg-slate-800 h-2 rounded-full mb-8 overflow-hidden">
            <motion.div 
              className="bg-red-500 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
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
              <div className="absolute inset-0 bg-slate-800 border-2 border-slate-700 rounded-2xl p-8 flex items-center justify-center text-center text-xl shadow-2xl" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
                {cards[currentIndex].question}
              </div>

              <div className="absolute inset-0 bg-red-700 border-2 border-red-500 rounded-2xl p-8 flex items-center justify-center text-center text-xl font-bold shadow-2xl" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                {cards[currentIndex].answer}
              </div>
            </motion.div>
          </div>

          {/* Scoring Buttons */}
          <div className="mt-8 flex gap-4 w-full max-w-md">
            <button 
              onClick={(e) => { e.stopPropagation(); handleScore('wrong'); }}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 border-2 border-red-900/50 hover:bg-red-900/20 py-4 rounded-xl transition-all active:scale-95"
            >
              <XCircle className="text-red-500" />
              <span className="font-bold text-red-500">WRONG ({score.wrong})</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleScore('correct'); }}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 border-2 border-green-900/50 hover:bg-green-900/20 py-4 rounded-xl transition-all active:scale-95"
            >
              <CheckCircle2 className="text-green-500" />
              <span className="font-bold text-green-500">CORRECT ({score.correct})</span>
            </button>
          </div>

          <div className="mt-8 flex items-center gap-8 text-slate-500">
            <button onClick={prevCard} className="hover:text-white transition"><ChevronLeft size={32} /></button>
            <button onClick={nextCard} className="hover:text-white transition"><ChevronRight size={32} /></button>
          </div>
        </>
      ) : (
        <div className="text-center text-slate-500">No cards found.</div>
      )}

      <div className="mt-10 flex gap-6">
        <button onClick={() => setCards(shuffleArray(cards))} className="flex items-center gap-2 text-slate-500 hover:text-red-400 transition text-xs uppercase tracking-widest font-bold">
          <Shuffle size={14} /> Shuffle
        </button>
        <button onClick={resetSession} className="flex items-center gap-2 text-slate-500 hover:text-white transition text-xs uppercase tracking-widest font-bold">
          <RotateCcw size={14} /> Reset Session
        </button>
      </div>
    </main>
  );
}
