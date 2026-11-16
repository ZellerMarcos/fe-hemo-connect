import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

let server
let App

before(async () => {
  process.env.VITE_API_URL = ''
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  App = (await server.ssrLoadModule('/src/App.tsx')).default
})

after(async () => {
  if (server) await server.close()
})

function renderEntry(entry) {
  return renderToString(createElement(MemoryRouter, { initialEntries: [entry] }, createElement(App)))
}

test('email acceptance is present on the first render without navigation or session restoration', () => {
  for (const path of ['/confirm-email', '/index.html', '/reset-password', '/']) {
    const markup = renderEntry(`${path}?email_change_token=public-email-token`)
    assert.match(markup, /id="confirm-email-title"/, path)
    assert.match(markup, /<button[^>]*>Confirmo a solicita/, path)
    assert.doesNotMatch(markup, /<input/, path)
  }
})

test('legacy email links still render their acceptance directly', () => {
  const markup = renderEntry('/confirm-email?token=legacy-email-token')
  assert.match(markup, /id="confirm-email-title"/)
  assert.match(markup, /<button[^>]*>Confirmo a solicita/)
})

test('missing or empty email tokens show an error instead of a blank page or password fallback', () => {
  for (const entry of ['/confirm-email', '/index.html?email_change_token=&token=password-token']) {
    const markup = renderEntry(entry)
    assert.match(markup, /id="confirm-email-title"/, entry)
    assert.match(markup, /role="alert"/, entry)
    assert.doesNotMatch(markup, /<button[^>]*>Confirmo a solicita/, entry)
    assert.doesNotMatch(markup, /<input/, entry)
  }
})

test('API configuration errors reject confirmation instead of crashing page initialization', async () => {
  const { confirmarTrocaEmail } = await server.ssrLoadModule('/src/services/auth.ts')
  await assert.rejects(confirmarTrocaEmail('public-email-token'), /VITE_API_URL/)
})
