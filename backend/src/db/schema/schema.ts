import { pgTable, text, timestamp, uuid, integer, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const gameQuestions = pgTable('game_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: text('category').notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  hint: text('hint'),
  difficulty: text('difficulty').notNull(),
  points: integer('points').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  check('category_check', sql`category IN ('scramble', 'fill_in_blank', 'books_blitz')`),
  check('difficulty_check', sql`difficulty IN ('easy', 'medium', 'hard')`),
]);

export const gameScores = pgTable('game_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  playerName: text('player_name').notNull(),
  gameMode: text('game_mode').notNull(),
  score: integer('score').notNull(),
  correctAnswers: integer('correct_answers').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  timeTakenSeconds: integer('time_taken_seconds').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  check('game_mode_check', sql`game_mode IN ('scramble', 'fill_in_blank', 'books_blitz')`),
]);
