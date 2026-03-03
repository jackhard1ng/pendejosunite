# 🤫 PendejosUnite

**Solo dos pendejos saben como entrar y una de la dos es muyyyy guapa**

A secret hangout website for Jack 🇺🇸 and Lucy 🇨🇴

---

## Features

- 🔒 Password-protected access
- 💬 Real-time chat with emojis
- 📸 Photo, video, and audio sharing
- 🟢 Online/offline status detection
- 😂 Joke of the day & language tips
- 📱 Mobile-friendly design
- 🇨🇴❤️🇺🇸 Colombian + US vibes

---

## Setup Guide

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** → name it something like `pendejosunite`
3. Disable Google Analytics (optional, not needed)
4. Click **Create project**

### Step 2: Enable Firestore Database

1. In your Firebase project, go to **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll add rules later)
4. Select a location close to you (e.g., `us-central` or `southamerica-east1` for Colombia)

### Step 3: Enable Firebase Storage

1. Go to **Build → Storage**
2. Click **"Get started"**
3. Choose **"Start in test mode"**
4. Same location as Firestore

### Step 4: Get Your Firebase Config

1. Go to **Project Settings** (gear icon) → **General**
2. Scroll down to **"Your apps"** → click the **Web** icon (`</>`)
3. Register the app (name: `pendejosunite-web`)
4. Copy the `firebaseConfig` object

### Step 5: Add Config to the Code

Open `js/firebase-config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",           // Your actual API key
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 6: Deploy Security Rules

Go to **Firestore Database → Rules** tab and paste the contents of `firebase/firestore.rules`.

Go to **Storage → Rules** tab and paste the contents of `firebase/storage.rules`.

### Step 7: Deploy to GitHub Pages

1. Push this repo to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit - PendejosUnite 🤫"
   git push origin main
   ```

2. Go to your repo on GitHub → **Settings → Pages**
3. Under **Source**, select **"Deploy from a branch"**
4. Choose **main** branch and **/ (root)** folder
5. Click **Save**
6. Wait 1-2 minutes, your site will be live at:
   `https://yourusername.github.io/pendejosunite/`

### Step 8: Add Your Photos

Drop your 4 photos into the `photos/` folder, name them:
- `photos/foto1.jpg`
- `photos/foto2.jpg`
- `photos/foto3.jpg`
- `photos/foto4.jpg`

Then update the photo placeholders in `index.html` (in the Fun Zone section) to point to your images.

---

## Adding Your Photos to the Fun Zone

In `index.html`, find the section with `id="our-photos"` and replace the placeholder divs with:

```html
<img src="photos/foto1.jpg" alt="Jack y Lucy 1">
<img src="photos/foto2.jpg" alt="Jack y Lucy 2">
<img src="photos/foto3.jpg" alt="Jack y Lucy 3">
<img src="photos/foto4.jpg" alt="Jack y Lucy 4">
```

---

## How to Use

1. Open the site URL
2. Enter the secret password
3. Choose your name (Jack or Lucy) from the dropdown
4. Chat in real-time, share media, and have fun!
5. You can see if the other person is online via the status indicator

---

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Firebase (Firestore + Storage)
- **Hosting**: GitHub Pages
- **No build tools needed** - just static files!

---

## Password

The password is... nice try 😜🤫

---

Made with ❤️ by two pendejos who think the world of each other 🇨🇴🇺🇸
