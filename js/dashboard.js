import { getCuratedSummaries, getCuratedProblems } from './firestore.js';
import { logout } from './auth.js';

export async function renderDashboardUI(container, user) {
    container.innerHTML = `
        <div class="dashboard-view" id="dashboard-root">
            <header class="navbar">
                <h1>Fleetcode</h1>
                <div class="user-info">
                    <span>${user.displayName}</span>
                    <button id="logout-btn">Log out</button>
                </div>
            </header>
            
            <main class="dashboard-main" id="main-view">
                <h2>My Decks</h2>
                <div class="deck-grid" id="deck-grid">
                    <p style="text-align: center; color: var(--text-secondary); width: 100%;">Loading decks...</p>
                </div>
            </main>

            <main class="dashboard-main" id="questions-view" style="display: none;">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
                    <button id="back-btn" class="study-btn" style="background-color: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color);">← Back</button>
                    <h2 id="questions-view-title" style="margin: 0;">Deck</h2>
                </div>
                <ul class="problem-list" id="questions-list"></ul>
            </main>
        </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('back-btn').addEventListener('click', () => {
        document.getElementById('questions-view').style.display = 'none';
        document.getElementById('main-view').style.display = 'block';
    });

    try {
        const [summaries, problems] = await Promise.all([
            getCuratedSummaries(),
            getCuratedProblems()
        ]);
        
        // Build decks from problems data
        const decks = [
            { id: 'blind75', name: 'Blind 75', data: [] },
            { id: 'neetcode150', name: 'NeetCode 150', data: [] },
            { id: 'grind169', name: 'Grind 169', data: [] }
        ];

        problems.forEach(prob => {
            if (prob.decks && prob.decks.includes('blind75')) decks[0].data.push(prob);
            if (prob.decks && prob.decks.includes('neetcode150')) decks[1].data.push(prob);
            if (prob.decks && prob.decks.includes('grind169')) decks[2].data.push(prob);
        });

        const deckGrid = document.getElementById('deck-grid');
        deckGrid.innerHTML = ''; // clear loading text

        decks.forEach(deck => {
            const cardHTML = `
                <div class="deck-card" id="deck-card-${deck.id}">
                    <div class="deck-info">
                        <h3>${deck.name}</h3>
                        <p style="color: var(--text-secondary);">${deck.data.length} cards</p>
                    </div>
                    <div class="deck-actions" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button class="study-btn" data-deck-id="${deck.id}" style="flex: 1;">Study Now</button>
                        <button class="view-btn" data-deck-id="${deck.id}" style="padding: 6px 12px; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); cursor: pointer;">View Questions</button>
                    </div>
                </div>
            `;
            deckGrid.insertAdjacentHTML('beforeend', cardHTML);
        });

        // Event Listeners for Study Now
        document.querySelectorAll('.study-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const deckId = e.target.dataset.deckId;
                if (!deckId) return; // ignore back button
                const selectedDeckProblems = decks.find(d => d.id === deckId).data;
                // Pass both problems and summaries to study session
                import('./study-session.js').then(module => {
                    module.startStudySession(container, user, selectedDeckProblems, summaries);
                });
            });
        });

        // Event Listeners for View Questions
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const deckId = e.target.dataset.deckId;
                const deck = decks.find(d => d.id === deckId);
                
                document.getElementById('questions-view-title').textContent = deck.name;
                const listContainer = document.getElementById('questions-list');
                
                listContainer.innerHTML = deck.data.map(p => `
                    <li class="problem-item" data-slug="${p.slug}">
                        <div class="problem-info">
                            <span class="problem-id">#${p.id || '?'}</span>
                            <span class="problem-title">${p.title}</span>
                            <span class="difficulty ${p.difficulty.toLowerCase()}" style="margin-left: 1rem; font-size: 0.75rem;">${p.difficulty}</span>
                        </div>
                    </li>
                `).join('');

                document.getElementById('main-view').style.display = 'none';
                document.getElementById('questions-view').style.display = 'block';
            });
        });

    } catch (error) {
        console.error("Error loading decks:", error);
        document.getElementById('deck-grid').innerHTML = '<p>Error loading decks.</p>';
    }
}
