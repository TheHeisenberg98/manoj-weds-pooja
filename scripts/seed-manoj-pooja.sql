-- ============================================================================
-- Seed: Manoj Weds Pooja — Multi-Tenant Schema
-- Run in Supabase SQL Editor (bypasses RLS)
-- ============================================================================

DO $$
DECLARE
  v_experience_id UUID;
  v_creator_id UUID;
BEGIN

  -- -----------------------------------------------------------------------
  -- 1. Guard: skip if experience already exists
  -- -----------------------------------------------------------------------
  IF EXISTS (SELECT 1 FROM experiences WHERE slug = 'manoj-weds-pooja') THEN
    RAISE NOTICE 'Experience "manoj-weds-pooja" already exists. Skipping seed.';
    RETURN;
  END IF;

  -- -----------------------------------------------------------------------
  -- 2. Resolve or create a creator
  -- -----------------------------------------------------------------------
  SELECT id INTO v_creator_id FROM creators LIMIT 1;

  IF v_creator_id IS NULL THEN
    INSERT INTO creators (id, email, name)
    VALUES ('00000000-0000-0000-0000-000000000001', 'admin@lovecraft.app', 'LoveCraft Admin')
    ON CONFLICT (id) DO NOTHING;
    v_creator_id := '00000000-0000-0000-0000-000000000001';
  END IF;

  -- -----------------------------------------------------------------------
  -- 3. Insert the experience
  -- -----------------------------------------------------------------------
  INSERT INTO experiences (
    id, creator_id, slug, title, subtitle,
    occasion, person_a_name, person_b_name,
    person_a_label, person_b_label,
    access_mode, access_phones,
    is_published, theme, gift_config
  )
  VALUES (
    gen_random_uuid(),
    v_creator_id,
    'manoj-weds-pooja',
    'Manoj Weds Pooja',
    'Shubh Vivah',
    'wedding',
    'Manoj',
    'Pooja',
    'Groom',
    'Bride',
    'phone',
    '[{"phone":"8825607563","maps_to":"a"},{"phone":"9176316441","maps_to":"a"},{"phone":"8448522614","maps_to":"b"}]'::jsonb,
    true,
    '{
      "primaryBg": "#1A0A0A",
      "accentColor": "#8B1C1C",
      "goldColor": "#D4A853",
      "goldColorLight": "#E8D5A3",
      "goldColorDark": "#B8924A",
      "creamColor": "#F5E6D0",
      "mutedColor": "#A89A8C",
      "fontFamily": "Cormorant Garamond"
    }'::jsonb,
    '{
      "gift_type": "voucher",
      "gift_data": {
        "voucher_brand": "MakeMyTrip",
        "voucher_amount": "\u20B9 10,001",
        "voucher_code": "1001-1301-1205-8190",
        "voucher_subtitle": "Gift Voucher",
        "reveal_text": "A Gift For The Couple",
        "message_from": "With love, from the boys \u2764\uFE0F"
      }
    }'::jsonb
  )
  RETURNING id INTO v_experience_id;

  RAISE NOTICE 'Created experience: %', v_experience_id;

  -- -----------------------------------------------------------------------
  -- 4. Insert all 9 stages
  -- -----------------------------------------------------------------------

  -- Stage 0: phone_gate
  INSERT INTO stages (id, experience_id, stage_type, sort_order, is_enabled, config)
  VALUES (gen_random_uuid(), v_experience_id, 'phone_gate', 0, true, '{}'::jsonb);

  -- Stage 1: hinge_intro
  INSERT INTO stages (id, experience_id, stage_type, sort_order, is_enabled, config)
  VALUES (gen_random_uuid(), v_experience_id, 'hinge_intro', 1, true,
    '{
      "cards": [
        {"text": "Making every moment count", "emoji": "\uD83D\uDC95", "subtext": "A life goal of mine"},
        {"text": "From a swipe to forever", "emoji": "\uD83D\uDED2", "subtext": "Our love story"},
        {"text": "Found my person and I''m never letting go", "emoji": "\uD83D\uDC9D", "subtext": "The simplest truth"}
      ]
    }'::jsonb
  );

  -- Stage 2: photo_journey
  INSERT INTO stages (id, experience_id, stage_type, sort_order, is_enabled, config)
  VALUES (gen_random_uuid(), v_experience_id, 'photo_journey', 2, true,
    '{
      "chapters": [
        {
          "title": "The Early Days",
          "subtitle": "Where it all began",
          "emoji": "\uD83C\uDF05",
          "photos": [
            {"url": "", "caption": "Little Manoj \u2014 the OG troublemaker"},
            {"url": "", "caption": "School days \u2014 already a legend"},
            {"url": "", "caption": "The smile that never changed"}
          ]
        },
        {
          "title": "College Chronicles",
          "subtitle": "When boys became brothers",
          "emoji": "\uD83C\uDF93",
          "photos": [
            {"url": "", "caption": "First day, last bench \u2014 obviously"},
            {"url": "", "caption": "Canteen kings"},
            {"url": "", "caption": "Exam? What exam?"}
          ]
        },
        {
          "title": "The Squad",
          "subtitle": "Trip tales & midnight stories",
          "emoji": "\uD83C\uDFD4\uFE0F",
          "photos": [
            {"url": "", "caption": "Road trip #1 \u2014 the one that started it all"},
            {"url": "", "caption": "That one night we''ll never talk about"},
            {"url": "", "caption": "Bros before\u2026 well, you know"},
            {"url": "", "caption": "The group photo we actually all look good in"}
          ]
        },
        {
          "title": "Manoj & Pooja",
          "subtitle": "When he found his forever",
          "emoji": "\uD83D\uDC95",
          "photos": [
            {"url": "", "caption": "The one who tamed the beast"},
            {"url": "", "caption": "Their first photo together"},
            {"url": "", "caption": "She said yes (like she had a choice \uD83D\uDE02)"}
          ]
        }
      ]
    }'::jsonb
  );

  -- Stage 3: swipe_game
  INSERT INTO stages (id, experience_id, stage_type, sort_order, is_enabled, config)
  VALUES (gen_random_uuid(), v_experience_id, 'swipe_game', 3, true,
    '{
      "scenarios": [
        {"text": "Forget their anniversary", "emoji": "\uD83D\uDCC5"},
        {"text": "Hog the blanket at night", "emoji": "\uD83D\uDECF\uFE0F"},
        {"text": "Cry during a movie", "emoji": "\uD83C\uDFAC"},
        {"text": "Burn the kitchen down trying to cook", "emoji": "\uD83D\uDD25"},
        {"text": "Spend 2 hours getting ready", "emoji": "\uD83D\uDC84"},
        {"text": "Fall asleep during a serious conversation", "emoji": "\uD83D\uDE34"},
        {"text": "Win an argument (always)", "emoji": "\uD83C\uDFC6"},
        {"text": "Be the first to apologize", "emoji": "\uD83D\uDE4F"},
        {"text": "Get lost even with Google Maps", "emoji": "\uD83D\uDDFA\uFE0F"},
        {"text": "Eat the last slice of pizza without asking", "emoji": "\uD83C\uDF55"},
        {"text": "Plan a surprise trip", "emoji": "\u2708\uFE0F"},
        {"text": "Talk to strangers like old friends", "emoji": "\uD83D\uDDE3\uFE0F"},
        {"text": "Take 100 selfies before picking one", "emoji": "\uD83E\uDD33"},
        {"text": "Be the strict parent", "emoji": "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67"},
        {"text": "Still be the fun one at 60", "emoji": "\uD83C\uDF89"}
      ]
    }'::jsonb
  );

  -- Stage 4: quiz (all 27 questions)
  INSERT INTO stages (id, experience_id, stage_type, sort_order, is_enabled, config)
  VALUES (gen_random_uuid(), v_experience_id, 'quiz', 4, true,
    '{
      "questions": [
        {
          "id": "travel-1",
          "question": "Dream honeymoon destination?",
          "options": ["Maldives", "Switzerland", "Phook ke poori duniya ghum lenge room se"],
          "category": "\uD83D\uDDFA\uFE0F Travel"
        },
        {
          "id": "travel-2",
          "question": "Which place did you both visit together for the FIRST time?",
          "options": ["Her place", "His place(rooftop/umbrella muah muah)", "Tapri"],
          "category": "\uD83D\uDDFA\uFE0F Travel"
        },
        {
          "id": "travel-3",
          "question": "Who''s the better navigator on road trips?",
          "options": ["Manoj (obviously)", "Pooja (Manoj can''t read maps)", "Google Maps (neither trusts the other)"],
          "category": "\uD83D\uDDFA\uFE0F Travel"
        },
        {
          "id": "travel-4",
          "question": "If you could teleport anywhere RIGHT NOW for a weekend?",
          "options": ["Beach (Goa/Maldives vibes)", "Mountains (Manali/Shimla vibes)", "City escape (Dubai/Singapore vibes)"],
          "category": "\uD83D\uDDFA\uFE0F Travel"
        },
        {
          "id": "travel-5",
          "question": "Your ideal travel style as a couple?",
          "options": ["Plan every detail, itinerary locked", "Book flights, figure out the rest there", "Wherever the cheapest deal takes us"],
          "category": "\uD83D\uDDFA\uFE0F Travel"
        },
        {
          "id": "food-1",
          "question": "Your partner''s comfort food?",
          "options": ["Biryani", "Jo Pooja banade", "Gabbar will decide"],
          "category": "\uD83C\uDF55 Food"
        },
        {
          "id": "food-2",
          "question": "Who''s the better cook between you two?",
          "options": ["Manoj (secret chef)", "Pooja (no contest)", "Zomato (let''s be honest)"],
          "category": "\uD83C\uDF55 Food"
        },
        {
          "id": "food-3",
          "question": "What do you ALWAYS order when eating out?",
          "options": ["Assamese food", "Biryani", "Whatever partner orders (plays safe)"],
          "category": "\uD83C\uDF55 Food"
        },
        {
          "id": "food-4",
          "question": "First meal you''ll cook together after the wedding?",
          "options": ["Maggi at midnight (classic)", "A proper home-cooked dal-rice", "We''re ordering in, who are we kidding"],
          "category": "\uD83C\uDF55 Food"
        },
        {
          "id": "food-5",
          "question": "Your go-to late night craving?",
          "options": ["Ice cream from the fridge", "Chai biscoot", "Costa hai na! Sorted XD"],
          "category": "\uD83C\uDF55 Food"
        },
        {
          "id": "blr-1",
          "question": "What''s your go-to date spot in Bengaluru?",
          "options": ["Some local food joint", "Indiranagar/Koramangala caf\u00E9", "A special restaurant"],
          "category": "\uD83C\uDFD9\uFE0F Bengaluru"
        },
        {
          "id": "blr-2",
          "question": "Which Bengaluru spot holds a special memory for you both?",
          "options": ["Some fine dining", "Rooftop(coz admin knows everything lol)", "That one caf\u00E9 where it all started"],
          "category": "\uD83C\uDFD9\uFE0F Bengaluru"
        },
        {
          "id": "blr-3",
          "question": "Most spontaneous thing you''ve done together in Bengaluru?",
          "options": ["Late night drive to airport road", "Showed up at a random event/concert", "Tried new cuisine at 1 AM"],
          "category": "\uD83C\uDFD9\uFE0F Bengaluru"
        },
        {
          "id": "blr-4",
          "question": "If you had one last evening in Bengaluru together, where?",
          "options": ["Rooftop restaurant with a view", "Long drive on Nice Road", "Back to \"our spot\" one last time"],
          "category": "\uD83C\uDFD9\uFE0F Bengaluru"
        },
        {
          "id": "fun-1",
          "question": "Manoj''s most annoying habit?",
          "options": ["Always on their laptop(fuck you AmEx)", "Being late to everything", "Forgetting important dates"],
          "category": "\uD83D\uDE02 Fun"
        },
        {
          "id": "fun-2",
          "question": "What do YOU think Pooja worst habit is?",
          "options": ["Taking too long to get ready", "Overthinking everything", "Saying ''I''m fine'' when not fine"],
          "category": "\uD83D\uDE02 Fun"
        },
        {
          "id": "fun-3",
          "question": "Who said ''I love you'' first?",
          "options": ["Manoj (smooth operator)", "Pooja (someone had to)", "Neither \u2014 it was just understood"],
          "category": "\uD83D\uDE02 Fun"
        },
        {
          "id": "fun-4",
          "question": "Who''s more likely to cry at the wedding?",
          "options": ["Manoj (secret softie)", "Pooja", "Rona kyu hai bhai"],
          "category": "\uD83D\uDE02 Fun"
        },
        {
          "id": "fun-5",
          "question": "Longest you''ve gone without talking during a fight?",
          "options": ["A few hours (can''t stay mad)", "A full day", "2+ days (both stubborn)"],
          "category": "\uD83D\uDE02 Fun"
        },
        {
          "id": "fun-6",
          "question": "Who will be the strict parent?",
          "options": ["Manoj", "Pooja", "Both equally (tag team)"],
          "category": "\uD83D\uDE02 Fun"
        },
        {
          "id": "fun-7",
          "question": "The one thing you''ll NEVER change about your partner?",
          "options": ["Their laugh", "Their stubbornness (it''s cute, kind of)", "How they care without showing it"],
          "category": "\uD83D\uDE02 Fun"
        },
        {
          "id": "rel-1",
          "question": "Your first impression of your partner?",
          "options": ["Way out of my league", "Really smart/funny", "I need to talk to them again"],
          "category": "\uD83D\uDC95 Relationship"
        },
        {
          "id": "rel-2",
          "question": "How did the marriage topic first come up?",
          "options": ["Grand romantic gesture", "Casually dropped in conversation", "Families got involved first"],
          "category": "\uD83D\uDC95 Relationship"
        },
        {
          "id": "rel-3",
          "question": "Where do you see yourselves in 5 years?",
          "options": ["Settled with kids, proper grown-ups", "Traveling the world, no rush", "Building something big together"],
          "category": "\uD83D\uDC95 Relationship"
        },
        {
          "id": "rel-4",
          "question": "Most important thing in your marriage?",
          "options": ["Trust \u2014 everything else follows", "Laughter \u2014 never stop having fun", "Space \u2014 letting each other grow"],
          "category": "\uD83D\uDC95 Relationship"
        },
        {
          "id": "pop-3",
          "question": "Your couple song?",
          "options": ["Tum Hi Ho", "Perfect (Ed Sheeran)", "Something random only you two know"],
          "category": "\uD83C\uDFAC Random"
        },
        {
          "id": "pop-4",
          "question": "Your relationship''s best-kept secret?",
          "options": ["Secret nicknames for each other", "Already planned your entire future", "One of you is WAY more romantic than they show"],
          "category": "\uD83C\uDFAC Random"
        }
      ]
    }'::jsonb
  );

  -- Stage 5: waiting_room
  INSERT INTO stages (id, experience_id, stage_type, sort_order, is_enabled, config)
  VALUES (gen_random_uuid(), v_experience_id, 'waiting_room', 5, true, '{}'::jsonb);

  -- Stage 6: compatibility
  INSERT INTO stages (id, experience_id, stage_type, sort_order, is_enabled, config)
  VALUES (gen_random_uuid(), v_experience_id, 'compatibility', 6, true, '{}'::jsonb);

  -- Stage 7: fortune_teller
  INSERT INTO stages (id, experience_id, stage_type, sort_order, is_enabled, config)
  VALUES (gen_random_uuid(), v_experience_id, 'fortune_teller', 7, true,
    '{
      "fortunes": [
        "The first 6 months will be an adjustment period... the AC temperature will be the biggest issue. One wants 18\u00B0C, the other says 24\u00B0C. Compromise at 21\u00B0C, but both secretly change it at night. \uD83D\uDE24\u2744\uFE0F",
        "A joint account will be opened, but both will maintain a secret ''emergency fund'' for personal splurges. One''s emergency = shoes. The other''s = gadgets. The stars say \u2014 stop budgeting. \uD83D\uDECD\uFE0F",
        "An international trip is definitely happening. One will suggest Bali, the other Switzerland. Final destination? Somewhere local. Because last-minute plans always win. The stars confirm \u2014 adventures await. \uD83C\uDFD6\uFE0F",
        "Cooking duties will rotate, but food delivery apps will be the real winners. One day someone will make Maggi and act like a master chef. The other will politely eat it and secretly order pizza. \uD83C\uDF5D",
        "A small monthly disagreement is inevitable. Reason: ''You never listen.'' Duration: exactly 4.5 hours. Resolution: ''Let\u2019s eat something.'' This pattern will repeat for 50 years. \uD83D\uDC95"
      ]
    }'::jsonb
  );

  -- Stage 8: gift_reveal
  INSERT INTO stages (id, experience_id, stage_type, sort_order, is_enabled, config)
  VALUES (gen_random_uuid(), v_experience_id, 'gift_reveal', 8, true,
    '{
      "gift_type": "voucher",
      "gift_data": {
        "voucher_brand": "MakeMyTrip",
        "voucher_amount": "\u20B9 10,001",
        "voucher_code": "1001-1301-1205-8190",
        "voucher_subtitle": "Gift Voucher",
        "reveal_text": "A Gift For The Couple",
        "message_from": "With love, from the boys \u2764\uFE0F"
      }
    }'::jsonb
  );

  -- -----------------------------------------------------------------------
  -- 5. Insert participants
  -- -----------------------------------------------------------------------
  INSERT INTO participants (id, experience_id, role, display_name, phone, quiz_answers, swipe_answers, quiz_completed)
  VALUES
    (gen_random_uuid(), v_experience_id, 'a', 'Manoj', '8825607563', '{}'::jsonb, '{}'::jsonb, false),
    (gen_random_uuid(), v_experience_id, 'b', 'Pooja', '8448522614', '{}'::jsonb, '{}'::jsonb, false);

  RAISE NOTICE 'Seed complete! Experience ID: %', v_experience_id;

END $$;
