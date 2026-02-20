export type QuestionType = 'matching' | 'matching';

export interface QuizQuestion {
  id: string;
  question: string;
  questionForManoj?: string;
  questionForPooja?: string;
  options: [string, string, string];
  type: QuestionType;
  correctForManoj?: number;
  correctForPooja?: number;
  category: string;
}

// ============================================
// ALL 30 QUESTIONS
// ============================================
// "matching" → correctForManoj = what Manoj answers about Pooja
//                    correctForPooja = what Pooja answers about Manoj
// "matching" → no correct answer, compared at gift reveal
// TODO: Update all correct answers before go-live!

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ═══ 🗺️ TRAVEL (5) ═══
  {
    id: 'travel-1',
    type: 'matching',
    category: '🗺️ Travel',
    questionForManoj: "What's Pooja's dream honeymoon destination?",
    questionForPooja: "What's Manoj's dream honeymoon destination?",
    question: "Partner's dream honeymoon?",
    options: ['Maldives', 'Switzerland', 'Bali'],
    correctForManoj: 0,
    correctForPooja: 2,
  },
  {
    id: 'travel-2',
    type: 'matching',
    category: '🗺️ Travel',
    questionForManoj: "Which place did you both visit together for the FIRST time?",
    questionForPooja: "Which place did you both visit together for the FIRST time?",
    question: "First trip together?",
    options: ['Goa', 'Nandi Hills', 'Coorg'],
    correctForManoj: 1,
    correctForPooja: 1,
  },
  {
    id: 'travel-3',
    type: 'matching',
    category: '🗺️ Travel',
    questionForManoj: "Who's the better navigator on road trips?",
    questionForPooja: "Who's the better navigator on road trips?",
    question: "Better navigator?",
    options: ['Manoj (obviously)', "Pooja (Manoj can't read maps)", 'Google Maps (neither trusts the other)'],
    correctForManoj: 2,
    correctForPooja: 2,
  },
  {
    id: 'travel-4',
    type: 'matching',
    category: '🗺️ Travel',
    question: "If you could teleport anywhere RIGHT NOW for a weekend, where?",
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
    questionForManoj: "What's Pooja's comfort food she could eat every single day?",
    questionForPooja: "What does Manoj ALWAYS order when you both eat out?",
    question: "Partner's comfort food?",
    options: ['Biryani', 'Pasta', 'Rajma Chawal'],
    correctForManoj: 0,
    correctForPooja: 0,
  },
  {
    id: 'food-2',
    type: 'matching',
    category: '🍕 Food',
    questionForManoj: "Who's the better cook between you two?",
    questionForPooja: "Who's the better cook between you two?",
    question: "Better cook?",
    options: ['Manoj (secret chef)', 'Pooja (no contest)', "Zomato (let's be honest)"],
    correctForManoj: 1,
    correctForPooja: 1,
  },
  {
    id: 'food-3',
    type: 'matching',
    category: '🍕 Food',
    questionForManoj: "What does Manoj ALWAYS order when eating out?",
    questionForPooja: "What's Pooja's comfort food she could eat every day?",
    question: "Your own comfort food?",
    options: ['Butter Chicken', 'Paneer Tikka', 'Whatever partner orders (plays safe)'],
    correctForManoj: 0,
    correctForPooja: 1,
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
    options: ['Ice cream from the fridge', 'Instant noodles', 'Full meal from Swiggy'],
  },

  // ═══ 🏙️ BENGALURU (5) ═══
  {
    id: 'blr-1',
    type: 'matching',
    category: '🏙️ Bengaluru',
    questionForManoj: "What's your go-to date spot in Bengaluru?",
    questionForPooja: "What's your go-to date spot in Bengaluru?",
    question: "Go-to date spot?",
    options: ['Cubbon Park', 'Indiranagar/Koramangala café', 'A special restaurant'],
    correctForManoj: 1,
    correctForPooja: 1,
  },
  {
    id: 'blr-2',
    type: 'matching',
    category: '🏙️ Bengaluru',
    questionForManoj: "Which Bengaluru spot holds a special memory for you both?",
    questionForPooja: "Which Bengaluru spot holds a special memory for you both?",
    question: "Special memory spot?",
    options: ['Lalbagh', 'Nandi Hills sunrise', 'That one café where it all started'],
    correctForManoj: 1,
    correctForPooja: 1,
  },
  {
    id: 'blr-3',
    type: 'matching',
    category: '🏙️ Bengaluru',
    questionForManoj: "Most spontaneous thing you've done together in Bengaluru?",
    questionForPooja: "Most spontaneous thing you've done together in Bengaluru?",
    question: "Most spontaneous moment?",
    options: ['Late night drive to airport road', 'Showed up at a random event/concert', 'Tried new cuisine at 1 AM'],
    correctForManoj: 0,
    correctForPooja: 0,
  },
  {
    id: 'blr-4',
    type: 'matching',
    category: '🏙️ Bengaluru',
    question: "If you had one last evening in Bengaluru together, where?",
    options: ['Rooftop restaurant with a view', 'Long drive on Nice Road', 'Back to "our spot" one last time'],
  },
  {
    id: 'blr-5',
    type: 'matching',
    category: '🏙️ Bengaluru',
    question: "Bengaluru traffic on your way to a date — your reaction?",
    options: ['Road rage (honking included)', 'Chill playlist and enjoy the ride', 'Cancel and order in instead'],
  },

  // ═══ 😂 FUN & PERSONALITY (7) ═══
  {
    id: 'fun-1',
    type: 'matching',
    category: '😂 Fun',
    questionForManoj: "What's Pooja's most annoying habit according to you?",
    questionForPooja: "What's Manoj's most annoying habit according to you?",
    question: "Partner's most annoying habit?",
    options: ['Always on their phone', 'Being late to everything', 'Forgetting important dates'],
    correctForManoj: 0,
    correctForPooja: 1,
  },
  {
    id: 'fun-2',
    type: 'matching',
    category: '😂 Fun',
    questionForManoj: "What does Pooja think HER worst habit is?",
    questionForPooja: "What does Manoj think HIS worst habit is?",
    question: "What they think their own worst habit is?",
    options: ['Taking too long to get ready', 'Overthinking everything', "Saying 'I'm fine' when not fine"],
    correctForManoj: 1,
    correctForPooja: 0,
  },
  {
    id: 'fun-3',
    type: 'matching',
    category: '😂 Fun',
    questionForManoj: "Who said 'I love you' first?",
    questionForPooja: "Who said 'I love you' first?",
    question: "Who said I love you first?",
    options: ['Manoj (smooth operator)', 'Pooja (someone had to)', 'Neither — it was just understood'],
    correctForManoj: 0,
    correctForPooja: 0,
  },
  {
    id: 'fun-4',
    type: 'matching',
    category: '😂 Fun',
    questionForManoj: "Who's more likely to cry at the wedding?",
    questionForPooja: "Who's more likely to cry at the wedding?",
    question: "Who'll cry at the wedding?",
    options: ['Manoj (secret softie)', 'Pooja', "Both — waterfall guaranteed"],
    correctForManoj: 2,
    correctForPooja: 2,
  },
  {
    id: 'fun-5',
    type: 'matching',
    category: '😂 Fun',
    questionForManoj: "Longest you've gone without talking during a fight?",
    questionForPooja: "Longest you've gone without talking during a fight?",
    question: "Longest silent treatment?",
    options: ["A few hours (can't stay mad)", 'A full day', '2+ days (both stubborn)'],
    correctForManoj: 0,
    correctForPooja: 0,
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
    questionForManoj: "What was your first impression of Pooja?",
    questionForPooja: "What was your first impression of Manoj?",
    question: "First impression?",
    options: ["Way out of my league", "Really smart/funny", "I need to talk to them again"],
    correctForManoj: 0,
    correctForPooja: 1,
  },
  {
    id: 'rel-2',
    type: 'matching',
    category: '💕 Relationship',
    questionForManoj: "How did the marriage topic first come up?",
    questionForPooja: "How did the marriage topic first come up?",
    question: "How did marriage come up?",
    options: ['Grand romantic gesture', 'Casually dropped in conversation', 'Families got involved first'],
    correctForManoj: 1,
    correctForPooja: 1,
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
    id: 'pop-1',
    type: 'matching',
    category: '🎬 Random',
    question: "Pick a Bollywood couple that's most like you:",
    options: ['Bunny & Naina (YJHD)', 'Aman & Naina (Kal Ho Naa Ho)', 'Kabir & Naina (calmer YJHD vibes)'],
  },
  {
    id: 'pop-2',
    type: 'matching',
    category: '🎬 Random',
    questionForManoj: "Who controls the TV remote?",
    questionForPooja: "Who controls the TV remote?",
    question: "Who has the remote?",
    options: ['Manoj', 'Pooja', "Whoever grabs it first — survival mode"],
    correctForManoj: 2,
    correctForPooja: 2,
  },
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
    questionForManoj: "Your relationship's best-kept secret?",
    questionForPooja: "Your relationship's best-kept secret?",
    question: "Your secret?",
    options: ['Secret nicknames for each other', "Already planned your entire future", 'One of you is WAY more romantic than they show'],
    correctForManoj: 0,
    correctForPooja: 0,
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
  correctAnswer?: number;
  category: string;
}> {
  return QUIZ_QUESTIONS.map((q) => {
    const question =
      q.type === 'matching'
        ? player === 'manoj'
          ? q.questionForManoj!
          : q.questionForPooja!
        : q.question;

    const correctAnswer =
      q.type === 'matching'
        ? player === 'manoj'
          ? q.correctForManoj
          : q.correctForPooja
        : undefined;

    return {
      id: q.id,
      question,
      options: q.options,
      type: q.type,
      correctAnswer,
      category: q.category,
    };
  });
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
  return QUIZ_QUESTIONS.filter((q) => q.type === 'matching').map((q) => {
    const manojIdx = manojAnswers[q.id] ?? 0;
    const poojaIdx = poojaAnswers[q.id] ?? 0;
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
