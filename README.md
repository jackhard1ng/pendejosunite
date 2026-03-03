# 🤫 PendejosUnite

**solo dos pendejos saben como entrar y una de la dos es muyyyy guapa**

A secret hangout website for Jack and Lucy

---

## Features

- 🔒 Password-protected access
- 💬 Real-time chat with emojis
- 📌 Pinboard - pin chat messages or upload photos to keep forever
- 📸 Photo, video, and audio sharing
- 🟢 Online/offline status detection
- 🖼️ Your photoshopped pics as floating backgrounds
- 📱 Mobile-friendly design

---

## Setup Guide

### Step 1: Enable Firestore Database

1. In your Firebase project (`lucy-c8e33`), go to **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select a location close to you

### Step 2: Enable Firebase Storage

1. Go to **Build → Storage**
2. Click **"Get started"**
3. Choose **"Start in production mode"**
4. Same location as Firestore

### Step 3: Deploy Security Rules

Go to **Firestore Database → Rules** tab and paste the contents of `firebase/firestore.rules`.

Go to **Storage → Rules** tab and paste the contents of `firebase/storage.rules`.

### Step 4: Add Your Background Photos

Drop your 3 photoshopped pics into the `photos/` folder as:
- `photos/foto1.jpg`
- `photos/foto2.jpg`
- `photos/foto3.jpg`

These will float around as the background on every page.

### Step 5: Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to your repo on GitHub → **Settings → Pages**
3. Under **Source**, select **"Deploy from a branch"**
4. Choose **main** branch and **/ (root)** folder
5. Click **Save**
6. Your site will be live at: `https://yourusername.github.io/pendejosunite/`

---

## How to Use

1. Open the site URL
2. Enter the secret password
3. Choose your name (Jack or Lucy) from the dropdown
4. **Chat** - real-time messaging with emoji picker
5. **Fotos y Más** - upload and share photos, videos, audio
6. **Pinboard** - pin your favorite chat messages or upload photos to keep
7. See if the other person is online via the status indicator

---

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Firebase (Firestore + Storage)
- **Hosting**: GitHub Pages
- **No build tools needed** - just static files!

---

## Password

nice try 😜🤫
