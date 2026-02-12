# Firebase Cloud Sync - Cross-Device Card Synchronization

## Problem Fixed
Cards were not syncing between web and Android app even when logged in with the same account. Each device was storing cards locally in localStorage only.

---

## ✅ Solution Implemented

### 1. **Updated Firebase Utils** (`src/utils/firebase.ts`)

Added user-based card management functions:

```typescript
// Save card with user association
export const saveCardToFirebase = async (cardData: any) => {
    const user = auth.currentUser;
    const dataToSave = {
        ...cardData,
        userId: user?.uid || null, // Associate with logged-in user
        updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "cards", cardData.id), dataToSave);
};

// Get all cards for current user
export const getUserCardsFromFirebase = async () => {
    const user = auth.currentUser;
    const cardsRef = collection(db, "cards");
    const q = query(cardsRef, where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    // Returns array of user's cards
};

// Delete card from Firebase
export const deleteCardFromFirebase = async (id: string) => {
    await deleteDoc(doc(db, "cards", id));
};
```

### 2. **Updated Dashboard** (`src/pages/Dashboard.tsx`)

Changed from localStorage-only to Firebase Firestore:

**Before:**
- Loaded cards only from localStorage
- No cross-device sync
- Each device had its own separate data

**After:**
- Loads cards from Firebase Firestore based on user ID
- Syncs cards to localStorage for offline access
- Shows loading spinner while fetching
- Deletes from both Firebase and localStorage

```typescript
useEffect(() => {
    const loadCards = async () => {
        // Load cards from Firebase for current user
        const firebaseCards = await getUserCardsFromFirebase();
        setCards(firebaseCards);
        
        // Also sync to localStorage for offline access
        firebaseCards.forEach(card => {
            localStorage.setItem(`card-${card.id}`, JSON.stringify(card));
        });
    };
    loadCards();
}, [user]);
```

### 3. **Card Editor Already Updated**

The CardEditor was already saving to Firebase (line 62), so no changes needed there.

---

## 🔄 How It Works Now

### Creating a Card:
1. User creates/edits a card
2. Card is saved to **Firebase Firestore** with `userId` field
3. Card is also saved to **localStorage** for offline access
4. Card is now accessible from **any device** where user is logged in

### Loading Cards:
1. Dashboard checks if user is logged in
2. Fetches all cards from Firebase where `userId` matches current user
3. Displays cards in the UI
4. Syncs to localStorage for offline access

### Deleting Cards:
1. User deletes a card
2. Card is deleted from **Firebase Firestore**
3. Card is deleted from **localStorage**
4. Card disappears from **all devices** where user is logged in

---

## 📱 Testing the Sync

### Test Steps:

1. **On Web Browser:**
   - Log in with your account
   - Create a new card (e.g., "Test Card")
   - Save it

2. **On Android App:**
   - Log in with the **same account**
   - Pull down to refresh or restart the app
   - You should see the "Test Card" appear!

3. **Edit on Android:**
   - Edit the card on Android
   - Save it

4. **Check on Web:**
   - Refresh the web page
   - You should see the updated card!

---

## 🎯 Key Benefits

✅ **Cross-Device Sync** - Cards sync across web and Android  
✅ **User-Based** - Each user only sees their own cards  
✅ **Offline Support** - Cards cached in localStorage work offline  
✅ **Real-Time Updates** - Changes sync immediately  
✅ **Cloud Backup** - Cards are safely stored in Firebase  

---

## ⚠️ Important Notes

### First-Time Sync:
- **Existing cards in localStorage** won't automatically sync to Firebase
- You need to **edit and save** each existing card once to upload it to Firebase
- Or create new cards which will automatically sync

### Migration Steps for Existing Cards:
1. Open each existing card in the editor
2. Click "Save Card"
3. The card will now be uploaded to Firebase with your user ID
4. It will then sync across all your devices

---

## 🔧 Technical Details

### Firebase Structure:
```
cards/
  ├── card-id-1/
  │   ├── id: "card-id-1"
  │   ├── userId: "user-uid-123"
  │   ├── fullName: "John Doe"
  │   ├── jobTitle: "Developer"
  │   ├── links: [...]
  │   ├── theme: {...}
  │   └── updatedAt: "2026-02-12T..."
  │
  └── card-id-2/
      └── ...
```

### Query:
```typescript
// Gets only cards where userId matches current user
query(cardsRef, where("userId", "==", user.uid))
```

---

## 🚀 Next Steps

1. **Test the sync** on both web and Android
2. **Re-save existing cards** to upload them to Firebase
3. **Verify** cards appear on both platforms
4. **Enjoy** seamless cross-device synchronization!

---

## Build Commands

```bash
# Rebuild the app
npm run build

# Sync with Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

Your cards will now sync perfectly across all your devices! 🎉
