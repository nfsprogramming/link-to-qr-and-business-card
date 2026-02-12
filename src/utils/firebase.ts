
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
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
const auth = getAuth(app);
// const analytics = getAnalytics(app); // Optional: check if window is defined for SSR

export { db, storage, auth, app };

// Helper to save card (with user association)
export const saveCardToFirebase = async (cardData: any) => {
    try {
        const user = auth.currentUser;
        const dataToSave = {
            ...cardData,
            userId: user?.uid || null, // Associate with user
            updatedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, "cards", cardData.id), dataToSave);
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

// Helper to get all cards for current user
export const getUserCardsFromFirebase = async () => {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.warn("No user logged in");
            return [];
        }

        const cardsRef = collection(db, "cards");
        const q = query(cardsRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const cards: any[] = [];
        querySnapshot.forEach((doc) => {
            cards.push({ id: doc.id, ...doc.data() });
        });

        return cards;
    } catch (e) {
        console.error("Error fetching user cards:", e);
        return [];
    }
};

// Helper to delete card
export const deleteCardFromFirebase = async (id: string) => {
    try {
        await deleteDoc(doc(db, "cards", id));
        return true;
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw e;
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
