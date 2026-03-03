// ============================================
// PendejosUnite - Main Application
// ============================================

// --- Constants ---
const SECRET_PASSWORD = "marica";
const SESSION_KEY = "pendejosunite_auth";
const USER_KEY = "pendejosunite_user";
const EMOJIS = [
  "😂", "🤣", "❤️", "😍", "🥰", "😘", "😜", "🤪", "😎", "🥳",
  "🎉", "🔥", "💯", "👏", "🙌", "💪", "🤝", "👋", "🇨🇴", "🇺🇸",
  "🌮", "🍕", "☕", "🍺", "🎵", "💃", "🕺", "🌴", "🏖️", "✈️",
  "📸", "💬", "🤫", "😈", "👀", "💀", "🫶", "🤗", "😤", "🫣",
  "🐶", "🐱", "🌺", "🌻", "⭐", "🌙", "🎸", "📚", "💡", "🎯"
];

const JOKES = [
  "¿Por qué los colombianos son tan buenos en matemáticas? ¡Porque siempre saben sumar parceros! 🇨🇴😂",
  "Why did the American bring a ladder to the bar? Because the drinks were on the house! 🇺🇸🍺",
  "¿Qué le dijo un pendejo al otro? ¡Nada, porque los dos estaban pensando lo mismo! 😜",
  "How does a gringo say goodbye in Colombia? ¡Chao pescao! 🐟👋",
  "¿Por qué Jack no puede hablar español rápido? Porque se le enreda la lengua con los ñ's 😂",
  "Why did Lucy switch to English? Because Jack's Spanish was giving her a headache! 🤕😂",
  "¿Qué es un pendejo bilingüe? Alguien que dice tonterías en dos idiomas 🤣🌎",
  "Jack tried to say 'I'm embarrassed' in Spanish and said 'Estoy embarazado'... Lucy hasn't stopped laughing 😂😂",
  "¿Cuál es la diferencia entre un parcero y un bro? ¡El acento! 🇨🇴🇺🇸",
  "Why don't secrets last between pendejos? Because they always end up on a secret website! 🤫💻"
];

const SPANISH_TIPS = [
  { word: "¡Qué chimba!", meaning: "That's awesome! (Colombian slang)" },
  { word: "Parcero/a", meaning: "Buddy, close friend (Colombian)" },
  { word: "¿Qué más?", meaning: "What's up? (Colombian greeting)" },
  { word: "Bacano", meaning: "Cool, nice (Colombian)" },
  { word: "Marica", meaning: "Dude/bro (Colombian slang, between friends)" },
  { word: "Rumbear", meaning: "To party (Colombian)" },
  { word: "Berraco/a", meaning: "Awesome, tough, hardworking" },
  { word: "Tenaz", meaning: "Tough/intense (Colombian)" },
  { word: "¡De una!", meaning: "Let's do it! / Right away!" },
  { word: "Parche", meaning: "Hangout group / vibe" },
  { word: "Tinto", meaning: "Black coffee (Colombian)" },
  { word: "Chévere", meaning: "Cool, awesome" },
  { word: "¡No joda!", meaning: "No way! / Come on!" },
  { word: "Gonorrea", meaning: "Expression of surprise (very informal!)" },
  { word: "Te quiero mucho", meaning: "I care about you a lot ❤️" }
];

const ENGLISH_TIPS = [
  { word: "No cap", meaning: "No mentira / En serio (slang)" },
  { word: "Lowkey", meaning: "Un poquito / Secretamente" },
  { word: "Vibe check", meaning: "Revisar la energía/onda" },
  { word: "Slay", meaning: "¡Lo hiciste increíble!" },
  { word: "It's giving...", meaning: "Parece como... / Tiene vibra de..." },
  { word: "Bet", meaning: "¡Dale! / OK (agreement)" },
  { word: "Sus", meaning: "Sospechoso (from 'suspicious')" },
  { word: "GOAT", meaning: "Greatest Of All Time = El/la mejor" },
  { word: "Ghosting", meaning: "Dejar de contestar mensajes 👻" },
  { word: "Chill", meaning: "Relajado/a, tranqui" },
  { word: "Salty", meaning: "Molesto/a, resentido/a" },
  { word: "Flex", meaning: "Presumir / Mostrar algo cool" },
  { word: "Wholesome", meaning: "Tierno, bonito, que da ternura" },
  { word: "I appreciate you", meaning: "Te valoro mucho ❤️" }
];

