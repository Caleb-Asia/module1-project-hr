// ============================================
// nav.js - HIGHLIGHTS ACTIVE NAVIGATION TAB
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Get the current page filename (e.g., 'attendance.html', 'reviews.html')
    const currentPath = window.location.pathname.split('/').pop().toLowerCase();

    // Select all navigation links
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href')?.toLowerCase() || '';

        // Check if the link's href matches the current page
        if (href === currentPath) {
            link.closest('li')?.classList.add('active');
        } else {
            link.closest('li')?.classList.remove('active');
        }
    });
});