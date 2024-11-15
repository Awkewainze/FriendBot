import { initTRPC } from "@trpc/server";

interface Context {
	user?: {
		id: string;
		isAdmin: boolean;
		// [..]
	};
}

const t = initTRPC.context<Context>().create({});

export const router = t.router;
export const publicProcedure = t.procedure.use(async (opts) => {
	const { ctx } = opts;

	return opts.next();
});
