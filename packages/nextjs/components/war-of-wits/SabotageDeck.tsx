"use client";

import type { SabotageType } from "./types";
import { motion } from "framer-motion";

type SabotageDeckProps = {
  onTrigger: (type: SabotageType) => void;
};

const cards: { type: SabotageType; title: string; description: string }[] = [
  { type: "ice", title: "Ice Strike", description: "Ekrani dondurur" },
  { type: "smoke", title: "Smoke Grenade", description: "Soruyu bulaniklastirir" },
  { type: "time", title: "Time Thief", description: "Rakibin suresini calar" },
];

export const SabotageDeck = ({ onTrigger }: SabotageDeckProps) => {
  return (
    <aside className="rounded-3xl border border-white/15 bg-white/8 p-5 backdrop-blur-xl">
      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#3FD4FF]">Sabotage Your Rivals</h3>
      <p className="mt-2 text-xs text-white/60">
        BU ALAN BACKEND TARAFINDAN BAGLANACAK: Sabotaj haklari cuzdana gore hesaplanabilir.
      </p>

      <div className="mt-4 space-y-3">
        {cards.map(card => (
          <motion.button
            key={card.type}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onTrigger(card.type)}
            className="w-full rounded-2xl border border-[#ff315f]/45 bg-black/35 p-4 text-left transition-all hover:shadow-[0_0_18px_rgba(255,49,95,0.8)]"
          >
            <p className="text-sm font-semibold text-[#ff6f8f]">{card.title}</p>
            <p className="mt-1 text-xs text-white/70">{card.description}</p>
          </motion.button>
        ))}
      </div>
    </aside>
  );
};
