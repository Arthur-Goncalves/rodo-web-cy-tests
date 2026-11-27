describe('Acesso sem sessão', () => {
  it('o /dashboard sem login redireciona para o login do Clerk, guardando a página de origem', () => {
    cy.visit('/dashboard')

    // Sem sessão, o app manda para o Account Portal do Clerk (domínio *.accounts.dev)
    cy.location('hostname').should('match', /\.accounts\.dev$/)
    cy.location('pathname').should('eq', '/sign-in')

    // Extrai só o redirect_url, para o assert não mostrar o resto da query (que tem token)
    cy.location('search')
      .then((search) => new URLSearchParams(search).get('redirect_url'))
      .should('eq', `${Cypress.config('baseUrl')}/dashboard`)
  })
})