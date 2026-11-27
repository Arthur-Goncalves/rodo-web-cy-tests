describe('Logout', () => {
  it('depois do logout, o /dashboard volta a exigir login', () => {
    cy.loginSemSessao()

    cy.visit('/dashboard')
    cy.location('pathname').should('eq', '/dashboard') // confirma que estava logado

    cy.clerkSignOut()

    cy.visit('/dashboard')
    cy.location('hostname').should('match', /\.accounts\.dev$/)
    cy.location('pathname').should('eq', '/sign-in')
  })
})