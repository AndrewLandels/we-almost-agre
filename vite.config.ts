import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { quoteApiPlugin } from './vite.quote-plugin'

export default defineConfig({
  plugins: [react(), quoteApiPlugin()],
  test: {
    environment: 'node',
  },
})
