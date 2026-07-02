import { auth, googleProvider } from './firebase-config.js';
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { setupPreloadedDecks } from './firestore.js';
import { renderDashboardUI } from './dashboard.js';

const appContainer = document.getElementById('app');

export function initAuth() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in.
            console.log("User is signed in:", user.uid);
            renderDashboard(user);
            setupPreloadedDecks();
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
    renderDashboardUI(appContainer, user);
}
