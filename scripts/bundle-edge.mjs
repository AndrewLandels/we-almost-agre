import * as esbuild from 'esbuild'

/** Deno bundle for the Supabase edge function `agree`. Deploy with verify_jwt off. */
await esbuild.build({
  entryPoints: ['server/agree/edgeEntry.ts'],
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  outfile: process.argv[2] || 'supabase/functions/agree/index.ts',
  logLevel: 'info',
})
