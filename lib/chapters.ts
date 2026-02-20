export interface Photo {
  id: number;
  src?: string; // Supabase storage URL — leave empty for placeholder
  caption: string;
}

export interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  photos: Photo[];
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'childhood',
    title: 'The Early Days',
    subtitle: 'Where it all began',
    emoji: '🌅',
    photos: [
      { id: 1, caption: 'Little Manoj — the OG troublemaker' },
      { id: 2, caption: 'School days — already a legend' },
      { id: 3, caption: 'The smile that never changed' },
    ],
  },
  {
    id: 'college',
    title: 'College Chronicles',
    subtitle: 'When boys became brothers',
    emoji: '🎓',
    photos: [
      { id: 4, caption: 'First day, last bench — obviously' },
      { id: 5, caption: 'Canteen kings' },
      { id: 6, caption: 'Exam? What exam?' },
    ],
  },
  {
    id: 'squad',
    title: 'The Squad',
    subtitle: 'Trip tales & midnight stories',
    emoji: '🏔️',
    photos: [
      { id: 7, caption: 'Road trip #1 — the one that started it all' },
      { id: 8, caption: "That one night we'll never talk about" },
      { id: 9, caption: 'Bros before… well, you know' },
      { id: 10, caption: 'The group photo we actually all look good in' },
    ],
  },
  {
    id: 'couple',
    title: 'Manoj & Pooja',
    subtitle: 'When he found his forever',
    emoji: '💕',
    photos: [
      { id: 11, caption: 'The one who tamed the beast' },
      { id: 12, caption: 'Their first photo together' },
      { id: 13, caption: 'She said yes (like she had a choice 😂)' },
    ],
  },
];