const PROMPTS = [
  "🎵 Si tu vida fuera una canción, ¿cuál sería y por qué?",
  "🌍 If you could teleport anywhere RIGHT NOW, where would you go?",
  "😂 ¿Cuál es el momento más vergonzoso que has vivido?",
  "🍽️ You can only eat ONE food for the rest of your life. What is it?",
  "🤔 ¿Qué es algo que nunca le has dicho a nadie?",
  "✈️ Dream trip together: where are we going and what are we doing?",
  "📱 Show the last meme you saved on your phone!",
  "🎬 ¿Cuál es tu película favorita y por qué?",
  "💡 What's a skill you wish you had?",
  "🌅 Describe tu día perfecto en Bogotá para Jack",
  "🗽 Describe your perfect day in the US for Lucy",
  "🤫 Tell me a secret... (it stays on this site!)",
  "📚 Teach me a phrase in your language right now!",
  "🎵 Send the link to a song that reminds you of us!",
  "💭 ¿En qué estás pensando ahorita?"
];

// --- State ---
let currentUser = localStorage.getItem(USER_KEY) || "Jack";
let selectedFiles = [];
let typingTimeout = null;
let unsubscribeChat = null;
let unsubscribeMedia = null;
let unsubscribePresence = null;
let presenceInterval = null;

// --- Authentication ---
function attemptLogin() {
  const input = document.getElementById("password-input");
  const error = document.getElementById("login-error");

  if (input.value === SECRET_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, "true");
    error.classList.add("hidden");
    showApp();
  } else {
    error.classList.remove("hidden");
    input.value = "";
    input.focus();
    // Shake animation
    error.style.animation = "none";
    error.offsetHeight; // trigger reflow
    error.style.animation = "shake 0.5s ease-in-out";
  }
}

function checkAuth() {
  if (sessionStorage.getItem(SESSION_KEY) === "true") {
    showApp();
  }
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  setOffline();
  if (unsubscribeChat) unsubscribeChat();
  if (unsubscribeMedia) unsubscribeMedia();
  if (unsubscribePresence) unsubscribePresence();
  if (presenceInterval) clearInterval(presenceInterval);
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("main-app").classList.add("hidden");
}

function showApp() {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("main-app").classList.remove("hidden");

  // Restore user selection
  document.getElementById("user-select").value = currentUser;
  updatePartnerDisplay();

  // Initialize everything
  initEmojiPicker();
  initChat();
  initMedia();
  initPresence();
  initFunZone();
  initDragDrop();
}

// --- User Management ---
function setCurrentUser() {
  currentUser = document.getElementById("user-select").value;
  localStorage.setItem(USER_KEY, currentUser);
  updatePartnerDisplay();
  updatePresence();
}

function getPartner() {
  return currentUser === "Jack" ? "Lucy" : "Jack";
}

function updatePartnerDisplay() {
  document.getElementById("partner-name").textContent = getPartner();
}

// --- Tab Navigation ---
function switchTab(tab) {
  // Update tab buttons
  document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
  document.querySelector(`.nav-tab[data-tab="${tab}"]`).classList.add("active");

  // Update tab content
  document.querySelectorAll(".tab-content").forEach(s => {
    s.classList.remove("active");
    s.classList.add("hidden");
  });
  document.getElementById(`${tab}-section`).classList.remove("hidden");
  document.getElementById(`${tab}-section`).classList.add("active");

  // Scroll chat to bottom when switching to chat
  if (tab === "chat") {
    scrollChatToBottom();
  }
}

