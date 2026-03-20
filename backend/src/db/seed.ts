import type { App } from '../index.js';
import * as schema from './schema/schema.js';

export async function seedGameQuestions(app: App) {
  const questions = [
    // SCRAMBLE — Easy (points=10)
    { category: 'scramble', question: 'SSEJU', answer: 'JESUS', hint: 'The Son of God', difficulty: 'easy', points: 10 },
    { category: 'scramble', question: 'ODG', answer: 'GOD', hint: 'The Creator', difficulty: 'easy', points: 10 },
    { category: 'scramble', question: 'EVOL', answer: 'LOVE', hint: 'Greatest commandment', difficulty: 'easy', points: 10 },
    { category: 'scramble', question: 'HTIFA', answer: 'FAITH', hint: 'Belief without seeing', difficulty: 'easy', points: 10 },
    { category: 'scramble', question: 'ECARG', answer: 'GRACE', hint: 'Unmerited favor', difficulty: 'easy', points: 10 },
    { category: 'scramble', question: 'YARP', answer: 'PRAY', hint: 'Talking to God', difficulty: 'easy', points: 10 },
    { category: 'scramble', question: 'ELBIB', answer: 'BIBLE', hint: 'The Holy Book', difficulty: 'easy', points: 10 },
    { category: 'scramble', question: 'EPOH', answer: 'HOPE', hint: 'Confident expectation', difficulty: 'easy', points: 10 },
    { category: 'scramble', question: 'EACEP', answer: 'PEACE', hint: 'Tranquility from God', difficulty: 'easy', points: 10 },
    { category: 'scramble', question: 'YLOH', answer: 'HOLY', hint: 'Set apart for God', difficulty: 'easy', points: 10 },

    // SCRAMBLE — Medium (points=20)
    { category: 'scramble', question: 'MAHBARA', answer: 'ABRAHAM', hint: 'Father of many nations', difficulty: 'medium', points: 20 },
    { category: 'scramble', question: 'SESOM', answer: 'MOSES', hint: 'Led Israel out of Egypt', difficulty: 'medium', points: 20 },
    { category: 'scramble', question: 'IVDAD', answer: 'DAVID', hint: 'Slew Goliath', difficulty: 'medium', points: 20 },
    { category: 'scramble', question: 'HNAOJ', answer: 'JONAH', hint: 'Swallowed by a great fish', difficulty: 'medium', points: 20 },
    { category: 'scramble', question: 'NOMOSOL', answer: 'SOLOMON', hint: 'Wisest king of Israel', difficulty: 'medium', points: 20 },
    { category: 'scramble', question: 'LEGNA', answer: 'ANGEL', hint: 'Heavenly messenger', difficulty: 'medium', points: 20 },
    { category: 'scramble', question: 'LAERSI', answer: 'ISRAEL', hint: 'God\'s chosen nation', difficulty: 'medium', points: 20 },
    { category: 'scramble', question: 'SURAZAL', answer: 'LAZARUS', hint: 'Raised from the dead by Jesus', difficulty: 'medium', points: 20 },
    { category: 'scramble', question: 'SMLASP', answer: 'PSALMS', hint: 'Book of songs and prayers', difficulty: 'medium', points: 20 },
    { category: 'scramble', question: 'ERUTPAR', answer: 'RAPTURE', hint: 'The catching away of believers', difficulty: 'medium', points: 20 },

    // SCRAMBLE — Hard (points=30)
    { category: 'scramble', question: 'NOITCERRUSEР', answer: 'RESURRECTION', hint: 'Rising from the dead', difficulty: 'hard', points: 30 },
    { category: 'scramble', question: 'TSOCETNEP', answer: 'PENTECOST', hint: 'The Holy Spirit descended', difficulty: 'hard', points: 30 },
    { category: 'scramble', question: 'SNOITATNEMAL', answer: 'LAMENTATIONS', hint: 'Book of mourning by Jeremiah', difficulty: 'hard', points: 30 },
    { category: 'scramble', question: 'NOITALEVER', answer: 'REVELATION', hint: 'Last book of the Bible', difficulty: 'hard', points: 30 },
    { category: 'scramble', question: 'NOITATPMET', answer: 'TEMPTATION', hint: 'Jesus faced this in the wilderness', difficulty: 'hard', points: 30 },

    // FILL_IN_BLANK — Easy (points=10)
    { category: 'fill_in_blank', question: 'For God so loved the world that he gave his one and only ___', answer: 'SON', hint: 'John 3:16', difficulty: 'easy', points: 10 },
    { category: 'fill_in_blank', question: 'The Lord is my ___, I shall not want', answer: 'SHEPHERD', hint: 'Psalm 23:1', difficulty: 'easy', points: 10 },
    { category: 'fill_in_blank', question: 'I can do all things through ___ who strengthens me', answer: 'CHRIST', hint: 'Philippians 4:13', difficulty: 'easy', points: 10 },
    { category: 'fill_in_blank', question: 'In the beginning God created the ___ and the earth', answer: 'HEAVEN', hint: 'Genesis 1:1', difficulty: 'easy', points: 10 },
    { category: 'fill_in_blank', question: 'Love your ___ as yourself', answer: 'NEIGHBOR', hint: 'Mark 12:31', difficulty: 'easy', points: 10 },
    { category: 'fill_in_blank', question: 'The wages of sin is ___', answer: 'DEATH', hint: 'Romans 6:23', difficulty: 'easy', points: 10 },
    { category: 'fill_in_blank', question: 'Ask and it shall be ___ unto you', answer: 'GIVEN', hint: 'Matthew 7:7', difficulty: 'easy', points: 10 },
    { category: 'fill_in_blank', question: 'Be still and know that I am ___', answer: 'GOD', hint: 'Psalm 46:10', difficulty: 'easy', points: 10 },
    { category: 'fill_in_blank', question: 'The truth shall set you ___', answer: 'FREE', hint: 'John 8:32', difficulty: 'easy', points: 10 },
    { category: 'fill_in_blank', question: 'Jesus ___ is the shortest verse in the Bible', answer: 'WEPT', hint: 'John 11:35', difficulty: 'easy', points: 10 },

    // FILL_IN_BLANK — Medium (points=20)
    { category: 'fill_in_blank', question: 'I am the way, the truth, and the ___', answer: 'LIFE', hint: 'John 14:6', difficulty: 'medium', points: 20 },
    { category: 'fill_in_blank', question: 'Faith without ___ is dead', answer: 'WORKS', hint: 'James 2:26', difficulty: 'medium', points: 20 },
    { category: 'fill_in_blank', question: 'The fruit of the Spirit is love, joy, ___', answer: 'PEACE', hint: 'Galatians 5:22', difficulty: 'medium', points: 20 },
    { category: 'fill_in_blank', question: 'Blessed are the ___ in heart, for they shall see God', answer: 'PURE', hint: 'Matthew 5:8', difficulty: 'medium', points: 20 },
    { category: 'fill_in_blank', question: 'Your word is a lamp to my feet and a ___ to my path', answer: 'LIGHT', hint: 'Psalm 119:105', difficulty: 'medium', points: 20 },
    { category: 'fill_in_blank', question: 'Do not be ___ but be transformed by the renewing of your mind', answer: 'CONFORMED', hint: 'Romans 12:2', difficulty: 'medium', points: 20 },
    { category: 'fill_in_blank', question: 'Cast all your ___ on him because he cares for you', answer: 'ANXIETY', hint: '1 Peter 5:7', difficulty: 'medium', points: 20 },
    { category: 'fill_in_blank', question: 'No weapon formed against me shall ___', answer: 'PROSPER', hint: 'Isaiah 54:17', difficulty: 'medium', points: 20 },
    { category: 'fill_in_blank', question: 'Trust in the Lord with all your heart and lean not on your own ___', answer: 'UNDERSTANDING', hint: 'Proverbs 3:5', difficulty: 'medium', points: 20 },
    { category: 'fill_in_blank', question: 'For I know the plans I have for you, declares the Lord, plans to ___ and not to harm you', answer: 'PROSPER', hint: 'Jeremiah 29:11', difficulty: 'medium', points: 20 },

    // FILL_IN_BLANK — Hard (points=30)
    { category: 'fill_in_blank', question: 'And we know that in all things God works for the good of those who love him, who have been called according to his ___', answer: 'PURPOSE', hint: 'Romans 8:28', difficulty: 'hard', points: 30 },
    { category: 'fill_in_blank', question: 'Therefore, if anyone is in Christ, the new ___ has come', answer: 'CREATION', hint: '2 Corinthians 5:17', difficulty: 'hard', points: 30 },
    { category: 'fill_in_blank', question: 'Do not be anxious about anything, but in every situation, by prayer and ___, with thanksgiving, present your requests to God', answer: 'PETITION', hint: 'Philippians 4:6', difficulty: 'hard', points: 30 },
    { category: 'fill_in_blank', question: 'For it is by grace you have been saved, through faith—and this is not from yourselves, it is the ___ of God', answer: 'GIFT', hint: 'Ephesians 2:8', difficulty: 'hard', points: 30 },
    { category: 'fill_in_blank', question: 'But those who hope in the Lord will renew their strength. They will soar on wings like ___', answer: 'EAGLES', hint: 'Isaiah 40:31', difficulty: 'hard', points: 30 },
  ];

  app.logger.info({ count: questions.length }, 'Starting to seed game questions');

  try {
    await app.db.insert(schema.gameQuestions).values(questions);
    app.logger.info({ count: questions.length }, 'Game questions seeded successfully');
  } catch (error) {
    app.logger.error({ err: error }, 'Error seeding game questions');
    throw error;
  }
}
