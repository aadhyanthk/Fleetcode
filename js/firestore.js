import { db, auth } from './firebase-config.js';
import { collection, doc, getDoc, setDoc, getDocs, writeBatch } from 'firebase/firestore';
import summaries from '../data/summaries.json'; 
import problemsData from '../data/problems.json';

export async function setupPreloadedDecks() {
    // This populates Firestore with the curated summaries from data/summaries.json
    const summariesRef = collection(db, 'curated_summaries');
    
    // Check if already populated by seeing if the first problem exists
    const checkSummary = await getDoc(doc(summariesRef, 'two-sum'));
    if (!checkSummary.exists()) {
        console.log("Importing curated summaries to Firestore...");
        const batch = writeBatch(db);
        summaries.forEach((summary) => batch.set(doc(summariesRef, summary.slug), summary));
        try {
            await batch.commit();
            console.log("Curated summaries imported successfully.");
        } catch (error) {
            console.error("Error importing summaries:", error);
        }
    } else {
        console.log("Curated summaries already loaded in Firestore.");
    }

    // Populate Firestore with problems.json
    const problemsRef = collection(db, 'problems');
    const checkProblem = await getDoc(doc(problemsRef, 'two-sum'));
    if (!checkProblem.exists()) {
        console.log("Importing problems to Firestore...");
        const batch = writeBatch(db);
        problemsData.forEach((prob) => batch.set(doc(problemsRef, prob.slug), prob));
        try {
            await batch.commit();
            console.log("Problems imported successfully.");
        } catch (error) {
            console.error("Error importing problems:", error);
        }
    } else {
        console.log("Problems already loaded in Firestore.");
    }
}

// Stubs for next phases
export async function getCuratedSummaries() {
    const summariesRef = collection(db, 'curated_summaries');
    const snapshot = await getDocs(summariesRef);
    const problems = [];
    snapshot.forEach(doc => problems.push(doc.data()));
    // Sort by ID to keep them in order
    problems.sort((a, b) => (a.id || 0) - (b.id || 0));
    return problems;
}

export async function getCuratedProblems() {
    const problemsRef = collection(db, 'problems');
    const snapshot = await getDocs(problemsRef);
    const list = [];
    snapshot.forEach(doc => list.push(doc.data()));
    list.sort((a, b) => (a.id || 0) - (b.id || 0));
    return list;
}

export async function getUserDecks() {
    if (!auth.currentUser) return [];
    // TODO: Fetch user custom decks
    return [];
}
