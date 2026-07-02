export async function startStudySession(container, user, deckProblems, allSummaries) {
    if (!deckProblems || deckProblems.length === 0) {
        alert("Deck is empty!");
        return;
    }

    // Load history from localStorage to drive the weighted random logic
    const history = JSON.parse(localStorage.getItem('fleetcode_history') || '{}');

    // Weighted Pseudo-random selection
    function getNextProblem() {
        let totalWeight = 0;
        const weights = deckProblems.map(p => {
            const h = history[p.slug];
            let weight = 40; // Base random floor (~40%)
            if (!h) {
                weight += 60; // Unseen cards highly prioritized
            } else if (h === 'wrong' || h === 'partial') {
                weight += 60; // Cards we struggle with are highly prioritized (~60% higher chance)
            }
            // If h === 'correct', weight remains 40
            totalWeight += weight;
            return weight;
        });

        let randomVal = Math.random() * totalWeight;
        for (let i = 0; i < deckProblems.length; i++) {
            randomVal -= weights[i];
            if (randomVal <= 0) {
                return deckProblems[i];
            }
        }
        return deckProblems[0];
    }
    
    function saveHistory(slug, assessment) {
        history[slug] = assessment;
        localStorage.setItem('fleetcode_history', JSON.stringify(history));
    }
    
    function renderNextCard() {
        const problemData = getNextProblem();
        const summaryData = allSummaries.find(s => s.slug === problemData.slug) || { summary: 'No summary available.', timeComplexity: 'N/A', spaceComplexity: 'N/A' };
        
        renderCardFront(problemData, summaryData);
    }
    
    function renderCardFront(problemData, summaryData) {
        container.innerHTML = `
            <div class="study-view">
                <div class="flashcard front">
                    <div class="card-header">
                        <h2>${problemData.id ? '#' + problemData.id + ' ' : ''}${problemData.title}</h2>
                        <span class="difficulty ${problemData.difficulty ? problemData.difficulty.toLowerCase() : 'unknown'}">${problemData.difficulty || 'Unknown'}</span>
                    </div>
                    <div class="card-body html-content">
                        ${problemData.content}
                    </div>
                    <div class="card-footer">
                        <button id="flip-btn" class="flip-btn">Flip Card</button>
                    </div>
                </div>
                <button id="exit-btn" class="exit-btn">Exit Session</button>
            </div>
        `;
        
        document.getElementById('flip-btn').onclick = () => renderCardBack(problemData, summaryData);
        document.getElementById('exit-btn').onclick = () => window.location.reload();
    }
    
    function renderCardBack(problemData, summaryData) {
        container.innerHTML = `
            <div class="study-view">
                <div class="flashcard back">
                    <div class="card-header">
                        <h2>${problemData.id ? '#' + problemData.id + ' ' : ''}${problemData.title}</h2>
                        <span class="difficulty ${problemData.difficulty ? problemData.difficulty.toLowerCase() : 'unknown'}">${problemData.difficulty || 'Unknown'}</span>
                    </div>
                    <div class="card-body">
                        <h3>Optimal Strategy</h3>
                        <p class="summary-text" style="white-space: pre-wrap;">${summaryData.summary}</p>
                        
                        <div class="complexities">
                            <div class="complexity-badge"><strong>Time:</strong> ${summaryData.timeComplexity}</div>
                            <div class="complexity-badge"><strong>Space:</strong> ${summaryData.spaceComplexity}</div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <h4 style="text-align: center; width: 100%; margin-bottom: 1rem;">How did you do?</h4>
                        <div class="assessment-buttons">
                            <button class="assess-btn wrong" data-val="wrong">❌ No idea</button>
                            <button class="assess-btn partial" data-val="partial">🟡 Partial</button>
                            <button class="assess-btn correct" data-val="correct">✅ Got it</button>
                        </div>
                    </div>
                </div>
                <button id="exit-btn" class="exit-btn">Exit Session</button>
            </div>
        `;
        
        document.querySelectorAll('.assess-btn').forEach(btn => {
            btn.onclick = (e) => {
                const val = e.target.dataset.val;
                saveHistory(problemData.slug, val);
                renderNextCard();
            };
        });
        document.getElementById('exit-btn').onclick = () => window.location.reload();
    }
    
    renderNextCard();
}
