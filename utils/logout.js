function logout() {
    // Update current user status
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        currentUser.isLoggedIn = false;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    // Redirect to login page
    window.location.href = 'login.html';
}