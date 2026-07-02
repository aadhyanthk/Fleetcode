import { getCuratedSummaries } from './firestore.js';
import { logout } from './auth.js';

export async function renderDashboardUI(container, user) {
    container.innerHTML = `
        <div class="dashboard-view">
            <header class="navbar">
                <h1>Fleetcode</h1>
                <div class="user-info">
                    <span>${user.displayName}</span>
                    <button id="logout-btn">Log out</button>
                </div>
            </header>
            <main class="dashboard-main">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2>Curated Deck (All Problems)</h2>
                    <span id="deck-stats" style="color: var(--text-secondary);">Loading...</span>
                </div>
                <div class="deck-list" id="curated-deck-list">
                    <p style="text-align: center; color: var(--text-secondary);">Loading problems...</p>
                </div>
            </main>
        </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', logout);

    // Fetch and render
    try {
        const problems = await getCuratedSummaries();
        const listContainer = document.getElementById('curated-deck-list');
        
        document.getElementById('deck-stats').textContent = `${problems.length} problems`;

        let html = '<ul class="problem-list">';
        problems.forEach(p => {
            html += `
                <li class="problem-item" data-slug="${p.slug}">
                    <div class="problem-info">
                        <span class="problem-id">#${p.id || '?'}</span>
                        <span class="problem-title">${p.title}</span>
                    </div>
                    <div class="problem-history">
                        <!-- Default empty history dots -->
                        <span class="dot empty"></span>
                        <span class="dot empty"></span>
                        <span class="dot empty"></span>
                        <span class="dot empty"></span>
                        <span class="dot empty"></span>
                    </div>
                    <button class="study-btn">Study</button>
                </li>
            `;
        });
        html += '</ul>';
        
        listContainer.innerHTML = html;

        // Add event listeners for study buttons (stub for Phase 5)
        document.querySelectorAll('.study-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slug = e.target.closest('li').dataset.slug;
                console.log("Start study session for:", slug);
                alert("Study session for " + slug + " will be implemented in Phase 5!");
            });
        });

    } catch (error) {
        console.error("Error loading decks:", error);
        document.getElementById('curated-deck-list').innerHTML = '<p>Error loading decks.</p>';
    }
}
