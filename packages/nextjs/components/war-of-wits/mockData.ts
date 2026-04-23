import type { BlitzFeedItem, QuizQuestion } from "./types";

export const mockPot = 2540.5; // BU ALAN BACKEND TARAFINDAN BAGLANACAK

export const mockQuestions: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Monad neden ultra dusuk latency ile dikkat cekiyor?",
    options: [
      { id: "a", label: "Parallel EVM execution", isCorrect: true },
      { id: "b", label: "Yavas finality", isCorrect: false },
      { id: "c", label: "Sadece L1 bridge hizi", isCorrect: false },
      { id: "d", label: "Gas costlarini kaldirmasi", isCorrect: false },
    ],
  },
  {
    id: "q2",
    prompt: "Web3 quiz oyunlarinda en kritik UX hedefi nedir?",
    options: [
      { id: "a", label: "Onay bekletmek", isCorrect: false },
      { id: "b", label: "Anlik geri bildirim", isCorrect: true },
      { id: "c", label: "Sabit ekranlar", isCorrect: false },
      { id: "d", label: "Dusuk kontrast", isCorrect: false },
    ],
  },
  {
    id: "q3",
    prompt: "High-stakes hissetmek icin hangi unsur en etkili?",
    options: [
      { id: "a", label: "Statik metinler", isCorrect: false },
      { id: "b", label: "Yavas gecisler", isCorrect: false },
      { id: "c", label: "Canli pot + zaman baskisi", isCorrect: true },
      { id: "d", label: "Efektsiz butonlar", isCorrect: false },
    ],
  },
];

export const mockFeed: BlitzFeedItem[] = [
  { id: "f1", message: "Alice just sabotaged Bob!" },
  { id: "f2", message: "The Pot reached 5000 MON!" },
  { id: "f3", message: "Cem landed a perfect streak x4." },
  { id: "f4", message: "Time Thief activated against Team Neon." },
  { id: "f5", message: "Derya secured a 220 MON speed bonus." },
  { id: "f6", message: "Ice Strike froze the arena for 1.5s." },
];
