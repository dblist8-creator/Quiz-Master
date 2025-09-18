import { GoogleGenAI, Type } from "@google/genai";
import type { Question, QuizSetupOptions } from '../types.ts';
import { supportedLanguages } from '../locales.ts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuizQuestions = async (options: QuizSetupOptions): Promise<Question[]> => {
  const { numQuestions, category, difficulty, language } = options;
  const numOptions = 4; // Hardcoded to 4 as per new requirement.
  
  // Convert language code (e.g., "en") to full name (e.g., "English") for a more robust prompt.
  const languageName = supportedLanguages.find(l => l.code === language)?.name || 'English';

  const questionSchema = {
    type: Type.OBJECT,
    properties: {
      question: {
        type: Type.STRING,
        description: "The question text. It should be engaging and clear."
      },
      type: {
          type: Type.STRING,
          enum: ['multiple-choice'],
          description: "The type of the question. This must always be 'multiple-choice'."
      },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: `An array of exactly ${numOptions} possible answers.`
      },
      correctAnswer: {
        type: Type.STRING,
        description: "The correct answer. It must be one of the strings from the 'options' array."
      },
    },
    required: ["question", "type", "options", "correctAnswer"]
  };

  let difficultyInstruction = '';
  switch (difficulty) {
    case 'Easy':
      difficultyInstruction = 'The questions should be easy, targeting beginners. Use simple vocabulary and focus on fundamental concepts. Avoid obscure trivia.';
      break;
    case 'Medium':
      difficultyInstruction = 'The questions should be of medium difficulty, suitable for someone with a general knowledge of the topic.';
      break;
    case 'Hard':
      difficultyInstruction = 'The questions should be hard, challenging even for enthusiasts. They can cover niche topics, require in-depth knowledge, and include subtle distractors in the options.';
      break;
  }

  const prompt = `Generate a quiz with ${numQuestions} questions about ${category}.
The difficulty level should be ${difficulty}. ${difficultyInstruction}
The questions and answers must be in ${languageName}.

All questions must be of type 'multiple-choice'.

Follow these rules for each question:
1.  Provide exactly ${numOptions} options.
2.  The 'correctAnswer' must exactly match one of the options.
3.  The 'type' field must always be 'multiple-choice'.

Ensure the final output is a valid JSON object containing only a "questions" array, with no introductory text.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: questionSchema,
              description: `An array of ${numQuestions} quiz questions.`
            }
          },
          required: ["questions"]
        },
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    
    const cleanedJsonText = jsonText.replace(/^```json\s*|```$/g, '');
    
    const result = JSON.parse(cleanedJsonText);
    
    if (result.questions && Array.isArray(result.questions)) {
        return result.questions as Question[];
    } else {
        console.error("Unexpected JSON structure:", result);
        throw new Error("Failed to parse quiz questions from API response.");
    }

  } catch (error) {
    console.error("Error generating quiz questions:", error);
    throw new Error("Failed to generate quiz questions. Please check your API key and try again.");
  }
};