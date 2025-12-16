import { GoogleGenAI, Type } from "@google/genai";
import { RoundData, GameOption } from "../types";

const apiKey = process.env.API_KEY;

// Fallback data in case of API failure or rate limiting to ensure kid can still play
const FALLBACK_ROUNDS: RoundData[] = [
  {
    letter: "A",
    options: [
      { word: "Apple", emoji: "🍎", isCorrect: true },
      { word: "Dog", emoji: "🐶", isCorrect: false },
      { word: "Car", emoji: "🚗", isCorrect: false }
    ]
  },
  {
    letter: "B",
    options: [
      { word: "Ball", emoji: "⚽", isCorrect: true },
      { word: "Cat", emoji: "🐱", isCorrect: false },
      { word: "Sun", emoji: "☀️", isCorrect: false }
    ]
  },
  {
    letter: "C",
    options: [
      { word: "Cat", emoji: "🐱", isCorrect: true },
      { word: "Pig", emoji: "🐷", isCorrect: false },
      { word: "Bus", emoji: "🚌", isCorrect: false }
    ]
  }
];

export const generateGameRound = async (excludeLetter?: string): Promise<RoundData> => {
  if (!apiKey) {
    console.warn("No API Key found, using fallback data.");
    return getRandomFallback(excludeLetter);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      Generate a single round for a letter learning game for a 4-year-old.
      1. Choose a random english letter (A-Z).
      2. Provide one simple word that STARTS with this letter (correct answer).
      3. Provide two simple words that DO NOT start with this letter (distractors).
      4. For each word, provide a standard emoji that best represents it.
      ${excludeLetter ? `Do not use the letter '${excludeLetter}'.` : ''}
      Ensure words are concrete nouns (animals, fruits, vehicles) easy for a child to recognize.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            letter: { type: Type.STRING },
            correctWord: { type: Type.STRING },
            correctEmoji: { type: Type.STRING },
            wrongWord1: { type: Type.STRING },
            wrongEmoji1: { type: Type.STRING },
            wrongWord2: { type: Type.STRING },
            wrongEmoji2: { type: Type.STRING },
          },
          required: ["letter", "correctWord", "correctEmoji", "wrongWord1", "wrongEmoji1", "wrongWord2", "wrongEmoji2"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");

    const data = JSON.parse(text);

    // Construct the GameOption array and shuffle it locally
    const options: GameOption[] = [
      { word: data.correctWord, emoji: data.correctEmoji, isCorrect: true },
      { word: data.wrongWord1, emoji: data.wrongEmoji1, isCorrect: false },
      { word: data.wrongWord2, emoji: data.wrongEmoji2, isCorrect: false },
    ];

    // Simple shuffle
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return {
      letter: data.letter.toUpperCase(),
      options: options
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return getRandomFallback(excludeLetter);
  }
};

const getRandomFallback = (exclude?: string): RoundData => {
  const available = FALLBACK_ROUNDS.filter(r => r.letter !== exclude);
  const random = available[Math.floor(Math.random() * available.length)];
  
  // Shuffle options for fallback
  const shuffledOptions = [...random.options];
  for (let i = shuffledOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
  }
  
  return { ...random, options: shuffledOptions };
};
