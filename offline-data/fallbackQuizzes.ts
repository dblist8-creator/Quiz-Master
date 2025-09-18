import type { Question } from '../types.ts';

// A small, preloaded set of quizzes for offline fallback.
// This ensures the app is still usable without an internet connection.
// All questions must be 'multiple-choice' with exactly 4 options.
export const FALLBACK_QUIZZES: Record<string, Question[]> = {
  generalKnowledge: [
    {
      question: "What is the capital of France?",
      type: 'multiple-choice',
      options: ["Berlin", "Madrid", "Paris", "Rome"],
      correctAnswer: "Paris",
    },
    {
      question: "Which planet is known as the Red Planet?",
      type: 'multiple-choice',
      options: ["Earth", "Mars", "Jupiter", "Venus"],
      correctAnswer: "Mars",
    },
    {
        question: "Who wrote the play 'Romeo and Juliet'?",
        type: 'multiple-choice',
        options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        correctAnswer: "William Shakespeare"
    }
  ],
  scienceAndNature: [
    {
      question: "What is the chemical symbol for water?",
      type: 'multiple-choice',
      options: ["O2", "H2O", "CO2", "NaCl"],
      correctAnswer: "H2O",
    },
    {
      question: "What is the hardest natural substance on Earth?",
      type: 'multiple-choice',
      options: ["Gold", "Iron", "Diamond", "Quartz"],
      correctAnswer: "Diamond",
    },
  ],
  technology: [
    {
        question: "What does 'CPU' stand for?",
        type: 'multiple-choice',
        options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Unit", "Control Process Unit"],
        correctAnswer: "Central Processing Unit"
    },
    {
        question: "Which company created the programming language Swift?",
        type: 'multiple-choice',
        options: ["Google", "Microsoft", "Apple", "Facebook"],
        correctAnswer: "Apple"
    }
  ]
};