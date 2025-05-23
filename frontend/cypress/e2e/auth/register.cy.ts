describe('Registration Page', () => {
    beforeEach(() => {
        cy.visit('/register')
    })

    it('should display the registration form', () => {
        cy.get('h2').should('contain', 'Welcome to HTBO!')
        cy.get('form').should('be.visible')
        cy.get('#username').should('be.visible')
        cy.get('#email').should('be.visible')
        cy.get('#password').should('be.visible')
        cy.get('button[type="submit"]').should('contain', 'Sign Up')
    })

    it('should validate required fields', () => {
        cy.wait(100)
        cy.get('button[type="submit"]').click()
        cy.get('#error-message').should('be.visible')
        cy.get('#error-message').should('contain', 'Username is required')

        cy.get('#username').type('testuser')
        cy.get('button[type="submit"]').click()
        cy.get('#error-message').should('contain', 'Email is required')

        cy.get('#email').type('test@example.com')
        cy.get('button[type="submit"]').click()
        cy.get('#error-message').should('contain', 'Password is required')
    })

    it('should handle username already exists error', () => {
        cy.intercept('POST', '**/users/register', {
            statusCode: 400,
            body: { error: 'Username already exists' }
        }).as('registerFailedRequest')

        cy.get('#username').type('existinguser')
        cy.get('#email').type('new@example.com')
        cy.get('#password').type('password123')
        cy.get('button[type="submit"]').click()

        cy.wait('@registerFailedRequest')
        cy.get('#error-message').should('contain', 'Username already exists')
    })

    it('should handle email already exists error', () => {
        cy.intercept('POST', '**/users/register', {
            statusCode: 400,
            body: { error: 'Email already registered' }
        }).as('registerFailedRequest')

        cy.get('#username').type('newuser2')
        cy.get('#email').type('existing@example.com')
        cy.get('#password').type('password123')
        cy.get('button[type="submit"]').click()

        cy.wait('@registerFailedRequest')
        cy.get('#error-message').should('contain', 'Email already registered')
    })

    it('should navigate to login page when clicking sign in link', () => {
        cy.get('a').contains('Sign in').click()
        cy.url().should('include', '/login')
    })
})