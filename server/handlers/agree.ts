import { handleAgreeRequest } from '../agree/http'
import { proxyAgree, resolveRepo } from '../agree/runtime'

async function handle(request: Request): Promise<Response> {
  const repo = await resolveRepo()
  if (repo) return handleAgreeRequest(request, repo)
  return proxyAgree(request)
}

export function GET(request: Request): Promise<Response> {
  return handle(request)
}

export function POST(request: Request): Promise<Response> {
  return handle(request)
}

export default {
  fetch(request: Request): Promise<Response> {
    return handle(request)
  },
}
