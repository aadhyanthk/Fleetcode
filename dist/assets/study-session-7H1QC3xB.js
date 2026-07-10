import{t as e}from"./index-Ae2I5Jzp.js";async function t(t,n,r,i,a){if(!r||r.length===0){alert(`Deck is empty!`);return}let o=JSON.parse(localStorage.getItem(`fleetcode_history`)||`{}`);function s(){let e=0,t=r.map(t=>{let n=o[t.slug],r=40;return n?(n===`wrong`||n===`partial`)&&(r+=60):r+=60,e+=r,r}),n=Math.random()*e;for(let e=0;e<r.length;e++)if(n-=t[e],n<=0)return r[e];return r[0]}function c(e,t){o[e]=t,localStorage.setItem(`fleetcode_history`,JSON.stringify(o))}function l(){let e=s();u(e,i.find(t=>t.slug===e.slug)||{summary:`No summary available.`,timeComplexity:`N/A`,spaceComplexity:`N/A`})}function u(e,n){t.innerHTML=`
            <div class="study-view">
                <div class="flashcard front">
                    <div class="card-header">
                        <h2>${e.id?`#`+e.id+` `:``}${e.title}</h2>
                        <span class="difficulty ${e.difficulty?e.difficulty.toLowerCase():`unknown`}">${e.difficulty||`Unknown`}</span>
                    </div>
                    <div class="card-body html-content">
                        ${e.content}
                    </div>
                    <div class="card-footer">
                        <button id="flip-btn" class="flip-btn">Flip Card</button>
                    </div>
                </div>
                <button id="exit-btn" class="exit-btn">Exit Session</button>
            </div>
        `,document.getElementById(`flip-btn`).onclick=()=>d(e,n),document.getElementById(`exit-btn`).onclick=()=>window.location.reload()}function d(r,i){let o=a[r.slug]||``;t.innerHTML=`
            <div class="study-view">
                <div class="flashcard back">
                    <div class="card-header">
                        <h2>${r.id?`#`+r.id+` `:``}${r.title}</h2>
                        <span class="difficulty ${r.difficulty?r.difficulty.toLowerCase():`unknown`}">${r.difficulty||`Unknown`}</span>
                    </div>
                    <div class="card-body">
                        <h3>Personal Strategy</h3>
                        <textarea id="personal-summary-input" class="custom-summary-input" placeholder="Write your own custom strategy for this problem here...">${o}</textarea>
                        <button id="save-summary-btn" class="save-btn">Save Summary</button>

                        <button class="accordion-btn" id="accordion-toggle">
                            <span>Show Curated Strategy</span>
                            <span id="accordion-icon">▼</span>
                        </button>
                        <div class="accordion-content" id="curated-accordion">
                            <p style="white-space: pre-wrap; font-family: var(--font-sans); line-height: 1.6;">${i.summary}</p>
                            <div class="complexities" style="margin-top: 1.5rem;">
                                <div class="complexity-badge"><strong>Time:</strong> ${i.timeComplexity}</div>
                                <div class="complexity-badge"><strong>Space:</strong> ${i.spaceComplexity}</div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer" style="margin-top: 2rem;">
                        <h4 style="text-align: center; width: 100%; margin-bottom: 1rem;">How did you do?</h4>
                        <div class="assessment-buttons">
                            <button class="assess-btn wrong" data-val="wrong">❌ No idea</button>
                            <button class="assess-btn partial" data-val="partial">🟡 Partial</button>
                            <button class="assess-btn correct" data-val="correct">✅ Got it</button>
                        </div>
                    </div>
                </div>
                <button id="exit-btn" class="exit-btn">Exit Session</button>
                <div id="toast" class="toast">Saved!</div>
            </div>
        `;let s=document.getElementById(`accordion-toggle`),u=document.getElementById(`curated-accordion`),d=document.getElementById(`accordion-icon`);o||(u.classList.add(`open`),d.textContent=`▲`),s.addEventListener(`click`,()=>{let e=u.classList.toggle(`open`);d.textContent=e?`▲`:`▼`}),document.getElementById(`save-summary-btn`).addEventListener(`click`,async()=>{let t=document.getElementById(`personal-summary-input`).value;await e(n.uid,r.slug,t),a[r.slug]=t;let i=document.getElementById(`toast`);i.classList.add(`show`),setTimeout(()=>i.classList.remove(`show`),2e3)}),document.querySelectorAll(`.assess-btn`).forEach(e=>{e.onclick=e=>{let t=e.target.dataset.val;c(r.slug,t),l()}}),document.getElementById(`exit-btn`).onclick=()=>window.location.reload()}l()}export{t as startStudySession};