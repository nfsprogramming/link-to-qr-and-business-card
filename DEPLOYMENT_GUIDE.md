# 🌐 How to Fix "404 Not Found" When Scanning QR Codes

**The Issue:**
Your QR codes currently point to `https://link-to-qr.vercel.app`, which likely doesn't exist or isn't your app.
When you scan this code on another device, it tries to visit a website that isn't there, resulting in a **404 Not Found** error.

**The Solution:**
You need to deploy your app to the internet so other devices can access it.

---

## Option 1: Deploy for Free with Vercel (Recommended)

1.  **Open Terminal** in your project folder.
2.  Run this command to install Vercel CLI:
    ```bash
    npm i -g vercel
    ```
3.  Login to Vercel:
    ```bash
    vercel login
    ```
4.  Deploy your app:
    ```bash
    vercel --prod
    ```
    - Follow the prompts (Keep default settings: `Y` to everything).
5.  **Copy the URL** it gives you (e.g., `https://your-project-name.vercel.app`).

## Option 2: Update Your App Configuration

Once you have your deployed URL (from step 4 above):

1.  Open the file named **`.env`** in your project folder.
2.  Update the `VITE_APP_URL` line with your **actual** deployed URL:
    ```env
    VITE_APP_URL=https://your-actual-project-url.vercel.app
    ```
    *(Make sure there are no trailing slashes `/` at the end)*

## Option 3: Rebuild the Android App

For the changes to take effect in the Android app (so it generates the correct QR codes):

1.  **Rebuild Web Assets:**
    ```bash
    npm run build
    ```
2.  **Sync Android Project:**
    ```bash
    npx cap sync android
    ```
3.  **Build APK in Android Studio:**
    - Build > Build APK(s)
    - Install the new APK on your phone.

---

### 🏠 Testing Locally (Without Deployment)

If you only want to test on devices connected to the **same Wi-Fi**:

1.  Find your computer's **Local IP Address** (e.g., `192.168.1.5`).
    - Windows: Run `ipconfig` in terminal.
2.  Update `.env`:
    ```env
    VITE_APP_URL=http://192.168.1.5:5173
    ```
3.  Start the dev server on your computer:
    ```bash
    npm run dev -- --host
    ```
4.  Rebuild and install the Android app.
5.  **Note:** This only works at home!

---

**Summary:**
To fix the 404 error, you must **deploy your website** first, then update the app to point to that website.
