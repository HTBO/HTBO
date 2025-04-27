describe('Login Page', () => {
    beforeEach(() => {
        // Visit the login page before each test
        cy.visit('/login')
    })

    it('should display the login form correctly', () => {
        cy.get('h2').contains('Welcome back').should('be.visible')
        cy.get('h3').contains('Please enter your details to sign in').should('be.visible')
        cy.get('label').contains('Email or username').should('be.visible')
        cy.get('label').contains('Password').should('be.visible')
        cy.get('input[id="emailOrUsername"]').should('be.visible')
        cy.get('input[id="password"]').should('be.visible')
        cy.get('button').contains('Sign in').should('be.visible')
        cy.get('a').contains('Sign up').should('be.visible')
    })

    it('should show validation errors for empty fields', () => {
        cy.wait(100)
        cy.get('button').contains('Sign in').click()
        cy.get('#error-message').contains('Email or username is required').should('be.visible')

        cy.get('input[id="emailOrUsername"]').type('testuser')
        cy.get('button').contains('Sign in').click()
        cy.get('#error-message').contains('Password is required').should('be.visible')
    })

    it('should login with valid username', () => {
        cy.intercept('POST', '**/users/login', {
            statusCode: 200,
            body: { token: 'fake-token-12345' }
        }).as('loginRequest')

        cy.intercept('GET', '**/users/me', {
            statusCode: 200,
            body: {
                _id: '123',
                username: 'testuser',
                email: 'test@example.com',
                avatarUrl: ''
            }
        }).as('getMeRequest')

        cy.get('input[id="emailOrUsername"]').type('testuser')
        cy.get('input[id="password"]').type('password123')
        cy.get('button').contains('Sign in').click()

        cy.wait('@loginRequest')
        cy.wait('@getMeRequest')

        cy.url().should('include', '/dashboard')
    })

    it('should login with valid email', () => {
        cy.intercept('POST', '**/users/login', {
            statusCode: 200,
            body: { token: 'fake-token-12345' }
        }).as('loginRequest')

        cy.intercept('GET', '**/users/me', {
            statusCode: 200,
            body: {
                _id: '123',
                username: 'testuser',
                email: 'test@example.com',
                avatarUrl: ''
            }
        }).as('getMeRequest')

        cy.get('input[id="emailOrUsername"]').type('test@example.com')
        cy.get('input[id="password"]').type('password123')
        cy.get('button').contains('Sign in').click()

        cy.wait('@loginRequest')
        cy.wait('@getMeRequest')

        cy.url().should('include', '/dashboard')
    })

    it('should show error for invalid credentials', () => {
        cy.intercept('POST', '**/users/login', {
            statusCode: 401,
            body: { error: 'Username or password does not match | ERRC: 240' }
        }).as('failedLogin')

        cy.get('input[id="emailOrUsername"]').type('wronguser')
        cy.get('input[id="password"]').type('wrongpassword')
        cy.get('button').contains('Sign in').click()

        cy.wait('@failedLogin')
        cy.get('#error-message').contains('Login failed').should('be.visible')
    })

    it('should navigate to register page', () => {
        cy.get('a').contains('Sign up').click()
        cy.url().should('include', '/register')
    })

    it('should remember login state', () => {
        cy.intercept('POST', '**/users/login', {
            statusCode: 200,
            body: { token: 'fake-token-12345' }
        }).as('loginRequest')

        cy.intercept('GET', '**/users/me', {
            statusCode: 200,
            body: {
                _id: '123',
                username: 'testuser',
                email: 'test@example.com'
            }
        }).as('getMeRequest')

        cy.get('input[id="emailOrUsername"]').type('testuser')
        cy.get('input[id="password"]').type('password123')
        cy.get('input[id="remember"]').check()
        cy.get('button').contains('Sign in').click()

        cy.wait('@loginRequest')
        cy.wait('@getMeRequest')

        cy.url().should('include', '/dashboard')

        cy.getCookie('authToken').should('exist')
    })
})