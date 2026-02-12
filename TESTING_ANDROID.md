# Testing the Android App Fixes

## What Was Fixed
1. ✅ QR codes now show proper URLs (not localhost)
2. ✅ Business card links (LinkedIn, Instagram, etc.) now open correctly in Android

## How to Test

### Step 1: Open the Android App
```bash
npx cap open android
```

### Step 2: Build and Run
1. In Android Studio, click the green "Run" button
2. Select your device/emulator
3. Wait for the app to install and launch

### Step 3: Test QR Code URLs
1. Create or open a business card
2. Click the "Share" button (QR code icon)
3. **Check the URL below the QR code**
   - ❌ BAD: `http://localhost:5173/card/abc123`
   - ✅ GOOD: `https://link-to-qr.vercel.app/card/abc123`

### Step 4: Test External Links
1. View a business card (click the eye icon or scan a QR code)
2. Click on any external link (LinkedIn, Instagram, website, etc.)
3. **Expected behavior:**
   - Link should open in the Android system browser
   - You should be able to navigate back to the app
   - The link should actually load (not show an error)

### Step 5: Test Other Link Types
1. **Email links** (mailto:) - Should open email app
2. **Phone links** (tel:) - Should open phone dialer
3. **Copy-only fields** - Should copy to clipboard

## Troubleshooting

### If QR codes still show localhost:
1. Make sure you deployed the app to Vercel/Firebase
2. Update `.env` with your actual deployed URL
3. Rebuild: `npm run build`
4. Sync: `npx cap sync android`
5. Rebuild in Android Studio

### If links don't open:
1. Check Android permissions in `AndroidManifest.xml`
2. Make sure `@capacitor/browser` is installed
3. Check the Android Logcat for errors
4. Try uninstalling and reinstalling the app

### If you see TypeScript errors:
Run: `npm install @capacitor/browser`

## Expected Results
✅ All external links open in system browser  
✅ QR codes show your deployed URL  
✅ Email/phone links work natively  
✅ App works both online and offline (for local data)

## Notes
- The app will use your deployed URL for sharing
- Links will open in the system browser (not in-app)
- This is the recommended approach for Capacitor apps
- Web version continues to work normally with `window.open`
