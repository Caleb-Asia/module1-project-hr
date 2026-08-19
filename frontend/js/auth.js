// ============================================
// auth.js - Fixed Sign Out
// ============================================
import { API_BASE, showNotification } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signOutBtn = document.getElementById('signOutBtn');

    // --- 1. Login Logic ---
    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!username || !password) {
                showNotification("Please enter both username and password.", "error");
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Login failed. Check credentials.");
                }

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                showNotification(`Welcome back, ${data.user.username}!`, 'success');

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);

            } catch (error) {
                console.error("Login error:", error);
                showNotification(error.message, 'error');
            }
        });
    }

    // --- 2. SIGN OUT LOGIC (FIXED) ---
    if (signOutBtn) {
        signOutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevents any parent elements from reacting

            console.log(" Sign Out button clicked!");

            // Clear the session
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // 🔥 FORCEFUL REDIRECT: Even if index.html is cached, this forces a reload
            window.location.replace('index.html');
        });
    } else {
        // If the button isn't found, warn us in the console
        console.warn(" Sign Out button with ID 'signOutBtn' was not found in the DOM.");
    }
});