// --- Emoji Picker ---
function initEmojiPicker() {
  const grid = document.querySelector(".emoji-grid");
  grid.innerHTML = "";
  EMOJIS.forEach(emoji => {
    const span = document.createElement("span");
    span.textContent = emoji;
    span.onclick = () => insertEmoji(emoji);
    grid.appendChild(span);
  });
}

function toggleEmojiPicker() {
  document.getElementById("emoji-picker").classList.toggle("hidden");
}

function insertEmoji(emoji) {
  const input = document.getElementById("chat-input");
  input.value += emoji;
  input.focus();
  document.getElementById("emoji-picker").classList.add("hidden");
}

// Close emoji picker when clicking outside
document.addEventListener("click", (e) => {
  const picker = document.getElementById("emoji-picker");
  const toggle = document.querySelector(".emoji-toggle");
  if (picker && !picker.contains(e.target) && !toggle.contains(e.target)) {
    picker.classList.add("hidden");
  }
});

// --- Real-time Chat ---
function initChat() {
  if (unsubscribeChat) unsubscribeChat();

  const messagesDiv = document.getElementById("chat-messages");

  // Listen for messages in real-time
  unsubscribeChat = db.collection("messages")
    .orderBy("timestamp", "asc")
    .limitToLast(200)
    .onSnapshot((snapshot) => {
      messagesDiv.innerHTML = "";

      // Add welcome system message
      const welcome = document.createElement("div");
      welcome.className = "system-message";
      welcome.textContent = "🤫 Bienvenidos a PendejosUnite - nuestro secreto 🇨🇴❤️🇺🇸";
      messagesDiv.appendChild(welcome);

      snapshot.forEach((doc) => {
        const msg = doc.data();
        renderMessage(msg, messagesDiv);
      });

      scrollChatToBottom();
    }, (error) => {
      console.error("Chat error:", error);
      // Show offline message
      messagesDiv.innerHTML = '<div class="system-message">⚠️ Chat offline - check Firebase config</div>';
    });
}

function renderMessage(msg, container) {
  const div = document.createElement("div");
  const senderClass = msg.sender === "Jack" ? "jack" : "lucy";
  div.className = `message ${senderClass}`;

  const time = msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  }) : "...";

  div.innerHTML = `
    <div class="msg-sender">${msg.sender} ${msg.sender === "Jack" ? "🇺🇸" : "🇨🇴"}</div>
    <div class="msg-text">${escapeHtml(msg.text)}</div>
    <div class="msg-time">${time}</div>
  `;

  container.appendChild(div);
}

function sendMessage() {
  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  if (!text) return;

  db.collection("messages").add({
    sender: currentUser,
    text: text,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    input.value = "";
    input.focus();
  }).catch((error) => {
    console.error("Error sending message:", error);
    alert("Error sending message. Check Firebase config!");
  });
}

function handleChatKeypress(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

function scrollChatToBottom() {
  const messagesDiv = document.getElementById("chat-messages");
  setTimeout(() => {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, 100);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// --- Online Presence ---
function initPresence() {
  // Update our presence immediately
  updatePresence();

  // Keep updating every 30 seconds
  presenceInterval = setInterval(updatePresence, 30000);

  // Listen for partner's presence
  if (unsubscribePresence) unsubscribePresence();

  unsubscribePresence = db.collection("presence").doc(getPartner())
    .onSnapshot((doc) => {
      const dot = document.getElementById("partner-status-dot");
      const statusText = document.getElementById("partner-status-text");

      if (doc.exists) {
        const data = doc.data();
        const lastSeen = data.lastSeen?.toDate();
        const now = new Date();
        const diffMs = now - lastSeen;
        const isOnline = diffMs < 60000; // Online if seen in last 60 seconds

        if (isOnline) {
          dot.className = "status-dot online";
          statusText.textContent = "online 🟢";
        } else {
          dot.className = "status-dot offline";
          const mins = Math.floor(diffMs / 60000);
          if (mins < 60) {
            statusText.textContent = `${mins}m ago`;
          } else if (mins < 1440) {
            statusText.textContent = `${Math.floor(mins / 60)}h ago`;
          } else {
            statusText.textContent = "offline";
          }
        }
      } else {
        dot.className = "status-dot offline";
        statusText.textContent = "offline";
      }
    }, (error) => {
      console.error("Presence error:", error);
    });

  // Update presence on visibility change
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      updatePresence();
    }
  });

  // Set offline on page close
  window.addEventListener("beforeunload", setOffline);
}

