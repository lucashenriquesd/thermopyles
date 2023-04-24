import { test, expect } from 'vitest'
import { fetch } from 'undici'

test('GET / is returning app name', async () => {
  const protocol = 'http'
  const host = 'localhost'
  const port = 3000
  const res = await fetch(`${protocol}://${host}:${port}/`)
  const body = await res.text()
  expect(body).toBe('thermopyles')
})