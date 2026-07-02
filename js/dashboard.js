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
                <h2>My Decks</h2>
                <div class="deck-grid" id="deck-grid">
                    <div class="deck-card">
                        <div class="deck-info">
                            <h3>LeetCode Curated Master</h3>
                            <p id="curated-count" style="color: var(--text-secondary);">Loading cards...</p>
                        </div>
                        <button id="study-curated-btn" class="study-btn" disabled>Loading...</button>
                    </div>
                </div>
            </main>
        </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', logout);

    try {
        const problems = await getCuratedSummaries();
        
        const countEl = document.getElementById('curated-count');
        const studyBtn = document.getElementById('study-curated-btn');
        
        countEl.textContent = `${problems.length} cards`;
        studyBtn.textContent = 'Study Now';
        studyBtn.disabled = false;

        studyBtn.addEventListener('click', () => {
            // Lazy load the study session module and start
            import('./study-session.js').then(module => {
                module.startStudySession(container, user, problems);
            });
        });

    } catch (error) {
        console.error("Error loading decks:", error);
        document.getElementById('curated-count').textContent = 'Error loading deck.';
    }
}
