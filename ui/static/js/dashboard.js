document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const userNameSpan = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout-button');

    if (!token) {
        window.location.href = '/'; 
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (userNameSpan && payload.name) {
            userNameSpan.textContent = payload.name;
        }
    } catch (e) {
        console.error("Gagal men-decode token:", e);
        localStorage.removeItem('authToken');
        window.location.href = '/';
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            alert('Anda telah logout.');
            window.location.href = '/';
        });
    }
});