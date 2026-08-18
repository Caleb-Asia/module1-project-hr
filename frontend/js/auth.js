// ============================================
// auth.js - Real Backend Login
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
                // Send request to your real backend auth route
                const response = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Login failed. Check credentials.");
                }

                // ✅ SUCCESS: Save the JWT token to browser storage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                showNotification(`Welcome back, ${data.user.username}!`, 'success');

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);

            } catch (error) {
                console.error("Login error:", error);
                showNotification(error.message, 'error');
            }
        });
    }

    // --- 2. Sign Out Logic ---
    if (signOutBtn) {
        signOutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove the token from storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Send them back to index.html
            window.location.href = 'index.html';
        });
    }
});