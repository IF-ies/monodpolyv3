"use client";

import { useEffect, useMemo, useState } from "react";
import type { QuizQuestion } from "./types";
import { motion } from "framer-motion";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type CombatArenaProps = {
  question: QuizQuestion;
  onCorrect: () => void;
  onWrong: () => void;
  onEdgeGlow: () => void;
  glitchTick: number;
};

const ROUND_MS = 8000;

export const CombatArena = ({ question, onCorrect, onWrong, onEdgeGlow, glitchTick }: CombatArenaProps) => {
  const [timeLeft, setTimeLeft] = useState(ROUND_MS);
  const [selected, setSelected] = useState<string | null>(null);
  const [optimisticSuccess, setOptimisticSuccess] = useState<string | null>(null);

  // ⛓️ Kontrat bağlantısı
  const { writeContractAsync, isPending } = useScaffoldWriteContract("YourContract");

  useEffect(() => {
    setTimeLeft(ROUND_MS);
    setSelected(null);
    setOptimisticSuccess(null);
  }, [question.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(previous => Math.max(0, previous - 50));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const progress = useMemo(() => (timeLeft / ROUND_MS) * 100, [timeLeft]);

  const handleOptionClick = async (optionId: string, isCorrect: boolean) => {
    if (selected || isPending) return;
    setSelected(optionId);
    onEdgeGlow();

    try {
      // ⛓️ Cevabı kontrата gönder — submitAnswer(questionId, answerId)
      await writeContractAsync({
        functionName: "submitAnswer",
        args: [question.id, optionId, isCorrect],
      });

      if (isCorrect) {
        setOptimisticSuccess(optionId);
        onCorrect();
      } else {
        onWrong();
      }
    } catch (e) {
      console.error("TX hatası:", e);
      setSelected(null); // TX başarısız olursa kullanıcı tekrar seçebilsin
    }
  };

  return (
    <motion.section
      key={glitchTick}
      initial={{ x: 0 }}
      animate={{ x: [0, -12, 10, -8, 8, 0] }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="relative rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-2xl sm:p-7"
    >
      <div className="mb-3 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-white/70">
        <span>MONAD 10,000 TPS STRESS BAR</span>
        <span>{Math.ceil(timeLeft / 1000)}s</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full border border-[#3FD4FF]/40 bg-black/40">
        <motion.div
          className="h-full bg-gradient-to-r from-[#3FD4FF] via-[#836EFB] to-[#15ff7a] shadow-[0_0_22px_rgba(63,212,255,0.9)]"
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 140, damping: 30 }}
        />
      </div>

      <h2 className="mt-6 text-lg font-bold text-white sm:text-2xl">{question.prompt}</h2>

      {/* TX bekleniyor göstergesi */}
      {isPending && <p className="mt-2 text-xs text-[#836EFB] animate-pulse">⏳ Monad&apos;a gönderiliyor...</p>}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.options.map(option => {
          const isActive = selected === option.id;
          const showGreen = optimisticSuccess === option.id;
          const buttonClass = showGreen
            ? "border-[#15ff7a] bg-[#15ff7a]/20 text-[#15ff7a] shadow-[0_0_22px_rgba(21,255,122,0.8)]"
            : isActive
              ? "border-[#ff315f] bg-[#ff315f]/20 text-[#ffd1dc] shadow-[0_0_18px_rgba(255,49,95,0.7)]"
              : "border-[#836EFB]/50 bg-black/35 text-white hover:border-[#836EFB] hover:shadow-[0_0_20px_rgba(131,110,251,0.7)]";

          return (
            <motion.button
              key={option.id}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.97, y: 1 }}
              disabled={!!selected || isPending}
              onClick={() => handleOptionClick(option.id, option.isCorrect)}
              className={`rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${buttonClass}`}
            >
              {option.label}
            </motion.button>
          );
        })}
      </div>

      {optimisticSuccess ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 inline-flex items-center rounded-full border border-[#15ff7a]/50 bg-[#15ff7a]/10 px-4 py-1 text-xs font-bold tracking-wider text-[#15ff7a]"
        >
          OPTIMISTIC CONFIRMED - SPEED BOOST
        </motion.div>
      ) : null}
    </motion.section>
  );
};
