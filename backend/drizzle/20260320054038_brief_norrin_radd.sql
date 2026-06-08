CREATE TABLE "game_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"hint" text,
	"difficulty" text NOT NULL,
	"points" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "category_check" CHECK (category IN ('scramble', 'fill_in_blank', 'books_blitz')),
	CONSTRAINT "difficulty_check" CHECK (difficulty IN ('easy', 'medium', 'hard'))
);
--> statement-breakpoint
CREATE TABLE "game_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_name" text NOT NULL,
	"game_mode" text NOT NULL,
	"score" integer NOT NULL,
	"correct_answers" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"time_taken_seconds" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "game_mode_check" CHECK (game_mode IN ('scramble', 'fill_in_blank', 'books_blitz'))
);
