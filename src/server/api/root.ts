// src/server/api/root.ts
import { postRouter } from "~/server/api/routers/post";
import { careerRouter } from "~/server/api/routers/career";
import { positionRouter } from "./routers/position";
import { organizationRouter } from "./routers/organization";
import { userRouter } from "./routers/user";
import { competenceRouter } from "./routers/competence";
import { careerPlanRouter } from "./routers/careerplan";
import { learningRouter } from "./routers/learning";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  career: careerRouter,
  position: positionRouter,
  organization: organizationRouter,
  user: userRouter,
  competence: competenceRouter,
  careerPlan: careerPlanRouter,
  learning: learningRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);