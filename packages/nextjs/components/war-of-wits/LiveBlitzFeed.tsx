"use client";

import { useEffect, useState } from "react";
import type { BlitzFeedItem } from "./types";
import { motion } from "framer-motion";

type LiveBlitzFeedProps = {
  seedItems: BlitzFeedItem[];
};

export const LiveBlitzFeed = ({ seedItems }: LiveBlitzFeedProps) => {
  const [items, setItems] = useState(seedItems.slice(0, 4));

  useEffect(() => {
    const interval = setInterval(() => {
      const randomItem = seedItems[Math.floor(Math.random() * seedItems.length)];
      const id = `${randomItem.id}-${Date.now()}`;
      setItems(previous => [{ id, message: randomItem.message }, ...previous].slice(0, 6));
    }, 1300);

    return () => clearInterval(interval);
  }, [seedItems]);

  return (
    <section className="rounded-3xl border border-white/15 bg-black/55 p-4 font-mono backdrop-blur-lg">
      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#15ff7a]">Live Blitz Feed</h3>
      <div className="mt-3 space-y-2">
        {items.map(item => (
          <motion.p
            key={item.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-[#15ff7a] sm:text-sm"
          >
            &gt; {item.message}
          </motion.p>
        ))}
      </div>
    </section>
  );
};
