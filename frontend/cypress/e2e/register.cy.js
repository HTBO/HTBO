describe('Registration Page Tests', () => {
  beforeEach(() => {
    cy.visit('/register')
  })

  it('Displays registration form elements', () => {
    cy.get('h2').should('contain', 'Fiók regisztrálása')
    cy.get('input[name="username"]').should('exist')
    cy.get('input[name="email"]').should('exist')
    cy.get('input[name="password"]').should('exist')
    cy.get('button[type="submit"]').should('contain', 'Bejelentkezés') // Note: Update if button text changes
  })

  it('Redirects to dashboard on successful registration', () => {
    cy.intercept('POST', 'http://localhost:5000/api/users/register', {
      statusCode: 200,
      body: { token: 'fake-token' },
    }).as('registerRequest')

    cy.get('input[name="username"]').type('newuser')
    cy.get('input[name="email"]').type('new@example.com')
    cy.get('input[name="password"]').type('newpassword')
    cy.get('button[type="submit"]').click()

    cy.wait('@registerRequest')
    cy.location('pathname').should('eq', '/dashboard')
    cy.window().its('localStorage.token').should('eq', 'fake-token')
  })

  it('Navigates to login page', () => {
    cy.contains('Jelentkezz be').click()
    cy.location('pathname').should('eq', '/login')
  })

  it('Displays error message for empty username', () => {
    cy.get('input[name="email"]').type('new@example.com')
    cy.get('input[name="password"]').type('newpassword')
    cy.get('button[type="submit"]').click()
    cy.get('#error-message')
      .should('be.visible')
      .and('contain', 'Username is required')
  })

  it('Displays error message for empty email', () => {
    cy.get('input[name="username"]').type('newuser')
    cy.get('input[name="password"]').type('newpassword')
    cy.get('button[type="submit"]').click()
    cy.get('#error-message')
      .should('be.visible')
      .and('contain', 'Email is required')
  })

  it('Displays error message for empty password', () => {
    cy.get('input[name="username"]').type('newuser')
    cy.get('input[name="email"]').type('new@example.com')
    cy.get('button[type="submit"]').click()
    cy.get('#error-message')
      .should('be.visible')
      .and('contain', 'Password is required')
  })
})