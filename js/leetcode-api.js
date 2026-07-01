import { db } from './firebase-config.js';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

// We use a CORS proxy because hitting LeetCode directly from the browser blocks the request
const LEETCODE_API_URL = 'https://leetcode.com/graphql';
const PROXY_URL = 'https://corsproxy.io/?' + encodeURIComponent(LEETCODE_API_URL);

export async function getProblemData(titleSlug) {
    // 1. Check Firestore Cache
    const docRef = doc(db, 'problems_cache', titleSlug);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const now = Timestamp.now().toMillis();
        const cachedTime = data.fetchedAt.toMillis();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;

        // If cache is valid (less than 7 days old)
        if (now - cachedTime < sevenDays) {
            console.log("Serving from cache:", titleSlug);
            return data.problemData;
        }
    }

    // 2. Fetch from LeetCode GraphQL
    console.log("Fetching fresh data from LeetCode:", titleSlug);
    const query = `
        query getQuestionDetail($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
                questionId
                questionFrontendId
                title
                content
                exampleTestcases
                sampleTestCase
                difficulty
                topicTags { name }
                hints
            }
        }
    `;

    try {
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables: { titleSlug }
            })
        });

        const json = await response.json();
        const problemData = json.data.question;

        // 3. Save to Firestore Cache with TTL
        await setDoc(docRef, {
            problemData,
            fetchedAt: Timestamp.now()
        });

        return problemData;
    } catch (error) {
        console.error("Error fetching LeetCode data:", error);
        throw error;
    }
}
