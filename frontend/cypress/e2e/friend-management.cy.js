describe('Friend Management', () => {
    beforeEach(() => {
        cy.fixture('users').as('usersData');

        cy.get('@usersData').then((users) => {
            cy.login(users.mainUser.username, users.mainUser.password);
        });
    });

    it('should display the friends list', () => {
        cy.visit('/dashboard/friends');
        cy.contains('h1', 'Friends').should('be.visible');
        cy.get('.friends-tab').should('be.visible');
    });

    it('should add a new friend', () => {
        cy.visit('/dashboard/friends/add');

        // Search for a user
        cy.get('input[placeholder*="Search"]').type('testuser2');
        cy.contains('.friend-card', 'testuser2').within(() => {
            cy.get('button').contains('Add').click();
        });

        // Verify toast message appears
        cy.contains('Friend request sent successfully').should('be.visible');

        // Verify user now appears in Pending Requests tab
        cy.visit('/dashboard/friends');
        cy.contains('Pending Requests').click();
        cy.contains('.friend-card', 'testuser2').should('be.visible');
        cy.contains('.friend-card', 'testuser2').contains('Pending').should('be.visible');
    });

    it('should accept a friend request', () => {
        // Visit the profile of user who sent a request
        cy.visit('/dashboard/users/testuser3');

        // Accept the friend request
        cy.get('button').contains('Accept').click();

        // Verify toast message appears
        cy.contains('Friend request accepted successfully').should('be.visible');

        // Verify user now appears in Friends tab
        cy.visit('/dashboard/friends');
        cy.contains('Friends').click();
        cy.contains('.friend-card', 'testuser3').should('be.visible');
    });

    it('should reject a friend request', () => {
        // Visit the profile of user who sent another request
        cy.visit('/dashboard/users/testuser4');

        // Reject the friend request
        cy.get('button').contains('Reject').click();

        // Verify toast message appears
        cy.contains('Friend request rejected successfully').should('be.visible');

        // Verify user no longer appears in any friend lists
        cy.visit('/dashboard/friends');
        cy.contains('Friend Requests').click();
        cy.contains('.friend-card', 'testuser4').should('not.exist');
    });

    it('should remove an existing friend', () => {
        cy.visit('/dashboard/friends');

        // Find an existing friend and remove them
        cy.contains('.friend-card', 'testuser2').within(() => {
            cy.get('button').contains('Remove').click();
        });

        // Verify toast message appears
        cy.contains('Friend removed successfully').should('be.visible');

        // Verify friend is removed from the list
        cy.contains('.friend-card', 'testuser2').should('not.exist');
    });

    it('should cancel a pending friend request', () => {
        cy.visit('/dashboard/friends');
        cy.contains('Pending Requests').click();

        // Find pending request and cancel it
        cy.contains('.friend-card', 'testuser5').within(() => {
            cy.get('button').contains('Cancel').click();
        });

        // Verify toast message appears
        cy.contains('Friend request cancelled').should('be.visible');

        // Verify request is removed from pending list
        cy.contains('.friend-card', 'testuser5').should('not.exist');
    });
});