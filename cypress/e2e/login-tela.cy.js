const { setupClerkTestingToken } = require('@clerk/testing/cypress')

describe('Login pela tela', () => {
  it('entra com e-mail, senha e código de verificação e abre o dashboard', () => {
    setupClerkTestingToken() // evita o bloqueio "Bot traffic detected" ao usar o formulário

    // Escuta as chamadas do 2º fator antes de enviar a senha (é o envio que as dispara)
    cy.intercept('POST', /\/prepare_second_factor/).as('enviarCodigo')
    cy.intercept('POST', /\/attempt_second_factor/).as('verificarCodigo')

    cy.visit('/sign-in')
    cy.clerkLoaded()

    cy.task('credenciaisLoginTela', null, { log: false }).then(({ email, senha }) => {
      cy.get('[name="identifier"]').type(`${email}{enter}`, { log: false })

      // Espera a etapa da senha abrir de verdade antes de digitar
      cy.location('pathname').should('eq', '/sign-in/factor-one')
      cy.get('[name="password"]').should('be.visible').type(`${senha}{enter}`, { log: false })
    })

    // Só digita o código depois que o Clerk confirmar que o preparou
    cy.wait('@enviarCodigo').its('response.statusCode').should('eq', 200)
    cy.focused().type('424242') // código fixo do Clerk para e-mails +clerk_test
    cy.wait('@verificarCodigo').its('response.statusCode').should('eq', 200)

    cy.location('pathname', { timeout: 30000 }).should('eq', '/dashboard')
    cy.contains('h1', 'Dashboard').should('be.visible')
  })
})