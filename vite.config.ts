import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { polymarketApiPlugin } from './vite.polymarket-plugin'
import { quoteApiPlugin } from './vite.quote-plugin'

export default defineConfig({
  plugins: [react(), quoteApiPlugin(), polymarketApiPlugin()],
  test: {
    environment: 'node',
  },
})
