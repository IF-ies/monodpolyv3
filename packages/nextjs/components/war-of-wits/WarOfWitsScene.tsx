"use client";

import { useEffect, useMemo, useState } from "react";
import { CombatArena } from "./CombatArena";
import { HyperPotCounter } from "./HyperPotCounter";
import { LiveBlitzFeed } from "./LiveBlitzFeed";
import { SabotageDeck } from "./SabotageDeck";
import { VictoryOverlay } from "./VictoryOverlay";
import { mockFeed, mockPot, mockQuestions } from "./mockData";
import type { SabotageType } from "./types";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { formatEther } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const burstConfetti = () => {
  void confetti({ particleCount: 120, spread: 72, origin: { y: 0.65 } });
};

const victoryConfetti = () => {
  const defaults = { ticks: 220, gravity: 0.75, decay: 0.94, startVelocity: 32 };
  void confetti({ ...defaults, particleCount: 180, spread: 180, origin: { x: 0.5, y: 0.6 } });
  void confetti({ ...defaults, particleCount: 120, angle: 60, spread: 90, origin: { x: 0.03, y: 0.5 } });
  void confetti({ ...defaults, particleCount: 120, angle: 120, spread: 90, origin: { x: 0.97, y: 0.5 } });
};

export const WarOfWitsScene = () => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [pot, setPot] = useState(mockPot);
  const [potPulseKey, setPotPulseKey] = useState(0);
  const [glitchTick, setGlitchTick] = useState(0);
  const [edgeGlowTick, setEdgeGlowTick] = useState(0);
  const [sabotageEffect, setSabotageEffect] = useState<SabotageType | null>(null);
  const [victoryVisible, setVictoryVisible] = useState(false);

  // 💰 Pot'u kontrat'tan oku
  const { data: contractPot } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "totalPot", // ⚠️ ABI'deki gerçek fonksiyon adıyla değiştir
  });

  // Kontrat verisi gelince pot'u güncelle, yoksa mock kullan
  useEffect(() => {
    if (contractPot) {
      setPot(Number(formatEther(contractPot as bigint)));
    }
  }, [contractPot]);

  const currentQuestion = useMemo(() => mockQuestions[questionIndex % mockQuestions.length], [questionIndex]);

  const triggerEdgeGlow = () => setEdgeGlowTick(previous => previous + 1);

  const handleCorrect = () => {
    burstConfetti();
    setPot(previous => previous + 7 + Math.random() * 10);
    setPotPulseKey(previous => previous + 1);
    triggerEdgeGlow();
    setTimeout(() => {
      setQuestionIndex(previous => previous + 1);
    }, 850);
  };

  const handleWrong = () => {
    setGlitchTick(previous => previous + 1);
    triggerEdgeGlow();
  };

  const handleSabotage = (type: SabotageType) => {
    setSabotageEffect(type);
    triggerEdgeGlow();
    setTimeout(() => setSabotageEffect(null), 1300);
  };

  const handleSimulateWin = () => {
    triggerEdgeGlow();
    victoryConfetti();
    setVictoryVisible(true);
    setTimeout(() => setVictoryVisible(false), 2600);
  };

  // Pot animasyonu (mock veya kontrat yokken çalışır)
  useEffect(() => {
    if (contractPot) return; // kontrat bağlıysa mock artışı durdur
    const interval = setInterval(() => {
      setPot(previous => previous + Math.random() * 1.9);
    }, 2400);
    return () => clearInterval(interval);
  }, [contractPot]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000000] px-3 py-5 text-white sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(131,110,251,0.26),transparent_36%),radial-gradient(circle_at_100%_60%,rgba(63,212,255,0.2),transparent_40%)]" />
      <motion.div
        key={edgeGlowTick}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="pointer-events-none absolute inset-0 z-40 rounded-[20px] border-2 border-[#836EFB]/80 shadow-[inset_0_0_70px_rgba(131,110,251,0.6),0_0_55px_rgba(63,212,255,0.6)]"
      />

      {sabotageEffect ? (
        <div
          className={`pointer-events-none fixed inset-0 z-30 transition-all duration-200 ${
            sabotageEffect === "smoke"
              ? "backdrop-blur-md bg-white/7"
              : sabotageEffect === "ice"
                ? "bg-cyan-200/10 backdrop-saturate-0"
                : "bg-[#ff315f]/8"
          }`}
        />
      ) : null}

      {/* 🏆 wonAmount ile gerçek kazanılan MON gösterimi */}
      <VictoryOverlay visible={victoryVisible} wonAmount={pot} />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[#3FD4FF] sm:text-sm">
            The War of Wits - Monad Blitz Kayseri
          </p>
          <button
            onClick={handleSimulateWin}
            className="btn btn-sm border border-[#15ff7a]/60 bg-[#15ff7a]/15 font-bold text-[#15ff7a] hover:bg-[#15ff7a]/30"
          >
            Simulate Win
          </button>
        </div>

        <HyperPotCounter basePot={pot} pulseKey={potPulseKey} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <CombatArena
              question={currentQuestion}
              onCorrect={handleCorrect}
              onWrong={handleWrong}
              onEdgeGlow={triggerEdgeGlow}
              glitchTick={glitchTick}
            />
          </div>
          <div className="lg:col-span-4">
            <SabotageDeck onTrigger={handleSabotage} />
          </div>
        </div>

        <LiveBlitzFeed seedItems={mockFeed} />
      </div>
    </main>
  );
};
