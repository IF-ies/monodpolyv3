export type QuizOption = {
  id: string;
  label: string;
  isCorrect: boolean;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
};

export type SabotageType = "ice" | "smoke" | "time";

export type BlitzFeedItem = {
  id: string;
  message: string;
};
