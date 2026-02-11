
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAjswn3UytMrcz8snV8mpc7fU7cPuLMeGE",
    authDomain: "link-to-qr-app.firebaseapp.com",
    projectId: "link-to-qr-app",
    storageBucket: "link-to-qr-app.firebasestorage.app",
    messagingSenderId: "961158159458",
    appId: "1:961158159458:web:35720eafeb65144b1ec53b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
// const analytics = getAnalytics(app); // Optional: check if window is defined for SSR

export { db, storage, app };

// Helper to save card
export const saveCardToFirebase = async (cardData: any) => {
    try {
        await setDoc(doc(db, "cards", cardData.id), cardData);
        return true;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

// Helper to get card
export const getCardFromFirebase = async (id: string) => {
    const docRef = doc(db, "cards", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        return null;
    }
};

// Helper to update views
export const updateCardViews = async (id: string) => {
    const cardRef = doc(db, "cards", id);
    // This requires the document to exist
    try {
        const docSnap = await getDoc(cardRef);
        if (docSnap.exists()) {
            const currentViews = docSnap.data().views || 0;
            await updateDoc(cardRef, {
                views: currentViews + 1
            });
        }
    } catch (e) {
        console.error("Error updating stats", e);
    }
}
