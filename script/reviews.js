const reviewsContainer = document.getElementById('reviews-data-list');

function getInitials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

function getStars(rating = 0) {
    const rounded = Math.round(rating);
    return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
}

function getFeedback(employee = {}) {
    const role = employee.position || 'team member';
    const department = employee.department || 'the company';

    return `${employee.name || 'This employee'} brings strong focus to ${department.toLowerCase()} work and continues to contribute positively as a ${role.toLowerCase()}. Their reliability and collaboration make them a valuable part of the team.`;
}

async function loadReviews() {
    if (!reviewsContainer) return;

    const dataSources = [
        'data/employee_info.json',
        './data/employee_info.json',
        '../data/employee_info.json'
    ];

    let data = null;

    for (const source of dataSources) {
        try {
            const response = await fetch(source);
            if (!response.ok) {
                continue;
            }

            data = await response.json();
            break;
        } catch (error) {
            continue;
        }
    }

    const employees = Array.isArray(data?.employeeInformation) ? data.employeeInformation : [];

    if (!employees.length) {
        reviewsContainer.innerHTML = '<div class="empty-state">No employee review data is available right now.</div>';
        return;
    }

    const cardsMarkup = employees.map((employee) => {
        const rating = Number((4.0 + ((employee.employeeId % 5) * 0.2)).toFixed(1));
        const initials = getInitials(employee.name);
        const stars = getStars(rating);

        return `
            <article class="review-card">
                <div class="review-card-header">
                    <div class="review-card-title">
                        <span class="initials">${initials}</span>
                        <div>
                            <h3>${employee.name}</h3>
                            <p>${employee.position}</p>
                        </div>
                    </div>
                    <span class="review-badge">${employee.department}</span>
                </div>
                <div class="review-meta">
                    <span class="rating">${stars} ${rating}/5</span>
                    <span>Quarter 2</span>
                </div>
                <p class="feedback">${getFeedback(employee)}</p>
            </article>
        `;
    }).join('');

    reviewsContainer.innerHTML = cardsMarkup;
}

loadReviews();
