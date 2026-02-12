# Android App - Business Card Link Fix

## Problems Fixed

### 1. Localhost URLs in QR Codes
The Android app was generating localhost URLs (like `http://localhost:5173/card/123`) which don't work on mobile devices.

### 2. External Links Not Opening
Business card links (LinkedIn, Instagram, etc.) were not opening properly in the Android app because they used `target="_blank"` which doesn't work well in native apps.

## Solutions Applied

### 1. Environment Variable for Base URL
Created `.env` file with production URL:
```
VITE_APP_URL=https://link-to-qr.vercel.app
```

Updated `ShareModal.tsx` to use this URL:
```typescript
const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
const publicUrl = `${baseUrl}/card/${card.id}`;
```

### 2. Capacitor Browser Plugin for Links
Installed `@capacitor/browser` package and updated `CardContent.tsx` to properly handle external links in the Android app:

```typescript
// Detects if running in native app and uses Capacitor Browser
if (Capacitor.isNativePlatform()) {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url: link.url });
} else {
    // Web browser - use normal window.open
    window.open(link.url, '_blank', 'noopener,noreferrer');
}
```

This ensures:
- ✅ Links open in the system browser on Android
- ✅ Links work normally in web browsers
- ✅ mailto: and tel: links work as expected
- ✅ Proper fallback if Capacitor is not available

## Next Steps

### Option 1: Deploy to Vercel (Recommended)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Deploy the app
5. Copy your deployed URL (e.g., `https://your-app.vercel.app`)
6. Update `.env` file with your actual URL:
   ```
   VITE_APP_URL=https://your-actual-url.vercel.app
   ```
7. Rebuild and sync:
   ```bash
   npm run build
   npx cap sync android
   ```

### Option 2: Use Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Deploy: `firebase deploy --only hosting`
5. Update `.env` with your Firebase hosting URL
6. Rebuild and sync:
   ```bash
   npm run build
   npx cap sync android
   ```

## Testing the Android App

1. Open Android Studio:
   ```bash
   npx cap open android
   ```

2. Build and run the app on your device/emulator

3. Create a card and click "Share" - the QR code should now have your deployed URL instead of localhost

## Important Notes

- The `.env` file is already in `.gitignore`, so you'll need to set environment variables in your deployment platform
- For Vercel: Add `VITE_APP_URL` in Project Settings → Environment Variables
- For Firebase: Use Firebase environment config or build-time variables
- The app falls back to `window.location.origin` if the environment variable is not set
