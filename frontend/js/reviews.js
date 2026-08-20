// ============================================
// reviews.js - CALEB_DEV (Bootstrap Icons & Delete)
// ============================================
import { API_BASE, showNotification, getInitials, COLORS } from './main.js';

if (window.location.pathname.toLowerCase().includes('reviews')) {

    const reviewsContainer = document.getElementById("reviews-data-list");

    async function loadReviews() {
        if (!reviewsContainer) return;

        try {
            reviewsContainer.innerHTML = `<div style="padding: 2rem; text-align: center; color: #94a3b8;">⏳ Loading reviews from server...</div>`;

            const response = await fetch(`${API_BASE}/api/reviews`);
            if (!response.ok) throw new Error("Failed to fetch reviews");
            
            let reviews = await response.json();
            reviews = reviews.map(review => ({ ...review, rating: parseFloat(review.rating) || 0 }));

            if (!reviews.length) {
                reviewsContainer.innerHTML = `<div style="padding: 2rem; text-align: center; color: #94a3b8;">No reviews found.</div>`;
                return;
            }

            const totalReviewsDisplay = document.getElementById('totalReviewsDisplay');
            if (totalReviewsDisplay) totalReviewsDisplay.innerText = reviews.length;

            reviewsContainer.innerHTML = renderReviewCards(reviews);
            console.log(`✅ Reviews loaded: ${reviews.length} records`);

            attachDeleteEvents();

            loadAverageRating();

        } catch (error) {
            console.error("❌ Error loading reviews:", error);
            reviewsContainer.innerHTML = `<div style="padding: 2rem; text-align: center; color: #ef4444;">❌ Failed to load data from backend.</div>`;
        }
    }

    function attachDeleteEvents() {
        document.querySelectorAll('.delete-review-btn').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.stopPropagation();
                const reviewId = this.dataset.id;
                
                if (!confirm("Are you sure you want to permanently delete this review?")) {
                    return;
                }

                try {
                    const response = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        const errData = await response.json();
                        throw new Error(errData.error || "Failed to delete review");
                    }

                    showNotification("🗑️ Review deleted successfully!", "success");
                    loadReviews();

                } catch (error) {
                    console.error("Delete error:", error);
                    showNotification(`Error: ${error.message}`, 'error');
                }
            });
        });
    }

    async function loadAverageRating() {
        try {
            const response = await fetch(`${API_BASE}/api/reviews/average`);
            const data = await response.json();
            
            const avgElement = document.getElementById('avgRatingDisplay');
            const starsElement = document.getElementById('avgStarsDisplay');
            
            if (avgElement) avgElement.innerText = `${data.average}/5`;

            if (starsElement) {
                const avg = parseFloat(data.average) || 0;
                const fullStars = Math.floor(avg);
                const hasHalfStar = (avg - fullStars) >= 0.5;
                
                let htmlString = '';
                for (let i = 0; i < 5; i++) {
                    if (i < fullStars) htmlString += `<i class="bi bi-star-fill" style="color: #fbbf24; font-size: 1.3rem; margin-right: 2px;"></i>`;
                    else if (i === fullStars && hasHalfStar) htmlString += `<i class="bi bi-star-half" style="color: #fbbf24; font-size: 1.3rem; margin-right: 2px;"></i>`;
                    else htmlString += `<i class="bi bi-star" style="color: #fbbf24; font-size: 1.3rem; margin-right: 2px;"></i>`;
                }
                starsElement.innerHTML = htmlString;
            }
        } catch (e) { console.warn("Could not load average rating", e); }
    }

    function renderReviewCards(reviews) {
        return reviews.map((review) => {
            const fullName = review.employee_name || 'Unknown Employee';
            const initials = getInitials(fullName);
            const avatarColor = COLORS.avatar[(review.employee_id - 1) % COLORS.avatar.length];
            const safeRating = review.rating || 0;
            const fullStars = Math.floor(safeRating);
            const hasHalfStar = (safeRating - fullStars) >= 0.5;
            
            let starHtml = '';
            for (let i = 0; i < 5; i++) {
                if (i < fullStars) starHtml += `<i class="bi bi-star-fill" style="color: #fbbf24;"></i>`;
                else if (i === fullStars && hasHalfStar) starHtml += `<i class="bi bi-star-half" style="color: #fbbf24;"></i>`;
                else starHtml += `<i class="bi bi-star" style="color: #fbbf24;"></i>`;
            }

            // ✅ FIX: Added margin-right to the badge so it doesn't touch the trash icon
            return `
                <article class="review-card" data-review-id="${review.review_id}" style="background: #0f172a; border-radius: 1.5rem; padding: 1.35rem; border: 1px solid #1e293b; box-shadow: 0 18px 50px rgba(0, 0, 0, 0.16); display: flex; flex-direction: column; gap: 0.75rem; position: relative;">
                    
                    <!-- 🗑️ DELETE ICON -->
                    <button class="delete-review-btn" data-id="${review.review_id}" style="position: absolute; top: 0.8rem; right: 0.8rem; background: none; border: none; color: #64748b; cursor: pointer; font-size: 1.1rem; transition: all 0.2s ease;" title="Delete this review">
                        <i class="bi bi-trash"></i>
                    </button>

                    <div class="review-card-header" style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;">
                        <div class="review-card-title" style="display: flex; align-items: center; gap: 0.85rem;">
                            <span class="initials" style="width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; background: ${avatarColor}; flex-shrink: 0;">${initials}</span>
                            <div>
                                <h3 style="color: #f8fafc; font-size: 1rem; margin: 0;">${fullName}</h3>
                                <p style="color: #94a3b8; font-size: 0.85rem; margin: 0.2rem 0 0;">${review.department || "Employee"}</p>
                            </div>
                        </div>
                        <span class="review-badge" style="padding: 0.45rem 0.85rem; border-radius: 999px; background: rgba(99, 102, 241, 0.14); color: #c7d2fe; font-size: 0.75rem; font-weight: 700; margin-right: 2.2rem;">${review.quarter || "General"}</span>
                    </div>
                    <div class="review-meta" style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; color: #94a3b8; font-size: 0.9rem;">
                        <span class="rating" style="color: #fbbf24; font-weight: 700; display: inline-flex; align-items: center; gap: 0.4rem;">
                            ${starHtml} ${safeRating.toFixed(1)}/5
                        </span>
                    </div>
                    <p class="feedback" style="color: #cbd5e1; line-height: 1.7; margin: 0; padding-right: 2rem;">${review.comments}</p>
                    <div class="review-footer" style="border-top: 1px solid #1e293b; padding-top: 0.75rem; font-size: 0.75rem; color: #94a3b8;">
                        <span>📅 Reviewed: ${new Date(review.review_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                    </div>
                </article>
            `;
        }).join("");
    }

    function openReviewModal() {
        const existing = document.getElementById('customModal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'customModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px);
            display: flex; align-items: center; justify-content: center;
            z-index: 9999; animation: fadeIn 0.3s ease;
        `;

        modal.innerHTML = `
            <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 1.5rem; padding: 2rem; max-width: 450px; width: 90%; box-shadow: 0 30px 80px rgba(0,0,0,0.6); animation: slideDown 0.3s ease;">
                <h2 style="color: #f8fafc; margin-top: 0; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="bi bi-star" style="color: #f59e0b;"></i> Add New Review
                </h2>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; color: #94a3b8; font-size: 0.85rem; margin-bottom: 0.3rem;">Employee ID (1-10)</label>
                    <input type="number" id="modalEmpId" min="1" max="10" style="width: 100%; padding: 0.75rem; border: 1px solid #1e293b; border-radius: 0.75rem; background: #1a2332; color: #f8fafc; font-size: 1rem; box-sizing: border-box;">
                </div>

                <div style="margin-bottom: 1rem;">
                    <label style="display: block; color: #94a3b8; font-size: 0.85rem; margin-bottom: 0.3rem;">Rating (1-5)</label>
                    <div id="starRatingContainer" style="display: flex; gap: 0.5rem; padding: 0.5rem 0;">
                        <i class="bi bi-star star-rating" data-value="1" style="font-size: 2rem; color: #f59e0b; cursor: pointer; transition: all 0.2s;"></i>
                        <i class="bi bi-star star-rating" data-value="2" style="font-size: 2rem; color: #f59e0b; cursor: pointer; transition: all 0.2s;"></i>
                        <i class="bi bi-star star-rating" data-value="3" style="font-size: 2rem; color: #f59e0b; cursor: pointer; transition: all 0.2s;"></i>
                        <i class="bi bi-star star-rating" data-value="4" style="font-size: 2rem; color: #f59e0b; cursor: pointer; transition: all 0.2s;"></i>
                        <i class="bi bi-star star-rating" data-value="5" style="font-size: 2rem; color: #f59e0b; cursor: pointer; transition: all 0.2s;"></i>
                    </div>
                    <input type="hidden" id="modalRating" value="4">
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; color: #94a3b8; font-size: 0.85rem; margin-bottom: 0.3rem;">Feedback</label>
                    <textarea id="modalFeedback" rows="3" placeholder="Enter your review comments..." style="width: 100%; padding: 0.75rem; border: 1px solid #1e293b; border-radius: 0.75rem; background: #1a2332; color: #f8fafc; font-size: 1rem; box-sizing: border-box; font-family: inherit; resize: vertical;"></textarea>
                </div>

                <div style="display: flex; gap: 1rem;">
                    <button id="modalSubmitBtn" style="flex: 1; padding: 0.75rem; border: none; border-radius: 0.75rem; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; font-weight: 600; cursor: pointer; font-size: 1rem; transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);" onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 6px 25px rgba(245,158,11,0.5)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 15px rgba(245,158,11,0.3)';">Submit Review</button>
                    <button id="modalCancelBtn" style="flex: 1; padding: 0.75rem; border: 1px solid #1e293b; border-radius: 0.75rem; background: transparent; color: #94a3b8; font-weight: 600; cursor: pointer; font-size: 1rem; transition: all 0.2s;" onmouseover="this.style.backgroundColor='#1e293b';" onmouseout="this.style.backgroundColor='transparent';">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const stars = modal.querySelectorAll('.star-rating');
        const ratingInput = modal.querySelector('#modalRating');

        function updateStars(rating) {
            stars.forEach(star => {
                const val = parseInt(star.dataset.value);
                if (val <= rating) {
                    star.className = 'bi bi-star-fill star-rating';
                } else {
                    star.className = 'bi bi-star star-rating';
                }
            });
        }

        stars.forEach(star => {
            star.addEventListener('mouseenter', function() {
                const val = parseInt(this.dataset.value);
                stars.forEach(s => {
                    const v = parseInt(s.dataset.value);
                    if (v <= val) {
                        s.className = 'bi bi-star-fill star-rating';
                    } else {
                        s.className = 'bi bi-star star-rating';
                    }
                });
            });

            star.addEventListener('click', function() {
                const val = parseInt(this.dataset.value);
                ratingInput.value = val;
                updateStars(val);
            });
        });

        modal.querySelector('#starRatingContainer').addEventListener('mouseleave', function() {
            const currentVal = parseInt(ratingInput.value) || 4;
            updateStars(currentVal);
        });

        updateStars(4);

        modal.querySelector('#modalSubmitBtn').addEventListener('click', async () => {
            const empId = modal.querySelector('#modalEmpId').value;
            const rating = modal.querySelector('#modalRating').value;
            const comments = modal.querySelector('#modalFeedback').value.trim();

            if (!empId || isNaN(empId)) {
                showNotification("Please enter a valid Employee ID (1-10).", "error");
                return;
            }
            if (!comments) {
                showNotification("Please enter feedback comments.", "error");
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/api/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        employee_id: parseInt(empId), 
                        rating: parseFloat(rating), 
                        comments 
                    })
                });

                const data = await response.json();
                if (data.error) {
                    showNotification(`Error: ${data.error}`, 'error');
                } else {
                    modal.remove();
                    showNotification(`Review added for Employee ${empId}!`, 'success');
                    loadReviews();
                }
            } catch (error) {
                showNotification(`Failed to connect to backend`, 'error');
                console.error(error);
            }
        });

        modal.querySelector('#modalCancelBtn').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }

    function initReviewsButtons() {
        const addReviewBtn = document.querySelector('.topbar-actions .btn-primary');
        if (addReviewBtn) {
            addReviewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openReviewModal();
            });
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        loadReviews();
        initReviewsButtons();
    });
}