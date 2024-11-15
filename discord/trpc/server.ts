import { router } from "./trpc";

const appRouter = router({
	// greeting: publicProcedure.query(() => "hello tRPC v10!"),
});

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;
