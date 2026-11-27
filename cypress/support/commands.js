// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Login sem a tela, com ticket. Usado pelos dois comandos abaixo.
const loginComTicket = () => {
  cy.visit('/sign-in') // página pública que carrega o Clerk
  cy.task('criarSignInToken', null, { log: false }).then((ticket) => {
    cy.clerkSignIn({ strategy: 'ticket', ticket })
  })
  cy.window().its('Clerk.user.id').should('match', /^user_/)
}

// Login guardado pelo cy.session: para os testes de lançamentos, metas, jornadas...
Cypress.Commands.add('login', () => {
  cy.session('usuario-de-testes', loginComTicket, {
    validate() {
      // Confere se a sessão restaurada ainda vale; se falhar, o Cypress refaz o login
      cy.visit('/sign-in')
      cy.window().its('Clerk.user.id').should('match', /^user_/)
    },
    cacheAcrossSpecs: true,
  })
})

// Login descartável, fora do cy.session: para testes que encerram a sessão (logout)
Cypress.Commands.add('loginSemSessao', loginComTicket)