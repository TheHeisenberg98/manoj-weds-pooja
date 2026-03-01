export type QuestionType = 'matching';

export interface QuizQuestion {
  id: string;
  question: string;
  options: [string, string, string];
  type: QuestionType;
  category: string;
}

// ============================================
// ALL 28 QUESTIONS — All Matching
// Both answer the same question, compared at gift reveal
// ============================================

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ═══ 🗺️ TRAVEL (5) ═══
  {
    id: 'travel-1',
    type: 'matching',
    category: '🗺️ Travel',
    question: "Dream honeymoon destination?",
    options: ['Maldives', 'Switzerland', 'Phook ke poori duniya ghum lenge room se'],
  },
  {
    id: 'travel-2',
    type: 'matching',
    category: '🗺️ Travel',
    question: "Which place did you both visit together for the FIRST time?",
    options: ['Her place', 'His place(rooftop/umbrella muah muah)', 'Tapri'],
  },
  {
    id: 'travel-3',
    type: 'matching',
    category: '🗺️ Travel',
    question: "Who's the better navigator on road trips?",
    options: ['Manoj (obviously)', "Pooja (Manoj can't read maps)", 'Google Maps (neither trusts the other)'],
  },
  {
    id: 'travel-4',
    type: 'matching',
    category: '🗺️ Travel',
    question: "If you could teleport anywhere RIGHT NOW for a weekend?",
    options: ['Beach (Goa/Maldives vibes)', 'Mountains (Manali/Shimla vibes)', 'City escape (Dubai/Singapore vibes)'],
  },
  {
    id: 'travel-5',
    type: 'matching',
    category: '🗺️ Travel',
    question: "Your ideal travel style as a couple?",
    options: ['Plan every detail, itinerary locked', 'Book flights, figure out the rest there', 'Wherever the cheapest deal takes us'],
  },

  // ═══ 🍕 FOOD (5) ═══
  {
    id: 'food-1',
    type: 'matching',
    category: '🍕 Food',
    question: "Your partner's comfort food?",
    options: ['Biryani', 'Jo Pooja banade', 'Gabbar will decide'],
  },
  {
    id: 'food-2',
    type: 'matching',
    category: '🍕 Food',
    question: "Who's the better cook between you two?",
    options: ['Manoj (secret chef)', 'Pooja (no contest)', "Zomato (let's be honest)"],
  },
  {
    id: 'food-3',
    type: 'matching',
    category: '🍕 Food',
    question: "What do you ALWAYS order when eating out?",
    options: ['Assamese food', 'Biryani', 'Whatever partner orders (plays safe)'],
  },
  {
    id: 'food-4',
    type: 'matching',
    category: '🍕 Food',
    question: "First meal you'll cook together after the wedding?",
    options: ['Maggi at midnight (classic)', 'A proper home-cooked dal-rice', "We're ordering in, who are we kidding"],
  },
  {
    id: 'food-5',
    type: 'matching',
    category: '🍕 Food',
    question: "Your go-to late night craving?",
    options: ['Ice cream from the fridge', 'Chai biscoot', 'Costa hai na! Sorted XD'],
  },

  // ═══ 🏙️ BENGALURU (5) ═══
  {
    id: 'blr-1',
    type: 'matching',
    category: '🏙️ Bengaluru',
    question: "What's your go-to date spot in Bengaluru?",
    options: ['Some local food joint', 'Indiranagar/Koramangala café', 'A special restaurant'],
  },
  {
    id: 'blr-2',
    type: 'matching',
    category: '🏙️ Bengaluru',
    question: "Which Bengaluru spot holds a special memory for you both?",
    options: ['Some fine dining', 'Rooftop(coz admin knows everything lol)', 'That one café where it all started'],
  },
  {
    id: 'blr-3',
    type: 'matching',
    category: '🏙️ Bengaluru',
    question: "Most spontaneous thing you've done together in Bengaluru?",
    options: ['Late night drive to airport road', 'Showed up at a random event/concert', 'Tried new cuisine at 1 AM'],
  },
  {
    id: 'blr-4',
    type: 'matching',
    category: '🏙️ Bengaluru',
    question: "If you had one last evening in Bengaluru together, where?",
    options: ['Rooftop restaurant with a view', 'Long drive on Nice Road', 'Back to "our spot" one last time'],
  },

  // ═══ 😂 FUN & PERSONALITY (7) ═══
  {
    id: 'fun-1',
    type: 'matching',
    category: '😂 Fun',
    question: "Manoj's most annoying habit?",
    options: ['Always on their laptop(fuck you AmEx)', 'Being late to everything', 'Forgetting important dates'],
  },
  {
    id: 'fun-2',
    type: 'matching',
    category: '😂 Fun',
    question: "What do YOU think Pooja worst habit is?",
    options: ['Taking too long to get ready', 'Overthinking everything', "Saying 'I'm fine' when not fine"],
  },
  {
    id: 'fun-3',
    type: 'matching',
    category: '😂 Fun',
    question: "Who said 'I love you' first?",
    options: ['Manoj (smooth operator)', 'Pooja (someone had to)', 'Neither — it was just understood'],
  },
  {
    id: 'fun-4',
    type: 'matching',
    category: '😂 Fun',
    question: "Who's more likely to cry at the wedding?",
    options: ['Manoj (secret softie)', 'Pooja', "Rona kyu hai bhai"],
  },
  {
    id: 'fun-5',
    type: 'matching',
    category: '😂 Fun',
    question: "Longest you've gone without talking during a fight?",
    options: ["A few hours (can't stay mad)", 'A full day', '2+ days (both stubborn)'],
  },
  {
    id: 'fun-6',
    type: 'matching',
    category: '😂 Fun',
    question: "Who will be the strict parent?",
    options: ['Manoj', 'Pooja', 'Both equally (tag team)'],
  },
  {
    id: 'fun-7',
    type: 'matching',
    category: '😂 Fun',
    question: "The one thing you'll NEVER change about your partner?",
    options: ['Their laugh', "Their stubbornness (it's cute, kind of)", 'How they care without showing it'],
  },

  // ═══ 💕 RELATIONSHIP & FUTURE (4) ═══
  {
    id: 'rel-1',
    type: 'matching',
    category: '💕 Relationship',
    question: "Your first impression of your partner?",
    options: ["Way out of my league", "Really smart/funny", "I need to talk to them again"],
  },
  {
    id: 'rel-2',
    type: 'matching',
    category: '💕 Relationship',
    question: "How did the marriage topic first come up?",
    options: ['Grand romantic gesture', 'Casually dropped in conversation', 'Families got involved first'],
  },
  {
    id: 'rel-3',
    type: 'matching',
    category: '💕 Relationship',
    question: "Where do you see yourselves in 5 years?",
    options: ['Settled with kids, proper grown-ups', 'Traveling the world, no rush', 'Building something big together'],
  },
  {
    id: 'rel-4',
    type: 'matching',
    category: '💕 Relationship',
    question: "Most important thing in your marriage?",
    options: ['Trust — everything else follows', 'Laughter — never stop having fun', 'Space — letting each other grow'],
  },

  // ═══ 🎬 POP CULTURE & RANDOM (4) ═══
  

  {
    id: 'pop-3',
    type: 'matching',
    category: '🎬 Random',
    question: "Your couple song?",
    options: ['Tum Hi Ho', 'Perfect (Ed Sheeran)', 'Something random only you two know'],
  },
  {
    id: 'pop-4',
    type: 'matching',
    category: '🎬 Random',
    question: "Your relationship's best-kept secret?",
    options: ['Secret nicknames for each other', "Already planned your entire future", 'One of you is WAY more romantic than they show'],
  },
];

// ============================================
// HELPERS
// ============================================

export function getQuestionsForPlayer(player: 'manoj' | 'pooja'): Array<{
  id: string;
  question: string;
  options: [string, string, string];
  type: QuestionType;
  category: string;
}> {
  return QUIZ_QUESTIONS.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options,
    type: q.type,
    category: q.category,
  }));
}

export function compareMatchingAnswers(
  manojAnswers: Record<string, number>,
  poojaAnswers: Record<string, number>
): Array<{
  questionId: string;
  question: string;
  manojAnswer: string;
  poojaAnswer: string;
  matched: boolean;
  category: string;
}> {
  // Only compare questions that both players have actually answered
  return QUIZ_QUESTIONS
    .filter((q) => manojAnswers[q.id] !== undefined && poojaAnswers[q.id] !== undefined)
    .map((q) => {
      const manojIdx = manojAnswers[q.id];
      const poojaIdx = poojaAnswers[q.id];
      return {
        questionId: q.id,
        question: q.question,
        manojAnswer: q.options[manojIdx],
        poojaAnswer: q.options[poojaIdx],
        matched: manojIdx === poojaIdx,
        category: q.category,
      };
    });
}
