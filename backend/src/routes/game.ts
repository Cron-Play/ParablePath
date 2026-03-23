import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, sql } from 'drizzle-orm';
import * as schema from '../db/schema/schema.js';
import type { App } from '../index.js';

interface GetQuestionsQuery {
  category: 'scramble' | 'fill_in_blank' | 'books_blitz';
  difficulty?: 'easy' | 'medium' | 'hard';
  limit?: number;
}

interface GetScoresQuery {
  game_mode?: 'scramble' | 'fill_in_blank' | 'books_blitz';
  limit?: number;
}

interface CreateScoreBody {
  player_name: string;
  game_mode: 'scramble' | 'fill_in_blank' | 'books_blitz';
  score: number;
  correct_answers: number;
  total_questions: number;
  time_taken_seconds: number;
}

export function register(app: App, fastify: FastifyInstance) {
  fastify.get('/api/questions', {
    schema: {
      description: 'Fetch questions filtered by category and optional difficulty',
      tags: ['game'],
      querystring: {
        type: 'object',
        required: ['category'],
        properties: {
          category: {
            type: 'string',
            enum: ['scramble', 'fill_in_blank', 'books_blitz'],
            description: 'Game category',
          },
          difficulty: {
            type: 'string',
            enum: ['easy', 'medium', 'hard'],
            description: 'Optional difficulty level',
          },
          limit: {
            type: 'integer',
            default: 10,
            maximum: 50,
            description: 'Maximum number of questions to return (default 10, max 50)',
          },
        },
      },
      response: {
        200: {
          description: 'Questions retrieved successfully',
          type: 'object',
          properties: {
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  category: { type: 'string' },
                  question: { type: 'string' },
                  answer: { type: 'string' },
                  hint: { type: 'string', nullable: true },
                  difficulty: { type: 'string' },
                  points: { type: 'integer' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        400: {
          description: 'Bad request',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Querystring: GetQuestionsQuery }>, reply: FastifyReply) => {
    const { category, difficulty = 'medium', limit = 10 } = request.query;
    const finalLimit = Math.min(limit, 50);

    app.logger.info({ category, difficulty, limit: finalLimit }, 'Fetching questions');

    try {
      const conditions = [eq(schema.gameQuestions.category, category), eq(schema.gameQuestions.difficulty, difficulty)];

      const questions = await app.db
        .select()
        .from(schema.gameQuestions)
        .where(and(...conditions))
        .orderBy(sql`RANDOM()`)
        .limit(finalLimit);

      app.logger.info({ count: questions.length }, 'Questions retrieved successfully');

      return { questions };
    } catch (error) {
      app.logger.error({ err: error, category, difficulty }, 'Failed to fetch questions');
      throw error;
    }
  });

  fastify.get('/api/scores', {
    schema: {
      description: 'Fetch scores ordered by score DESC, then created_at ASC',
      tags: ['game'],
      querystring: {
        type: 'object',
        properties: {
          game_mode: {
            type: 'string',
            enum: ['scramble', 'fill_in_blank', 'books_blitz'],
            description: 'Optional game mode filter',
          },
          limit: {
            type: 'integer',
            default: 20,
            description: 'Maximum number of scores to return',
          },
        },
      },
      response: {
        200: {
          description: 'Scores retrieved successfully',
          type: 'object',
          properties: {
            scores: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  playerName: { type: 'string' },
                  gameMode: { type: 'string' },
                  score: { type: 'integer' },
                  correctAnswers: { type: 'integer' },
                  totalQuestions: { type: 'integer' },
                  timeTakenSeconds: { type: 'integer' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        400: {
          description: 'Bad request',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Querystring: GetScoresQuery }>, reply: FastifyReply) => {
    const { game_mode, limit = 20 } = request.query;

    app.logger.info({ game_mode, limit }, 'Fetching scores');

    try {
      let query: any = app.db
        .select()
        .from(schema.gameScores);

      if (game_mode) {
        query = query.where(eq(schema.gameScores.gameMode, game_mode));
      }

      const scores = await query
        .orderBy(schema.gameScores.score)
        .orderBy(schema.gameScores.createdAt)
        .limit(limit);

      app.logger.info({ count: scores.length }, 'Scores retrieved successfully');

      return { scores };
    } catch (error) {
      app.logger.error({ err: error, game_mode }, 'Failed to fetch scores');
      throw error;
    }
  });

  fastify.post('/api/scores', {
    schema: {
      description: 'Create a new game score',
      tags: ['game'],
      body: {
        type: 'object',
        required: ['player_name', 'game_mode', 'score', 'correct_answers', 'total_questions', 'time_taken_seconds'],
        properties: {
          player_name: { type: 'string', description: 'Player name' },
          game_mode: {
            type: 'string',
            enum: ['scramble', 'fill_in_blank', 'books_blitz'],
            description: 'Game mode',
          },
          score: { type: 'integer', description: 'Score points' },
          correct_answers: { type: 'integer', description: 'Number of correct answers' },
          total_questions: { type: 'integer', description: 'Total number of questions' },
          time_taken_seconds: { type: 'integer', description: 'Time taken in seconds' },
        },
      },
      response: {
        201: {
          description: 'Score created successfully',
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            playerName: { type: 'string' },
            gameMode: { type: 'string' },
            score: { type: 'integer' },
            correctAnswers: { type: 'integer' },
            totalQuestions: { type: 'integer' },
            timeTakenSeconds: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        400: {
          description: 'Bad request',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: CreateScoreBody }>, reply: FastifyReply) => {
    const { player_name, game_mode, score, correct_answers, total_questions, time_taken_seconds } = request.body;

    app.logger.info({ player_name, game_mode, score }, 'Creating new score');

    try {
      const result = await app.db
        .insert(schema.gameScores)
        .values({
          playerName: player_name,
          gameMode: game_mode,
          score,
          correctAnswers: correct_answers,
          totalQuestions: total_questions,
          timeTakenSeconds: time_taken_seconds,
        })
        .returning();

      const createdScore = result[0];
      app.logger.info({ scoreId: createdScore.id }, 'Score created successfully');

      return reply.status(201).send(createdScore);
    } catch (error) {
      app.logger.error({ err: error, player_name, game_mode }, 'Failed to create score');
      throw error;
    }
  });
}
