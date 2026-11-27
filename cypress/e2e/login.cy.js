describe('Acesso', () => {
  
  it('a página /sign-in abre e carrega o Clerk', () => {
    cy.visit('/sign-in')

    // O Clerk se registra em window.Clerk; o should repete até ele terminar de carregar
    cy.window().its('Clerk.loaded').should('be.true')
  })

  it('login sem a tela com ticket deixa o usuário de testes logado', () => {
    cy.visit('/sign-in')

    cy.task('criarSignInToken', null, { log: false }).then((ticket) => {
      cy.clerkSignIn({ strategy: 'ticket', ticket })
    })

    cy.window().its('Clerk.user.id').should('match', /^user_/)
  })
})

describe('Sessão reutilizada', () => {
  beforeEach(() => {
    cy.login()
  })

  it('abre o /dashboard logado (1ª vez: cria a sessão)', () => {
    cy.visit('/dashboard')
    cy.location('pathname').should('eq', '/dashboard')
  })

  it('abre o /dashboard logado (2ª vez: restaura a sessão)', () => {
    cy.visit('/dashboard')
    cy.location('pathname').should('eq', '/dashboard')
  })
})



