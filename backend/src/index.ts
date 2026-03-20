import { createApplication } from "@specific-dev/framework";
import * as schema from './db/schema/schema.js';
import * as gameRoutes from './routes/game.js';
import { seedGameQuestions } from './db/seed.js';

// Create application with schema for full database type support
export const app = await createApplication(schema);

// Export App type for use in route files
export type App = typeof app;

// Seed game questions if the table is empty
const existingQuestions = await app.db.select().from(schema.gameQuestions).limit(1);
if (existingQuestions.length === 0) {
  await seedGameQuestions(app);
}

// Register routes
gameRoutes.register(app, app.fastify);

await app.run();
app.logger.info('Application running');
