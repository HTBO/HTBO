describe('Login Page Tests', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('Displays login form elements', () => {
    cy.get('input[name="email"]').should('exist')
    cy.get('input[name="password"]').should('exist')
    cy.get('button[type="submit"]').should('contain', 'Bejelentkezés')
  })

  it('Shows error message on invalid login', () => {
    cy.intercept('POST', 'http://localhost:5000/api/users/login', {
      statusCode: 401,
      body: { error: 'Invalid credentials' },
    }).as('loginRequest')

    cy.get('input[name="email"]').type('invalid@example.com', { delay: 100 })
    cy.get('input[name="password"]').type('wrongpass', { delay: 100 })
    cy.get('button[type="submit"]').click()

    cy.wait('@loginRequest', { timeout: 30000 })
    cy.get('.text-red-200')
      .should('be.visible')
      .and('contain', 'Invalid credentials')
  })

  it('Redirects to dashboard on successful login', () => {
    cy.intercept('POST', 'http://localhost:5000/api/users/login', {
      statusCode: 200,
      body: { token: 'fake-token' },
    }).as('loginRequest')

    cy.get('input[name="email"]').type('valid@example.com')
    cy.get('input[name="password"]').type('correctpass')
    cy.get('button[type="submit"]').click()

    cy.wait('@loginRequest')
    cy.location('pathname').should('eq', '/dashboard')
    cy.window().its('localStorage.token').should('eq', 'fake-token')
  })

  it('Navigates to registration page', () => {
    cy.contains('Regisztrálj').click()
    cy.location('pathname').should('eq', '/register')
  })

  it('Displays error message for empty email', () => {
    cy.get('input[name="password"]').type('somepassword')
    cy.get('button[type="submit"]').click()
    cy.get('#error-message')
      .should('be.visible')
      .and('contain', 'Email is required')
  })

  it('Displays error message for empty password', () => {
    cy.get('input[name="email"]').type('valid@example.com')
    cy.get('button[type="submit"]').click()
    cy.get('#error-message')
      .should('be.visible')
      .and('contain', 'Password is required')
  })
})