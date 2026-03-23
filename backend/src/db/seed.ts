import type { App } from '../index.js';
import { eq } from 'drizzle-orm';
import * as schema from './schema/schema.js';

export async function seedGameQuestions(app: App) {
  // Check if scramble questions exist
  const scrambleExists = await app.db
    .select()
    .from(schema.gameQuestions)
    .where(eq(schema.gameQuestions.category, 'scramble'))
    .limit(1);

  if (scrambleExists.length === 0) {
    const scrambleQuestions = [
      // SCRAMBLE — Easy (points: 10)
      { category: 'scramble', question: 'EOLV', answer: 'love', hint: 'Greatest commandment theme', difficulty: 'easy', points: 10 },
      { category: 'scramble', question: 'HTIFA', answer: 'faith', hint: 'Substance of things hoped for', difficulty: 'easy', points: 10 },
      { category: 'scramble', question: 'ECGRA', answer: 'grace', hint: 'Unmerited favor', difficulty: 'easy', points: 10 },
      { category: 'scramble', question: 'CEPAE', answer: 'peace', hint: 'Passes all understanding', difficulty: 'easy', points: 10 },
      { category: 'scramble', question: 'YOLRG', answer: 'glory', hint: 'God\'s splendor', difficulty: 'easy', points: 10 },
      { category: 'scramble', question: 'YRPAE', answer: 'prayer', hint: 'Talking to God', difficulty: 'easy', points: 10 },
      { category: 'scramble', question: 'IBLEB', answer: 'bible', hint: 'Holy scriptures', difficulty: 'easy', points: 10 },
      { category: 'scramble', question: 'SSEBLDE', answer: 'blessed', hint: 'Beatitudes word', difficulty: 'easy', points: 10 },
      { category: 'scramble', question: 'TIHGL', answer: 'light', hint: 'God is this', difficulty: 'easy', points: 10 },
      { category: 'scramble', question: 'TUHTR', answer: 'truth', hint: 'Sets you free', difficulty: 'easy', points: 10 },
      { category: 'scramble', question: 'YPOJ', answer: 'joy', hint: 'Fruit of the Spirit', difficulty: 'easy', points: 10 },
      { category: 'scramble', question: 'PHOEE', answer: 'hope', hint: 'Anchor of the soul', difficulty: 'easy', points: 10 },

      // SCRAMBLE — Medium (points: 20)
      { category: 'scramble', question: 'IOTSANVLA', answer: 'salvation', hint: 'Deliverance from sin', difficulty: 'medium', points: 20 },
      { category: 'scramble', question: 'SIWDMO', answer: 'wisdom', hint: 'Fear of the Lord is its beginning', difficulty: 'medium', points: 20 },
      { category: 'scramble', question: 'EOTNPRE', answer: 'repent', hint: 'Turn away from sin', difficulty: 'medium', points: 20 },
      { category: 'scramble', question: 'SSEBLIGN', answer: 'blessing', hint: 'Divine favor', difficulty: 'medium', points: 20 },
      { category: 'scramble', question: 'TNECOVNA', answer: 'covenant', hint: 'Sacred agreement with God', difficulty: 'medium', points: 20 },
      { category: 'scramble', question: 'IOTNPEMRED', answer: 'redemption', hint: 'Bought back from sin', difficulty: 'medium', points: 20 },
      { category: 'scramble', question: 'IOTNRSERUCT', answer: 'resurrection', hint: 'Rising from the dead', difficulty: 'medium', points: 20 },
      { category: 'scramble', question: 'IOTNPMET', answer: 'temptation', hint: 'Jesus faced this in the desert', difficulty: 'medium', points: 20 },
      { category: 'scramble', question: 'IOTNPICFNOS', answer: 'confession', hint: 'Admitting sins', difficulty: 'medium', points: 20 },
      { category: 'scramble', question: 'IOTNPICFIAS', answer: 'sacrifice', hint: 'Offering to God', difficulty: 'medium', points: 20 },
      { category: 'scramble', question: 'IOTNPICFIAR', answer: 'rapture', hint: 'Catching away of believers', difficulty: 'medium', points: 20 },
      { category: 'scramble', question: 'IOTNPICFIAN', answer: 'sanctify', hint: 'Set apart for God', difficulty: 'medium', points: 20 },

      // SCRAMBLE — Hard (points: 30)
      { category: 'scramble', question: 'IOTNPICFIATN', answer: 'justification', hint: 'Declared righteous before God', difficulty: 'hard', points: 30 },
      { category: 'scramble', question: 'IOTNPICFIATNOS', answer: 'sanctification', hint: 'Process of becoming holy', difficulty: 'hard', points: 30 },
      { category: 'scramble', question: 'IOTNPICFIATNO', answer: 'reconciliation', hint: 'Restored relationship with God', difficulty: 'hard', points: 30 },
      { category: 'scramble', question: 'IOTNPICFIATNOSR', answer: 'predestination', hint: 'Foreordained by God', difficulty: 'hard', points: 30 },
      { category: 'scramble', question: 'IOTNPICFIATNOSP', answer: 'propitiation', hint: 'Appeasement of God\'s wrath', difficulty: 'hard', points: 30 },
      { category: 'scramble', question: 'IOTNPICFIATNOSC', answer: 'circumcision', hint: 'Sign of the Abrahamic covenant', difficulty: 'hard', points: 30 },
      { category: 'scramble', question: 'IOTNPICFIATNOSA', answer: 'abomination', hint: 'Detestable to God', difficulty: 'hard', points: 30 },
      { category: 'scramble', question: 'IOTNPICFIATNOSB', answer: 'tribulation', hint: 'Period of great suffering', difficulty: 'hard', points: 30 },
      { category: 'scramble', question: 'IOTNPICFIATNOSD', answer: 'dispensation', hint: 'Period of God\'s administration', difficulty: 'hard', points: 30 },
      { category: 'scramble', question: 'IOTNPICFIATNOSM', answer: 'millennium', hint: 'Thousand-year reign of Christ', difficulty: 'hard', points: 30 },
    ];

    app.logger.info({ count: scrambleQuestions.length }, 'Seeding scramble questions');
    await app.db.insert(schema.gameQuestions).values(scrambleQuestions);
    app.logger.info({ count: scrambleQuestions.length }, 'Scramble questions seeded successfully');
  }

  // Check if fill_in_blank questions exist
  const fillInBlankExists = await app.db
    .select()
    .from(schema.gameQuestions)
    .where(eq(schema.gameQuestions.category, 'fill_in_blank'))
    .limit(1);

  if (fillInBlankExists.length === 0) {
    const fillInBlankQuestions = [
      // FILL_IN_BLANK — Easy (points: 10)
      { category: 'fill_in_blank', question: 'For God so ___ the world that he gave his only Son', answer: 'loved', hint: 'John 3:16', difficulty: 'easy', points: 10 },
      { category: 'fill_in_blank', question: 'The Lord is my ___, I shall not want', answer: 'shepherd', hint: 'Psalm 23:1', difficulty: 'easy', points: 10 },
      { category: 'fill_in_blank', question: 'In the beginning God created the ___ and the earth', answer: 'heavens', hint: 'Genesis 1:1', difficulty: 'easy', points: 10 },
      { category: 'fill_in_blank', question: 'Jesus wept. This is the ___ verse in the Bible', answer: 'shortest', hint: 'John 11:35', difficulty: 'easy', points: 10 },
      { category: 'fill_in_blank', question: 'I can do all things through ___ who strengthens me', answer: 'Christ', hint: 'Philippians 4:13', difficulty: 'easy', points: 10 },
      { category: 'fill_in_blank', question: 'The ___ of the Lord is the beginning of wisdom', answer: 'fear', hint: 'Proverbs 9:10', difficulty: 'easy', points: 10 },
      { category: 'fill_in_blank', question: 'Be still and know that I am ___', answer: 'God', hint: 'Psalm 46:10', difficulty: 'easy', points: 10 },
      { category: 'fill_in_blank', question: 'Trust in the Lord with all your ___', answer: 'heart', hint: 'Proverbs 3:5', difficulty: 'easy', points: 10 },
      { category: 'fill_in_blank', question: 'The Lord is my light and my ___', answer: 'salvation', hint: 'Psalm 27:1', difficulty: 'easy', points: 10 },
      { category: 'fill_in_blank', question: 'Your word is a ___ to my feet', answer: 'lamp', hint: 'Psalm 119:105', difficulty: 'easy', points: 10 },
      { category: 'fill_in_blank', question: 'Ask and it will be given to you; ___ and you will find', answer: 'seek', hint: 'Matthew 7:7', difficulty: 'easy', points: 10 },
      { category: 'fill_in_blank', question: 'Love your ___ as yourself', answer: 'neighbor', hint: 'Mark 12:31', difficulty: 'easy', points: 10 },

      // FILL_IN_BLANK — Medium (points: 20)
      { category: 'fill_in_blank', question: 'Do not be ___ to this world but be transformed by the renewing of your mind', answer: 'conformed', hint: 'Romans 12:2', difficulty: 'medium', points: 20 },
      { category: 'fill_in_blank', question: 'For the wages of sin is ___, but the gift of God is eternal life', answer: 'death', hint: 'Romans 6:23', difficulty: 'medium', points: 20 },
      { category: 'fill_in_blank', question: 'I am the way and the truth and the ___', answer: 'life', hint: 'John 14:6', difficulty: 'medium', points: 20 },
      { category: 'fill_in_blank', question: 'For all have sinned and fall short of the ___ of God', answer: 'glory', hint: 'Romans 3:23', difficulty: 'medium', points: 20 },
      { category: 'fill_in_blank', question: 'The fruit of the Spirit is love, joy, ___, patience', answer: 'peace', hint: 'Galatians 5:22', difficulty: 'medium', points: 20 },
      { category: 'fill_in_blank', question: 'Do not ___ for tomorrow will worry about itself', answer: 'worry', hint: 'Matthew 6:34', difficulty: 'medium', points: 20 },
      { category: 'fill_in_blank', question: 'Blessed are the ___ in spirit for theirs is the kingdom of heaven', answer: 'poor', hint: 'Matthew 5:3', difficulty: 'medium', points: 20 },
      { category: 'fill_in_blank', question: 'For it is by ___ you have been saved through faith', answer: 'grace', hint: 'Ephesians 2:8', difficulty: 'medium', points: 20 },
      { category: 'fill_in_blank', question: 'The Lord is close to the ___ in heart', answer: 'brokenhearted', hint: 'Psalm 34:18', difficulty: 'medium', points: 20 },
      { category: 'fill_in_blank', question: 'No one can serve two ___; either he will hate the one and love the other', answer: 'masters', hint: 'Matthew 6:24', difficulty: 'medium', points: 20 },
      { category: 'fill_in_blank', question: 'Be ___ and courageous. Do not be afraid', answer: 'strong', hint: 'Joshua 1:9', difficulty: 'medium', points: 20 },
      { category: 'fill_in_blank', question: 'Cast all your ___ on him because he cares for you', answer: 'anxiety', hint: '1 Peter 5:7', difficulty: 'medium', points: 20 },

      // FILL_IN_BLANK — Hard (points: 30)
      { category: 'fill_in_blank', question: 'For I know the plans I have for you declares the Lord plans to ___ you and not to harm you', answer: 'prosper', hint: 'Jeremiah 29:11', difficulty: 'hard', points: 30 },
      { category: 'fill_in_blank', question: 'And we know that in all things God works for the ___ of those who love him', answer: 'good', hint: 'Romans 8:28', difficulty: 'hard', points: 30 },
      { category: 'fill_in_blank', question: 'Therefore if anyone is in Christ the new ___ has come the old has gone', answer: 'creation', hint: '2 Corinthians 5:17', difficulty: 'hard', points: 30 },
      { category: 'fill_in_blank', question: 'For the word of God is alive and ___ sharper than any double-edged sword', answer: 'active', hint: 'Hebrews 4:12', difficulty: 'hard', points: 30 },
      { category: 'fill_in_blank', question: 'Now faith is confidence in what we hope for and ___ about what we do not see', answer: 'assurance', hint: 'Hebrews 11:1', difficulty: 'hard', points: 30 },
      { category: 'fill_in_blank', question: 'Do not be ___ God cannot be mocked a man reaps what he sows', answer: 'deceived', hint: 'Galatians 6:7', difficulty: 'hard', points: 30 },
      { category: 'fill_in_blank', question: 'For God did not give us a spirit of ___ but of power love and self-discipline', answer: 'timidity', hint: '2 Timothy 1:7', difficulty: 'hard', points: 30 },
      { category: 'fill_in_blank', question: 'I have been ___ with Christ and I no longer live but Christ lives in me', answer: 'crucified', hint: 'Galatians 2:20', difficulty: 'hard', points: 30 },
      { category: 'fill_in_blank', question: 'And the peace of God which ___ all understanding will guard your hearts', answer: 'transcends', hint: 'Philippians 4:7', difficulty: 'hard', points: 30 },
      { category: 'fill_in_blank', question: 'Therefore put on the full ___ of God so that you can take your stand against the devil', answer: 'armor', hint: 'Ephesians 6:11', difficulty: 'hard', points: 30 },
    ];

    app.logger.info({ count: fillInBlankQuestions.length }, 'Seeding fill-in-blank questions');
    await app.db.insert(schema.gameQuestions).values(fillInBlankQuestions);
    app.logger.info({ count: fillInBlankQuestions.length }, 'Fill-in-blank questions seeded successfully');
  }

  app.logger.info('Game questions seeding complete');
}
