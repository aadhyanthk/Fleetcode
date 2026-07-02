import { getProblemData } from './leetcode-api.js';

export async function startStudySession(container, user, deckProblems) {
    if (!deckProblems || deckProblems.length === 0) {
        alert("Deck is empty!");
        return;
    }

    // Weighted Pseudo-random selection (Phase 5 requirement)
    // For now, pure random as a baseline until history is integrated
    function getNextProblem() {
        const randomIndex = Math.floor(Math.random() * deckProblems.length);
        return deckProblems[randomIndex];
    }
    
    async function renderNextCard() {
        container.innerHTML = `
            <div class="study-view loading-view">
                <div class="spinner"></div>
                <p>Loading next problem from LeetCode...</p>
            </div>
        `;
        
        const problemSummary = getNextProblem();
        
        try {
            const fullData = await getProblemData(problemSummary.slug);
            renderCardFront(problemSummary, fullData);
        } catch (error) {
            container.innerHTML = `
                <div class="study-view error-view">
                    <p>Error loading problem details.</p>
                    <button id="next-btn" class="study-btn">Skip to Next</button>
                    <button id="exit-btn" class="exit-btn">Exit Session</button>
                </div>
            `;
            document.getElementById('next-btn').onclick = renderNextCard;
            document.getElementById('exit-btn').onclick = () => window.location.reload();
        }
    }
    
    function renderCardFront(summary, fullData) {
        container.innerHTML = `
            <div class="study-view">
                <div class="flashcard front">
                    <div class="card-header">
                        <h2>${summary.id ? '#' + summary.id + ' ' : ''}${summary.title}</h2>
                        <span class="difficulty ${fullData.difficulty ? fullData.difficulty.toLowerCase() : 'unknown'}">${fullData.difficulty || 'Unknown'}</span>
                    </div>
                    <div class="card-body html-content">
                        ${fullData.content}
                    </div>
                    <div class="card-footer">
                        <button id="flip-btn" class="flip-btn">Flip Card</button>
                    </div>
                </div>
                <button id="exit-btn" class="exit-btn">Exit Session</button>
            </div>
        `;
        
        document.getElementById('flip-btn').onclick = () => renderCardBack(summary, fullData);
        document.getElementById('exit-btn').onclick = () => window.location.reload();
    }
    
    function renderCardBack(summary, fullData) {
        container.innerHTML = `
            <div class="study-view">
                <div class="flashcard back">
                    <div class="card-header">
                        <h2>${summary.id ? '#' + summary.id + ' ' : ''}${summary.title}</h2>
                        <span class="difficulty ${fullData.difficulty ? fullData.difficulty.toLowerCase() : 'unknown'}">${fullData.difficulty || 'Unknown'}</span>
                    </div>
                    <div class="card-body">
                        <h3>Optimal Strategy</h3>
                        <p class="summary-text">${summary.summary}</p>
                        
                        <div class="complexities">
                            <div class="complexity-badge"><strong>Time:</strong> ${summary.timeComplexity}</div>
                            <div class="complexity-badge"><strong>Space:</strong> ${summary.spaceComplexity}</div>
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
                console.log("Assessed as:", val);
                // TODO: Save history to Firestore (Phase 5/6)
                renderNextCard();
            };
        });
        document.getElementById('exit-btn').onclick = () => window.location.reload();
    }
    
    renderNextCard();
}
