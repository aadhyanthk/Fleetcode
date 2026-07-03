import { getCuratedSummaries, getCuratedProblems, getUserSummaries, saveUserSummary } from './firestore.js';
import { logout } from './auth.js';

export async function renderDashboardUI(container, user) {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
    } else {
        document.body.classList.add('dark-theme');
    }

    container.innerHTML = `
        <div class="dashboard-view" id="dashboard-root">
            <header class="navbar">
                <h1>Fleetcode</h1>
                <div class="user-info">
                    <button id="theme-toggle-btn" style="background: none; border: none; font-size: 1.2rem; cursor: pointer;">${savedTheme === 'light' ? '🌙' : '☀️'}</button>
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

            <main class="dashboard-main split-layout" id="split-view" style="display: none;">
                <div class="sidebar">
                    <div class="sidebar-header" style="padding: 1.5rem; border-bottom: 1px solid var(--border-color);">
                        <button id="back-btn" class="study-btn" style="background-color: transparent; color: var(--text-primary); border: 1px solid var(--border-color); padding: 8px 12px;">← Back to Decks</button>
                        <h2 id="questions-view-title" style="margin-top: 1rem; margin-bottom: 0;">Deck</h2>
                    </div>
                    <ul class="modern-list" id="questions-list" style="padding: 1rem; overflow-y: auto; max-height: calc(100vh - 180px);"></ul>
                </div>
                <div class="content-pane" id="single-question-content" style="padding: 2rem; overflow-y: auto; max-height: calc(100vh - 70px);">
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);">
                        <p>Select a question from the left to read it here.</p>
                    </div>
                </div>
            </main>
            
            <div id="toast" class="toast">Saved!</div>
        </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', logout);
    
    document.getElementById('theme-toggle-btn').addEventListener('click', (e) => {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        e.target.textContent = isDark ? '☀️' : '🌙';
    });

    document.getElementById('back-btn').addEventListener('click', () => {
        document.getElementById('split-view').style.display = 'none';
        document.getElementById('main-view').style.display = 'block';
    });

    try {
        const [summaries, problems, userSummaries] = await Promise.all([
            getCuratedSummaries(),
            getCuratedProblems(),
            getUserSummaries(user.uid)
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
                // Pass problems, curated summaries, and user summaries
                import('./study-session.js').then(module => {
                    module.startStudySession(container, user, selectedDeckProblems, summaries, userSummaries);
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
                    <li class="modern-card clickable-problem" data-slug="${p.slug}">
                        <span class="problem-title">${p.title}</span>
                        <div class="problem-meta">
                            <span class="problem-id">#${p.id || '?'}</span>
                            <span class="difficulty ${p.difficulty.toLowerCase()}">${p.difficulty}</span>
                        </div>
                    </li>
                `).join('');

                // Reset content pane
                document.getElementById('single-question-content').innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);">
                        <p>Select a question from the left to read it here.</p>
                    </div>
                `;

                // Add click listeners to items
                document.querySelectorAll('.clickable-problem').forEach(item => {
                    item.addEventListener('click', (ev) => {
                        // Remove active class from all, add to clicked
                        document.querySelectorAll('.clickable-problem').forEach(i => i.classList.remove('active'));
                        ev.currentTarget.classList.add('active');

                        const slug = ev.currentTarget.dataset.slug;
                        const problem = deck.data.find(p => p.slug === slug);
                        const curatedSummary = summaries.find(s => s.slug === slug) || { summary: 'No summary available.', timeComplexity: 'N/A', spaceComplexity: 'N/A' };
                        const personalSummary = userSummaries[slug] || '';
                        
                        document.getElementById('single-question-content').innerHTML = `
                            <div class="flashcard" style="box-shadow: none; max-width: 100%;">
                                <div class="card-header">
                                    <h2>#${problem.id} ${problem.title}</h2>
                                    <span class="difficulty ${problem.difficulty.toLowerCase()}">${problem.difficulty}</span>
                                </div>
                                <div class="card-body html-content">
                                    ${problem.content}
                                    <hr style="margin: 2rem 0; border: 1px solid var(--border-color);" />
                                    
                                    <h3>Personal Strategy</h3>
                                    <textarea id="personal-summary-input" class="custom-summary-input" placeholder="Write your own custom strategy for this problem here...">${personalSummary}</textarea>
                                    <button id="save-summary-btn" class="save-btn">Save Summary</button>

                                    <button class="accordion-btn" id="accordion-toggle">
                                        <span>Show Curated Strategy</span>
                                        <span id="accordion-icon">▼</span>
                                    </button>
                                    <div class="accordion-content" id="curated-accordion">
                                        <p style="white-space: pre-wrap; font-family: var(--font-sans); line-height: 1.6;">${curatedSummary.summary}</p>
                                        <div class="complexities" style="margin-top: 1.5rem;">
                                            <div class="complexity-badge"><strong>Time:</strong> ${curatedSummary.timeComplexity}</div>
                                            <div class="complexity-badge"><strong>Space:</strong> ${curatedSummary.spaceComplexity}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;

                        // Handle Accordion
                        const accordionBtn = document.getElementById('accordion-toggle');
                        const accordionContent = document.getElementById('curated-accordion');
                        const accordionIcon = document.getElementById('accordion-icon');
                        
                        // If no personal summary exists, open curated by default
                        if (!personalSummary) {
                            accordionContent.classList.add('open');
                            accordionIcon.textContent = '▲';
                        }

                        accordionBtn.addEventListener('click', () => {
                            const isOpen = accordionContent.classList.toggle('open');
                            accordionIcon.textContent = isOpen ? '▲' : '▼';
                        });

                        // Handle Save
                        document.getElementById('save-summary-btn').addEventListener('click', async () => {
                            const text = document.getElementById('personal-summary-input').value;
                            await saveUserSummary(user.uid, slug, text);
                            userSummaries[slug] = text; // update local cache
                            
                            const toast = document.getElementById('toast');
                            toast.classList.add('show');
                            setTimeout(() => toast.classList.remove('show'), 2000);
                        });
                    });
                });

                document.getElementById('main-view').style.display = 'none';
                document.getElementById('split-view').style.display = 'grid';
            });
        });

    } catch (error) {
        console.error("Error loading decks:", error);
        document.getElementById('deck-grid').innerHTML = '<p>Error loading decks.</p>';
    }
}
