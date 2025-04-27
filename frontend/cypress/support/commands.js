Cypress.Commands.add('login', (usernameOrEmail, password, rememberMe = false) => {
    cy.intercept('POST', '**/users/login', {
        statusCode: 200,
        body: { token: 'fake-token-12345' }
    }).as('loginRequest')

    cy.intercept('GET', '**/users/me', {
        statusCode: 200,
        body: {
            _id: '123',
            username: typeof usernameOrEmail === 'string' && !usernameOrEmail.includes('@')
                ? usernameOrEmail
                : 'testuser',
            email: typeof usernameOrEmail === 'string' && usernameOrEmail.includes('@')
                ? usernameOrEmail
                : 'test@example.com',
            avatarUrl: ''
        }
    }).as('getMeRequest')

    cy.visit('/login')
    cy.get('input[id="emailOrUsername"]').type(usernameOrEmail)
    cy.get('input[id="password"]').type(password)

    if (rememberMe) {
        cy.get('input[id="remember"]').check()
    }

    cy.get('button').contains('Sign in').click()
    cy.wait('@loginRequest')
    cy.wait('@getMeRequest')
})

Cypress.Commands.add('loginWithBackend', (usernameOrEmail, password) => {
    // This command uses the real backend for authentication
    cy.visit('/login')
    cy.get('input[id="emailOrUsername"]').type(usernameOrEmail)
    cy.get('input[id="password"]').type(password)
    cy.get('button').contains('Sign in').click()
    cy.url().should('include', '/dashboard')
})