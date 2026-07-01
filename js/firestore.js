import { db, auth } from './firebase-config.js';
import { collection, doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import summaries from '../data/summaries.json'; 

export async function setupPreloadedDecks() {
    // This populates Firestore with the curated summaries from data/summaries.json
    const summariesRef = collection(db, 'curated_summaries');
    
    // Check if already populated by seeing if the first problem exists
    const checkDoc = await getDoc(doc(summariesRef, 'two-sum'));
    if (checkDoc.exists()) {
        console.log("Curated decks already loaded in Firestore.");
        return;
    }

    console.log("Importing curated summaries to Firestore...");
    // Firestore allows up to 500 writes in a single batch. We have ~225 summaries, so one batch is fine.
    const batch = writeBatch(db);
    
    summaries.forEach((summary) => {
        const docRef = doc(summariesRef, summary.slug);
        batch.set(docRef, summary);
    });

    try {
        await batch.commit();
        console.log("Curated summaries imported successfully.");
    } catch (error) {
        console.error("Error importing summaries:", error);
    }
}

// Stubs for next phases
export async function getUserDecks() {
    if (!auth.currentUser) return [];
    // TODO: Fetch user custom decks
    return [];
}