function updatePresence() {
  db.collection("presence").doc(currentUser).set({
    user: currentUser,
    lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
    online: true
  }).catch((error) => {
    console.error("Presence update error:", error);
  });
}

function setOffline() {
  // Use sendBeacon-friendly approach
  db.collection("presence").doc(currentUser).update({
    online: false,
    lastSeen: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(() => {});
}

// --- Media Upload & Feed ---
function initMedia() {
  if (unsubscribeMedia) unsubscribeMedia();

  unsubscribeMedia = db.collection("media")
    .orderBy("timestamp", "desc")
    .limit(50)
    .onSnapshot((snapshot) => {
      const feed = document.getElementById("media-feed");
      feed.innerHTML = "";

      if (snapshot.empty) {
        feed.innerHTML = '<div class="system-message">📸 No hay nada todavía... ¡Sube la primera foto! 🎉</div>';
        return;
      }

      snapshot.forEach((doc) => {
        const post = doc.data();
        renderMediaPost(post, doc.id, feed);
      });
    }, (error) => {
      console.error("Media error:", error);
    });
}

function handleFileSelect(event) {
  selectedFiles = Array.from(event.target.files);
  if (selectedFiles.length === 0) return;

  const preview = document.getElementById("upload-preview");
  const previewContent = document.getElementById("preview-content");
  previewContent.innerHTML = "";

  selectedFiles.forEach(file => {
    if (file.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      previewContent.appendChild(img);
    } else if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.controls = true;
      previewContent.appendChild(video);
    } else if (file.type.startsWith("audio/")) {
      const audio = document.createElement("audio");
      audio.src = URL.createObjectURL(file);
      audio.controls = true;
      previewContent.appendChild(audio);
    }
  });

  preview.classList.remove("hidden");
  document.getElementById("upload-zone").style.display = "none";
}

function cancelUpload() {
  selectedFiles = [];
  document.getElementById("upload-preview").classList.add("hidden");
  document.getElementById("upload-zone").style.display = "block";
  document.getElementById("file-input").value = "";
  document.getElementById("media-caption").value = "";
}

async function uploadMedia() {
  if (selectedFiles.length === 0) return;

  const caption = document.getElementById("media-caption").value.trim();
  const progressDiv = document.getElementById("upload-progress");
  const progressFill = document.getElementById("progress-fill");
  const progressText = document.getElementById("progress-text");

  progressDiv.classList.remove("hidden");
  document.querySelector(".upload-btn").disabled = true;

  for (let i = 0; i < selectedFiles.length; i++) {
    const file = selectedFiles[i];
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = storage.ref(`media/${fileName}`);

    try {
      progressText.textContent = `Subiendo ${i + 1}/${selectedFiles.length}...`;

      // Upload file
      const uploadTask = storageRef.put(file);

      await new Promise((resolve, reject) => {
        uploadTask.on("state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressFill.style.width = progress + "%";
          },
          (error) => reject(error),
          () => resolve()
        );
      });

      // Get download URL
      const downloadURL = await storageRef.getDownloadURL();

      // Determine media type
      let mediaType = "image";
      if (file.type.startsWith("video/")) mediaType = "video";
      if (file.type.startsWith("audio/")) mediaType = "audio";

      // Save to Firestore
      await db.collection("media").add({
        url: downloadURL,
        type: mediaType,
        caption: caption,
        sender: currentUser,
        fileName: fileName,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });

    } catch (error) {
      console.error("Upload error:", error);
      alert(`Error uploading ${file.name}: ${error.message}`);
    }
  }

  // Reset
  progressDiv.classList.add("hidden");
  progressFill.style.width = "0%";
  document.querySelector(".upload-btn").disabled = false;
  cancelUpload();
  progressText.textContent = "¡Subido! 🎉";
}

