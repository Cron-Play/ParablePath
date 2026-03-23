import { describe, test, expect } from "bun:test";
import { api, authenticatedApi, signUpTestUser, expectStatus, connectWebSocket, connectAuthenticatedWebSocket, waitForMessage } from "./helpers";

describe("API Integration Tests", () => {
  // GET /api/questions tests
  test("GET /api/questions with valid category (scramble)", async () => {
    const res = await api("/api/questions?category=scramble");
    await expectStatus(res, 200);
    const data = await res.json();
    expect(Array.isArray(data.questions)).toBe(true);
  });

  test("GET /api/questions with valid category (fill_in_blank)", async () => {
    const res = await api("/api/questions?category=fill_in_blank");
    await expectStatus(res, 200);
    const data = await res.json();
    expect(Array.isArray(data.questions)).toBe(true);
  });

  test("GET /api/questions with valid category (books_blitz)", async () => {
    const res = await api("/api/questions?category=books_blitz");
    await expectStatus(res, 200);
    const data = await res.json();
    expect(Array.isArray(data.questions)).toBe(true);
  });

  test("GET /api/questions with difficulty filter (easy)", async () => {
    const res = await api("/api/questions?category=scramble&difficulty=easy");
    await expectStatus(res, 200);
    const data = await res.json();
    expect(Array.isArray(data.questions)).toBe(true);
  });

  test("GET /api/questions with difficulty filter (medium)", async () => {
    const res = await api("/api/questions?category=scramble&difficulty=medium");
    await expectStatus(res, 200);
    const data = await res.json();
    expect(Array.isArray(data.questions)).toBe(true);
  });

  test("GET /api/questions with difficulty filter (hard)", async () => {
    const res = await api("/api/questions?category=scramble&difficulty=hard");
    await expectStatus(res, 200);
    const data = await res.json();
    expect(Array.isArray(data.questions)).toBe(true);
  });

  test("GET /api/questions with invalid difficulty returns 400", async () => {
    const res = await api("/api/questions?category=scramble&difficulty=invalid");
    await expectStatus(res, 400);
  });

  test("GET /api/questions with limit parameter", async () => {
    const res = await api("/api/questions?category=scramble&limit=5");
    await expectStatus(res, 200);
    const data = await res.json();
    expect(data.questions.length).toBeLessThanOrEqual(5);
  });

  test("GET /api/questions without required category parameter returns 400", async () => {
    const res = await api("/api/questions");
    await expectStatus(res, 400);
  });

  test("GET /api/questions with invalid category returns 400", async () => {
    const res = await api("/api/questions?category=invalid");
    await expectStatus(res, 400);
  });

  // GET /api/scores tests
  test("GET /api/scores retrieves scores", async () => {
    const res = await api("/api/scores");
    await expectStatus(res, 200);
    const data = await res.json();
    expect(Array.isArray(data.scores)).toBe(true);
  });

  test("GET /api/scores with game_mode filter (scramble)", async () => {
    const res = await api("/api/scores?game_mode=scramble");
    await expectStatus(res, 200);
    const data = await res.json();
    expect(Array.isArray(data.scores)).toBe(true);
  });

  test("GET /api/scores with game_mode filter (fill_in_blank)", async () => {
    const res = await api("/api/scores?game_mode=fill_in_blank");
    await expectStatus(res, 200);
    const data = await res.json();
    expect(Array.isArray(data.scores)).toBe(true);
  });

  test("GET /api/scores with game_mode filter (books_blitz)", async () => {
    const res = await api("/api/scores?game_mode=books_blitz");
    await expectStatus(res, 200);
    const data = await res.json();
    expect(Array.isArray(data.scores)).toBe(true);
  });

  test("GET /api/scores with invalid game_mode returns 400", async () => {
    const res = await api("/api/scores?game_mode=invalid_mode");
    await expectStatus(res, 400);
  });

  test("GET /api/scores with limit parameter", async () => {
    const res = await api("/api/scores?limit=5");
    await expectStatus(res, 200);
    const data = await res.json();
    expect(data.scores.length).toBeLessThanOrEqual(5);
  });

  // POST /api/scores tests
  test("POST /api/scores creates a new score with scramble mode", async () => {
    const res = await api("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_name: "TestPlayer",
        game_mode: "scramble",
        score: 100,
        correct_answers: 8,
        total_questions: 10,
        time_taken_seconds: 45,
      }),
    });
    await expectStatus(res, 201);
    const data = await res.json();
    expect(data.id).toBeDefined();
    expect(data.playerName).toBe("TestPlayer");
  });

  test("POST /api/scores creates a score with fill_in_blank mode", async () => {
    const res = await api("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_name: "TestPlayer2",
        game_mode: "fill_in_blank",
        score: 75,
        correct_answers: 6,
        total_questions: 10,
        time_taken_seconds: 60,
      }),
    });
    await expectStatus(res, 201);
    const data = await res.json();
    expect(data.id).toBeDefined();
  });

  test("POST /api/scores creates a score with books_blitz mode", async () => {
    const res = await api("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_name: "TestPlayer3",
        game_mode: "books_blitz",
        score: 150,
        correct_answers: 10,
        total_questions: 10,
        time_taken_seconds: 30,
      }),
    });
    await expectStatus(res, 201);
    const data = await res.json();
    expect(data.id).toBeDefined();
  });

  test("POST /api/scores without player_name returns 400", async () => {
    const res = await api("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        game_mode: "scramble",
        score: 100,
        correct_answers: 8,
        total_questions: 10,
        time_taken_seconds: 45,
      }),
    });
    await expectStatus(res, 400);
  });

  test("POST /api/scores without game_mode returns 400", async () => {
    const res = await api("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_name: "TestPlayer",
        score: 100,
        correct_answers: 8,
        total_questions: 10,
        time_taken_seconds: 45,
      }),
    });
    await expectStatus(res, 400);
  });

  test("POST /api/scores with invalid game_mode enum returns 400", async () => {
    const res = await api("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_name: "TestPlayer",
        game_mode: "invalid_mode",
        score: 100,
        correct_answers: 8,
        total_questions: 10,
        time_taken_seconds: 45,
      }),
    });
    await expectStatus(res, 400);
  });

  test("POST /api/scores without score returns 400", async () => {
    const res = await api("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_name: "TestPlayer",
        game_mode: "scramble",
        correct_answers: 8,
        total_questions: 10,
        time_taken_seconds: 45,
      }),
    });
    await expectStatus(res, 400);
  });

  test("POST /api/scores without correct_answers returns 400", async () => {
    const res = await api("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_name: "TestPlayer",
        game_mode: "scramble",
        score: 100,
        total_questions: 10,
        time_taken_seconds: 45,
      }),
    });
    await expectStatus(res, 400);
  });

  test("POST /api/scores without total_questions returns 400", async () => {
    const res = await api("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_name: "TestPlayer",
        game_mode: "scramble",
        score: 100,
        correct_answers: 8,
        time_taken_seconds: 45,
      }),
    });
    await expectStatus(res, 400);
  });

  test("POST /api/scores without time_taken_seconds returns 400", async () => {
    const res = await api("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_name: "TestPlayer",
        game_mode: "scramble",
        score: 100,
        correct_answers: 8,
        total_questions: 10,
      }),
    });
    await expectStatus(res, 400);
  });
});
