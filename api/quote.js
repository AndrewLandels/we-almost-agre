/**
 * Vercel Node function for GET /api/quote.
 *
 * Production was returning FUNCTION_INVOCATION_FAILED because `api/quote.ts`
 * used a Node (req, res) default export and imported `src/*.ts`. Vercel loads
 * `/api` as ESM and documents Web Handlers for non-Next apps; Node cannot
 * resolve extensionless TypeScript imports at runtime.
 *
 * This file is self-contained ESM with the Web Handler shape Vercel expects.
 */
import { handleQuoteRequest } from './quote-core.js'

export const config = {
  runtime: 'nodejs',
  maxDuration: 15,
}

export function GET(request) {
  return handleQuoteRequest(request)
}

export default {
  fetch: handleQuoteRequest,
}
