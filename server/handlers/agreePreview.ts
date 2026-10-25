import { handlePreviewRequest } from '../agree/preview'
import { resolveRepo } from '../agree/runtime'

async function handle(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return Response.json({ error: 'Method not allowed.' }, { status: 405 })
  }
  return handlePreviewRequest(request, await resolveRepo())
}

export function GET(request: Request): Promise<Response> {
  return handle(request)
}

export default {
  fetch(request: Request): Promise<Response> {
    return handle(request)
  },
}
