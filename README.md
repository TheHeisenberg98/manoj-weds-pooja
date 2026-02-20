# 🎊 Manoj Weds Pooja — Wedding Gift Website

A cinematic, Royal Indian-themed wedding gift website with a couple's challenge that must be completed by both Manoj and Pooja to unlock a MakeMyTrip voucher.

## 🚀 Quick Start

### 1. Supabase Setup
1. Go to [supabase.com](https://supabase.com) → your project (or create one)
2. Open **SQL Editor** → paste contents of `supabase-setup.sql` → Run
3. Go to **Settings → API** → copy your `Project URL` and `anon/public key`

### 2. Environment Setup
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

### 3. Install & Run
```bash
npm install
npm run dev
```

### 4. Deploy to Vercel
```bash
npx vercel
# Add environment variables in Vercel dashboard
```

## 🏗️ Architecture

```
Phone Gate → Photo Journey → Couple's Quiz → Waiting Room → Gift Reveal
                                    ↓
                            Supabase Realtime
                        (syncs both players' progress)
```

## 📁 Project Structure

```
├── app/
│   ├── globals.css        # Tailwind + custom styles
│   ├── layout.tsx         # Root layout with meta
│   └── page.tsx           # Main orchestrator
├── components/
│   ├── PhoneGate.tsx      # Phone number + fake OTP
│   ├── PhotoJourney.tsx   # Scroll-animated photo chapters
│   ├── CoupleQuiz.tsx     # Player-specific quiz
│   ├── WaitingRoom.tsx    # Realtime waiting for partner
│   ├── GiftReveal.tsx     # Confetti + voucher + match comparison
│   └── Ornaments.tsx      # Gold SVG decorations
├── lib/
│   ├── supabase.ts        # Client + player config
│   ├── questions.ts       # Quiz questions data
│   └── chapters.ts        # Photo chapters data
└── supabase-setup.sql     # Database setup script
```

## ✏️ Customization

- **Quiz questions**: Edit `lib/questions.ts`
- **Photos**: Add image URLs to `lib/chapters.ts`
- **Voucher amount**: Edit `components/GiftReveal.tsx`
- **Phone numbers**: Edit `lib/supabase.ts` → `PLAYER_CONFIG`