function renderMediaPost(post, docId, container) {
  const div = document.createElement("div");
  div.className = "media-post";

  const time = post.timestamp ? new Date(post.timestamp.toDate()).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) : "...";

  let mediaContent = "";
  if (post.type === "image") {
    mediaContent = `<img src="${post.url}" alt="${escapeHtml(post.caption || '')}" onclick="openLightbox('${post.url}')" loading="lazy">`;
  } else if (post.type === "video") {
    mediaContent = `<video src="${post.url}" controls preload="metadata"></video>`;
  } else if (post.type === "audio") {
    mediaContent = `<audio src="${post.url}" controls></audio>`;
  }

  div.innerHTML = `
    <div class="media-post-header">
      <span class="media-post-user">${post.sender} ${post.sender === "Jack" ? "🇺🇸" : "🇨🇴"}</span>
      <div>
        <span class="media-post-time">${time}</span>
        <button class="media-post-delete" onclick="deleteMedia('${docId}', '${post.fileName}')">🗑️</button>
      </div>
    </div>
    <div class="media-post-content">${mediaContent}</div>
    ${post.caption ? `<div class="media-post-caption">${escapeHtml(post.caption)}</div>` : ""}
  `;

  container.appendChild(div);
}

async function deleteMedia(docId, fileName) {
  if (!confirm("¿Seguro que quieres borrar esto? 🤔")) return;

  try {
    await db.collection("media").doc(docId).delete();
    if (fileName) {
      await storage.ref(`media/${fileName}`).delete().catch(() => {});
    }
  } catch (error) {
    console.error("Delete error:", error);
    alert("Error deleting media");
  }
}

// --- Lightbox ---
function openLightbox(url) {
  const overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.onclick = () => overlay.remove();
  overlay.innerHTML = `<img src="${url}">`;
  document.body.appendChild(overlay);
}

// --- Drag and Drop ---
function initDragDrop() {
  const zone = document.getElementById("upload-zone");

  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("drag-over");
  });

  zone.addEventListener("dragleave", () => {
    zone.classList.remove("drag-over");
  });

  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("drag-over");
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      document.getElementById("file-input").files = files;
      handleFileSelect({ target: { files: files } });
    }
  });
}

// --- Fun Zone ---
function initFunZone() {
  getNewJoke();
  newSpanishTip();
  newEnglishTip();
  newPrompt();
}

function getNewJoke() {
  const joke = JOKES[Math.floor(Math.random() * JOKES.length)];
  document.getElementById("joke-text").textContent = joke;
}

function newSpanishTip() {
  const tip = SPANISH_TIPS[Math.floor(Math.random() * SPANISH_TIPS.length)];
  document.getElementById("spanish-word").textContent = tip.word;
  document.getElementById("spanish-meaning").textContent = tip.meaning;
}

function newEnglishTip() {
  const tip = ENGLISH_TIPS[Math.floor(Math.random() * ENGLISH_TIPS.length)];
  document.getElementById("english-word").textContent = tip.word;
  document.getElementById("english-meaning").textContent = tip.meaning;
}

function newPrompt() {
  const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
  document.getElementById("conversation-prompt").textContent = prompt;
}

// --- Password input enter key ---
document.addEventListener("DOMContentLoaded", () => {
  const pwInput = document.getElementById("password-input");
  if (pwInput) {
    pwInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") attemptLogin();
    });
  }

  // Check if already authenticated
  checkAuth();
});
