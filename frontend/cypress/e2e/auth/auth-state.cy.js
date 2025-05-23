describe('Authentication State', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
  })

  it('should redirect to login when no token exists', () => {
    cy.visit('/dashboard')
    cy.url().should('include', '/login')
  })
  
  it('should maintain login state across page refreshes', () => {
    cy.login('johndoe', 'johndoe', true)
    
    cy.url().should('include', '/dashboard')
    
    cy.reload()
    
    cy.url().should('include', '/dashboard')
  })
  
  it('should redirect to dashboard if already logged in', () => {
    cy.login('johndoe', 'johndoe')
    
    cy.visit('/login')
    
    cy.url().should('include', '/dashboard')
  })
})