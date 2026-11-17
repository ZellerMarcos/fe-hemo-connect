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
  server = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
    optimizeDeps: { noDiscovery: true, include: [] },
    define: { 'import.meta.env.VITE_API_URL': 'process.env.VITE_API_URL' },
  })
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

test('API errors preserve text and expose validation fields without changing 403 or 409', async (context) => {
  process.env.VITE_API_URL = 'https://api.example.test'
  const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage')
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: { getItem: () => null },
  })
  try {
    const { request, ApiError } = await server.ssrLoadModule('/src/services/api.ts')
    const cases = [
      { status: 422, detail: 'Confira os campos informados.', message: 'Confira os campos informados.', fields: {} },
      {
        status: 422,
        detail: [
          { loc: ['body', 'new_email'], type: 'value_error', msg: 'Informe um endereço de e-mail válido.' },
          { loc: ['body', 'current_password'], type: 'missing', msg: 'Informe sua senha atual.' },
        ],
        message: 'Novo e-mail: Informe um endereço de e-mail válido.\nSenha atual: Informe sua senha atual.',
        fields: { new_email: 'Informe um endereço de e-mail válido.', current_password: 'Informe sua senha atual.' },
      },
      {
        status: 422, detail: null,
        message: 'A API rejeitou os dados. Confira os campos informados e tente novamente.', fields: {},
      },
      {
        path: '/auth/login',
        status: 422,
        detail: [
          { loc: ['body', 'email'], type: 'value_error', msg: 'Informe um endereço de e-mail válido.' },
          { loc: ['body', 'senha'], type: 'missing', msg: 'Informe sua senha.' },
        ],
        message: 'E-mail: Informe um endereço de e-mail válido.\nSenha: Informe sua senha.',
        fields: { email: 'Informe um endereço de e-mail válido.', senha: 'Informe sua senha.' },
      },
      { status: 403, detail: 'Senha atual inválida.', message: 'Senha atual inválida.', fields: {} },
      { status: 409, detail: 'Este e-mail já está em uso.', message: 'Este e-mail já está em uso.', fields: {} },
      {
        path: '/auth/login', status: 401,
        detail: 'E-mail ou senha inválidos.', message: 'E-mail ou senha inválidos.', fields: {},
      },
    ]
    for (const item of cases) {
      const fetchMock = context.mock.method(globalThis, 'fetch', async () => (
        new Response(JSON.stringify({ detail: item.detail }), {
          status: item.status,
          headers: { 'Content-Type': 'application/json' },
        })
      ))
      await assert.rejects(request(item.path ?? '/auth/email-change/request', { method: 'POST', body: '{}' }), error => {
        assert.ok(error instanceof ApiError)
        assert.equal(error.status, item.status)
        assert.equal(error.message, item.message)
        assert.deepEqual(error.fieldErrors, item.fields)
        return true
      })
      fetchMock.mock.restore()
    }
  } finally {
    process.env.VITE_API_URL = ''
    if (storageDescriptor) Object.defineProperty(globalThis, 'sessionStorage', storageDescriptor)
    else delete globalThis.sessionStorage
  }
})
