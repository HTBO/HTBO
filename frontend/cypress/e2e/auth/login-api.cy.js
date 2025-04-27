describe('Login with Real API', () => {
    it('should log in with real API', () => {
        cy.visit('/login')
        cy.get('input[id="emailOrUsername"]').type('johndoe')
        cy.get('input[id="password"]').type('johndoe')
        cy.get('button').contains('Sign in').click()

        cy.url().should('include', '/dashboard', { timeout: 10000 })
    })

    it('should show actual error messages from API', () => {
        cy.visit('/login')
        cy.get('input[id="emailOrUsername"]').type('nonexistentuser')
        cy.get('input[id="password"]').type('wrongpassword')
        cy.get('button').contains('Sign in').click()

        cy.get('#error-message').should('be.visible')
    })
})