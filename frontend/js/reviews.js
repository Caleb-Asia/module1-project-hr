// ============================================
// reviews.js - CALEB_DEV
// ============================================
import { API_BASE, showNotification, getInitials, COLORS } from './main.js';

if (window.location.pathname.toLowerCase().includes('reviews')) {

    const reviewsContainer = document.getElementById("reviews-data-list");

    async function loadReviews() {
        if (!reviewsContainer) return;

        try {
            reviewsContainer.innerHTML = `<div style="padding: 2rem; text-align: center; color: #94a3b8;">⏳ Loading reviews from server...</div>`;

            // Fetch all reviews from backend
            const response = await fetch(`${API_BASE}/api/reviews`);
            if (!response.ok) throw new Error("Failed to fetch reviews");
            
            let reviews = await response.json();

            // Ensure rating is a number for every review
            reviews = reviews.map(review => ({
                ...review,
                rating: parseFloat(review.rating) || 0
            }));

            if (!reviews.length) {
                reviewsContainer.innerHTML = `<div style="padding: 2rem; text-align: center; color: #94a3b8;">No reviews found.</div>`;
                return;
            }

            // 1. Update the "Total Reviews" card in the header
            const totalReviewsDisplay = document.getElementById('totalReviewsDisplay');
            if (totalReviewsDisplay) {
                totalReviewsDisplay.innerText = reviews.length;
            }

            // 2. Render the review cards
            reviewsContainer.innerHTML = renderReviewCards(reviews);
            console.log(`✅ Reviews loaded: ${reviews.length} records`);

            // 3. Load and update the Average Rating from the API
            loadAverageRating();

        } catch (error) {
            console.error("❌ Error loading reviews:", error);
            reviewsContainer.innerHTML = `<div style="padding: 2rem; text-align: center; color: #ef4444;">❌ Failed to load data from backend.</div>`;
        }
    }

    async function loadAverageRating() {
        try {
            const response = await fetch(`${API_BASE}/api/reviews/average`);
            const data = await response.json();
            
            const avgElement = document.getElementById('avgRatingDisplay');
            const starsElement = document.getElementById('avgStarsDisplay');
            
            if (avgElement) {
                // Update the text (e.g., "4.3/5")
                avgElement.innerText = `${data.average}/5`;
            }

            if (starsElement) {
                // Dynamically generate Bootstrap stars based on the average
                const avg = parseFloat(data.average) || 0;
                const fullStars = Math.floor(avg);
                const hasHalfStar = (avg - fullStars) >= 0.5;
                
                let htmlString = '';
                for (let i = 0; i < 5; i++) {
                    if (i < fullStars) {
                        htmlString += `<i class="bi bi-star-fill" style="color: #fbbf24; font-size: 1.3rem; margin-right: 2px;"></i>`;
                    } else if (i === fullStars && hasHalfStar) {
                        htmlString += `<i class="bi bi-star-half" style="color: #fbbf24; font-size: 1.3rem; margin-right: 2px;"></i>`;
                    } else {
                        htmlString += `<i class="bi bi-star" style="color: #fbbf24; font-size: 1.3rem; margin-right: 2px;"></i>`;
                    }
                }
                starsElement.innerHTML = htmlString;
            }
        } catch (e) {
            console.warn("Could not load average rating", e);
        }
    }

    function renderReviewCards(reviews) {
        return reviews.map((review) => {
            const initials = getInitials(`${review.first_name} ${review.last_name}`);
            const avatarColor = COLORS.avatar[(review.employee_id - 1) % COLORS.avatar.length];

            // Generate star ratings using Bootstrap Icons
            const safeRating = review.rating || 0;
            const fullStars = Math.floor(safeRating);
            const hasHalfStar = (safeRating - fullStars) >= 0.5;
            
            let starHtml = '';
            for (let i = 0; i < 5; i++) {
                if (i < fullStars) {
                    starHtml += `<i class="bi bi-star-fill" style="color: #fbbf24;"></i>`;
                } else if (i === fullStars && hasHalfStar) {
                    starHtml += `<i class="bi bi-star-half" style="color: #fbbf24;"></i>`;
                } else {
                    starHtml += `<i class="bi bi-star" style="color: #fbbf24;"></i>`;
                }
            }

            return `
                <article class="review-card" style="background: #0f172a; border-radius: 1.5rem; padding: 1.35rem; border: 1px solid #1e293b; box-shadow: 0 18px 50px rgba(0, 0, 0, 0.16); display: flex; flex-direction: column; gap: 0.75rem;">
                    <div class="review-card-header" style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;">
                        <div class="review-card-title" style="display: flex; align-items: center; gap: 0.85rem;">
                            <span class="initials" style="width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; background: ${avatarColor}; flex-shrink: 0;">${initials}</span>
                            <div>
                                <h3 style="color: #f8fafc; font-size: 1rem; margin: 0;">${review.first_name} ${review.last_name}</h3>
                                <p style="color: #94a3b8; font-size: 0.85rem; margin: 0.2rem 0 0;">${review.department || "Employee"}</p>
                            </div>
                        </div>
                        <span class="review-badge" style="padding: 0.45rem 0.85rem; border-radius: 999px; background: rgba(99, 102, 241, 0.14); color: #c7d2fe; font-size: 0.75rem; font-weight: 700;">${review.quarter || "General"}</span>
                    </div>
                    <div class="review-meta" style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; color: #94a3b8; font-size: 0.9rem;">
                        <span class="rating" style="color: #fbbf24; font-weight: 700; display: inline-flex; align-items: center; gap: 0.4rem;">
                            ${starHtml} ${safeRating.toFixed(1)}/5
                        </span>
                    </div>
                    <p class="feedback" style="color: #cbd5e1; line-height: 1.7; margin: 0;">${review.comments}</p>
                    <div class="review-footer" style="border-top: 1px solid #1e293b; padding-top: 0.75rem; font-size: 0.75rem; color: #94a3b8;">
                        <span>📅 Reviewed: ${new Date(review.review_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                    </div>
                </article>
            `;
        }).join("");
    }

    // Initialize on load
    document.addEventListener("DOMContentLoaded", loadReviews);
}
