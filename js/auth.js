import { auth, googleProvider } from './firebase-config.js';
import { signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const appContainer = document.getElementById('app');

export function initAuth() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in.
            console.log("User is signed in:", user.uid);
            renderDashboard(user);
        } else {
            // No user is signed in.
            console.log("No user signed in.");
            renderLogin();
        }
    });
}

export async function login() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log("Logged in as:", result.user.displayName);
    } catch (error) {
        console.error("Login Error:", error);
    }
}

export async function logout() {
    try {
        await signOut(auth);
        console.log("Logged out");
    } catch (error) {
        console.error("Logout Error:", error);
    }
}

function renderLogin() {
    appContainer.innerHTML = `
        <div class="login-view" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
            <h1>Fleetcode</h1>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">Master the patterns, not just the syntax.</p>
            <button id="login-btn" style="padding: 10px 20px; background-color: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 8px; font-weight: 500;">
                Sign in with Google
            </button>
        </div>
    `;
    document.getElementById('login-btn').addEventListener('click', login);
}

function renderDashboard(user) {
    appContainer.innerHTML = `
        <div class="dashboard-view">
            <header style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; border-bottom: 1px solid var(--border-color);">
                <h1 style="color: var(--accent-orange); margin: 0; font-size: 1.5rem;">Fleetcode</h1>
                <div class="user-info" style="display: flex; align-items: center; gap: 1rem;">
                    <span style="font-weight: 500;">${user.displayName}</span>
                    <button id="logout-btn" style="padding: 6px 12px; background-color: transparent; color: var(--text-secondary); border: 1px solid var(--border-color); border-radius: 6px;">Log out</button>
                </div>
            </header>
            <main style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
                <h2>My Dashboard</h2>
                <p style="color: var(--text-secondary);">Decks and progress will go here...</p>
            </main>
        </div>
    `;
    document.getElementById('logout-btn').addEventListener('click', logout);
}
