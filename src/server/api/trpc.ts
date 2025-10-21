import { initTRPC } from '@trpc/server';
import { ZodError } from 'zod';
import superjson from 'superjson';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Logging middleware for request monitoring
 * Logs all incoming requests with timing information
 */
const loggingMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  console.log(`[tRPC] ${type} ${path} - Start`);
  
  const result = await next();
  
  const durationMs = Date.now() - start;
  const status = result.ok ? 'OK' : 'ERROR';
  console.log(`[tRPC] ${type} ${path} - ${status} (${durationMs}ms)`);
  
  return result;
});

/**
 * Input sanitization middleware
 * Trims string inputs to prevent whitespace-only submissions
 */
const sanitizeInputMiddleware = t.middleware(async ({ input, next }) => {
  // Sanitize string inputs recursively
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.trim();
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, sanitize(value)])
      );
    }
    return obj;
  };

  const sanitizedInput = input ? sanitize(input) : input;
  
  return next({
    input: sanitizedInput,
  });
});

/**
 * Public procedure with middleware chain
 * All public procedures use logging and sanitization
 */
export const publicProcedure = t.procedure
  .use(loggingMiddleware)
  .use(sanitizeInputMiddleware);

/**
 * Export reusable router helper
 */
export const createTRPCRouter = t.router;
