const { defineConfig } = require('cypress')
const { clerkSetup } = require('@clerk/testing/cypress')

module.exports = defineConfig({
  video: false, // vídeos mostram telas e dados do app privado

  // allowCypressEnv fica no padrão (ligado): o @clerk/testing 2.x lê Cypress.env('CLERK_FAPI')
  // e falha com ele desligado. Por isso: nunca colocar chaves em Cypress.env() ou cypress.env.json.

  e2e: {
    baseUrl: process.env.APP_BASE_URL,
    defaultCommandTimeout: 15000, // o Next em modo dev compila cada página na 1ª visita
    pageLoadTimeout: 60000,

    setupNodeEvents(on, config) {
      const env = process.env

      // Travas de ambiente: param a suíte antes de qualquer teste se algo não for DEV
      if (!env.CLERK_PUBLISHABLE_KEY?.startsWith('pk_test_')) {
        throw new Error('CLERK_PUBLISHABLE_KEY deve ser de DEV (pk_test_).')
      }
      if (!env.CLERK_SECRET_KEY?.startsWith('sk_test_')) {
        throw new Error('CLERK_SECRET_KEY deve ser de DEV (sk_test_).')
      }
      if (!env.TEST_USER_ID?.startsWith('user_')) {
        throw new Error('TEST_USER_ID deve começar com user_.')
      }
      if (!env.APP_BASE_URL || new URL(env.APP_BASE_URL).hostname !== 'localhost') {
        throw new Error('APP_BASE_URL deve apontar para localhost.')
      }

      on('task', {
        // Cria um sign-in token no Node, onde a chave secreta pode ficar (login sem a tela)
        async criarSignInToken() {
          const resposta = await fetch('https://api.clerk.com/v1/sign_in_tokens', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${env.CLERK_SECRET_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: env.TEST_USER_ID, expires_in_seconds: 60 }),
          })
          if (!resposta.ok) {
            throw new Error(`Clerk recusou o sign-in token: HTTP ${resposta.status}`)
          }
          const corpo = await resposta.json()
          return corpo.token
        },

        // Credenciais do login pela tela, lidas do .env no Node
        credenciaisLoginTela() {
          if (!env.TEST_USER_EMAIL?.includes('+clerk_test')) {
            throw new Error('TEST_USER_EMAIL deve ser um e-mail de teste do Clerk (+clerk_test).')
          }
          if (!env.TEST_USER_PASSWORD) {
            throw new Error('TEST_USER_PASSWORD não definida no .env.')
          }
          return { email: env.TEST_USER_EMAIL, senha: env.TEST_USER_PASSWORD }
        },
      })

      return clerkSetup({ config }) // busca o Testing Token; precisa ser retornado
    },
  },
})