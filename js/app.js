// ============================================
// PendejosUnite - Main Application
// ============================================

// --- Constants ---
const SECRET_PASSWORD = "marica";
const SESSION_KEY = "pendejosunite_auth";
const USER_KEY = "pendejosunite_user";
// --- State ---
let currentUser = localStorage.getItem(USER_KEY) || "Jack";
let selectedFiles = [];
let chatSelectedFile = null;
let pinSelectedFile = null;
let unsubscribeChat = null;
let unsubscribeMedia = null;
let unsubscribePresence = null;
let unsubscribePins = null;
let presenceInterval = null;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let recordingTimer = null;
let recordingSeconds = 0;

// --- Authentication ---
function attemptLogin() {
  const input = document.getElementById("password-input");
  const error = document.getElementById("login-error");

  if (input.value === SECRET_PASSWORD) {
    localStorage.setItem(SESSION_KEY, "true");
    error.classList.add("hidden");
    showApp();
  } else {
    error.classList.remove("hidden");
    input.value = "";
    input.focus();
    error.style.animation = "none";
    error.offsetHeight;
    error.style.animation = "shake 0.5s ease-in-out";
  }
}

function checkAuth() {
  if (localStorage.getItem(SESSION_KEY) === "true") {
    showApp();
  }
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  setOffline();
  if (unsubscribeChat) unsubscribeChat();
  if (unsubscribeMedia) unsubscribeMedia();
  if (unsubscribePresence) unsubscribePresence();
  if (unsubscribePins) unsubscribePins();
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
  initChat();
  initMedia();
  initPresence();
  initPinboard();
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
  document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
  document.querySelector(`.nav-tab[data-tab="${tab}"]`).classList.add("active");

  document.querySelectorAll(".tab-content").forEach(s => {
    s.classList.remove("active");
    s.classList.add("hidden");
  });
  document.getElementById(`${tab}-section`).classList.remove("hidden");
  document.getElementById(`${tab}-section`).classList.add("active");

  if (tab === "chat") {
    scrollChatToBottom();
  }
}

// --- Real-time Chat ---
function initChat() {
  if (unsubscribeChat) unsubscribeChat();

  const messagesDiv = document.getElementById("chat-messages");

  unsubscribeChat = db.collection("messages")
    .orderBy("timestamp", "asc")
    .limitToLast(200)
    .onSnapshot((snapshot) => {
      messagesDiv.innerHTML = "";

      const welcome = document.createElement("div");
      welcome.className = "system-message";
      welcome.textContent = "🤫 Bienvenidos a PendejosUnite - nuestro secreto";
      messagesDiv.appendChild(welcome);

      snapshot.forEach((doc) => {
        const msg = doc.data();
        renderMessage(msg, doc.id, messagesDiv);
      });

      scrollChatToBottom();
    }, (error) => {
      console.error("Chat error:", error);
      messagesDiv.innerHTML = '<div class="system-message">⚠️ Chat offline - check Firebase config</div>';
    });
}

function renderMessage(msg, docId, container) {
  const div = document.createElement("div");
  const senderClass = msg.sender === "Jack" ? "jack" : "lucy";
  div.className = `message ${senderClass}`;

  const time = msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  }) : "...";

  let contentHtml = "";
  if (msg.audioUrl) {
    contentHtml = `<div class="msg-audio"><audio src="${msg.audioUrl}" controls preload="metadata"></audio></div>`;
  } else if (msg.mediaUrl) {
    if (msg.mediaType === "video") {
      contentHtml = `<div class="msg-media"><video src="${msg.mediaUrl}" controls preload="metadata"></video></div>`;
    } else {
      contentHtml = `<div class="msg-media"><img src="${msg.mediaUrl}" alt="" onclick="openLightbox('${msg.mediaUrl}')" loading="lazy"></div>`;
    }
  } else {
    contentHtml = `<div class="msg-text">${escapeHtml(msg.text)}</div>`;
  }

  div.innerHTML = `
    <div class="msg-sender">${escapeHtml(msg.sender)}</div>
    ${contentHtml}
    <div class="msg-bottom">
      <button class="pin-btn" onclick="pinMessage('${docId}')" title="Pin this message">📌</button>
      <span class="msg-time">${time}</span>
    </div>
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

// --- Pin a chat message to the pinboard ---
async function pinMessage(msgDocId) {
  try {
    const msgDoc = await db.collection("messages").doc(msgDocId).get();
    if (!msgDoc.exists) return;

    const msg = msgDoc.data();

    await db.collection("pins").add({
      text: msg.text,
      sender: msg.sender,
      pinnedBy: currentUser,
      type: "chat",
      imageUrl: null,
      originalTimestamp: msg.timestamp,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Quick visual feedback - switch to pinboard
    switchTab("pinboard");
  } catch (error) {
    console.error("Pin error:", error);
    alert("Error pinning message");
  }
}

// --- Online Presence ---
function initPresence() {
  updatePresence();
  presenceInterval = setInterval(updatePresence, 30000);

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
        const isOnline = diffMs < 60000;

        if (isOnline) {
          dot.className = "status-dot online";
          statusText.textContent = "online";
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

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      updatePresence();
    }
  });

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

      const downloadURL = await storageRef.getDownloadURL();

      let mediaType = "image";
      if (file.type.startsWith("video/")) mediaType = "video";
      if (file.type.startsWith("audio/")) mediaType = "audio";

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
      <span class="media-post-user">${escapeHtml(post.sender)}</span>
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

// --- Pinboard ---
function initPinboard() {
  if (unsubscribePins) unsubscribePins();

  unsubscribePins = db.collection("pins")
    .orderBy("timestamp", "desc")
    .limit(100)
    .onSnapshot((snapshot) => {
      const grid = document.getElementById("pinboard-grid");
      grid.innerHTML = "";

      if (snapshot.empty) {
        grid.innerHTML = `
          <div class="pinboard-empty" style="grid-column: 1 / -1;">
            <span>📌</span>
            <p>Nothing pinned yet!</p>
            <p>Pin messages from chat or add photos and notes here.</p>
          </div>
        `;
        return;
      }

      snapshot.forEach((doc) => {
        const pin = doc.data();
        renderPinCard(pin, doc.id, grid);
      });
    }, (error) => {
      console.error("Pinboard error:", error);
    });
}

function renderPinCard(pin, docId, container) {
  const div = document.createElement("div");
  div.className = "pin-card";

  const time = pin.timestamp ? new Date(pin.timestamp.toDate()).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }) : "...";

  const typeLabel = pin.type === "chat" ? "from chat" : "pinned";
  const typeClass = pin.type === "chat" ? "from-chat" : "from-pinboard";

  let imageHtml = "";
  if (pin.imageUrl) {
    imageHtml = `<img class="pin-card-image" src="${pin.imageUrl}" alt="" onclick="openLightbox('${pin.imageUrl}')" loading="lazy">`;
  }

  let textHtml = "";
  if (pin.text) {
    textHtml = `<div class="pin-card-text">${escapeHtml(pin.text)}</div>`;
  }

  div.innerHTML = `
    <button class="pin-card-delete" onclick="deletePin('${docId}')">🗑️</button>
    ${imageHtml}
    <div class="pin-card-body">
      ${textHtml}
      <div class="pin-card-meta">
        <span class="pin-card-sender">${escapeHtml(pin.pinnedBy || pin.sender || "?")}</span>
        <span class="pin-card-type ${typeClass}">${typeLabel}</span>
        <span>${time}</span>
      </div>
    </div>
  `;

  container.appendChild(div);
}

// Handle pin photo file select
function handlePinFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  pinSelectedFile = file;
  const preview = document.getElementById("pin-photo-preview");
  const img = document.getElementById("pin-preview-img");
  img.src = URL.createObjectURL(file);
  preview.classList.remove("hidden");
}

function removePinPreview() {
  pinSelectedFile = null;
  document.getElementById("pin-photo-preview").classList.add("hidden");
  document.getElementById("pin-file-input").value = "";
}

async function submitPin() {
  const textInput = document.getElementById("pin-text-input");
  const text = textInput.value.trim();

  if (!text && !pinSelectedFile) return;

  let imageUrl = null;

  // Upload photo if selected
  if (pinSelectedFile) {
    try {
      const fileName = `pins/${Date.now()}_${pinSelectedFile.name}`;
      const storageRef = storage.ref(fileName);
      await storageRef.put(pinSelectedFile);
      imageUrl = await storageRef.getDownloadURL();
    } catch (error) {
      console.error("Pin upload error:", error);
      alert("Error uploading photo");
      return;
    }
  }

  try {
    await db.collection("pins").add({
      text: text || null,
      sender: currentUser,
      pinnedBy: currentUser,
      type: "pinboard",
      imageUrl: imageUrl,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Reset
    textInput.value = "";
    removePinPreview();
  } catch (error) {
    console.error("Pin submit error:", error);
    alert("Error creating pin");
  }
}

async function deletePin(docId) {
  if (!confirm("Remove this pin? 📌")) return;

  try {
    await db.collection("pins").doc(docId).delete();
  } catch (error) {
    console.error("Delete pin error:", error);
    alert("Error deleting pin");
  }
}

// --- Chat Media (photo/video in chat) ---
function handleChatFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  chatSelectedFile = file;
  const preview = document.getElementById("chat-file-preview");
  const content = document.getElementById("chat-preview-content");
  content.innerHTML = "";

  if (file.type.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    content.appendChild(img);
  } else if (file.type.startsWith("video/")) {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.muted = true;
    content.appendChild(video);
  }

  preview.classList.remove("hidden");
  document.getElementById("chat-input").classList.add("hidden");
  document.querySelector(".chat-input-area > .send-btn").classList.add("hidden");
}

function cancelChatFile() {
  chatSelectedFile = null;
  document.getElementById("chat-file-preview").classList.add("hidden");
  document.getElementById("chat-input").classList.remove("hidden");
  document.querySelector(".chat-input-area > .send-btn").classList.remove("hidden");
  document.getElementById("chat-file-input").value = "";
}

async function sendChatMedia() {
  if (!chatSelectedFile) return;

  const file = chatSelectedFile;
  const fileName = `chat-media/${Date.now()}_${file.name}`;
  const storageRef = storage.ref(fileName);

  try {
    const sendBtns = document.querySelectorAll(".chat-file-preview .send-btn");
    sendBtns.forEach(b => { b.disabled = true; b.textContent = "..."; });

    await storageRef.put(file);
    const downloadURL = await storageRef.getDownloadURL();

    const mediaType = file.type.startsWith("video/") ? "video" : "image";

    await db.collection("messages").add({
      sender: currentUser,
      text: "",
      mediaUrl: downloadURL,
      mediaType: mediaType,
      mediaFileName: fileName,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    cancelChatFile();
    sendBtns.forEach(b => { b.disabled = false; b.textContent = "Enviar"; });
  } catch (error) {
    console.error("Chat media upload error:", error);
    alert("Error subiendo el archivo. Intenta de nuevo.");
    const sendBtns = document.querySelectorAll(".chat-file-preview .send-btn");
    sendBtns.forEach(b => { b.disabled = false; b.textContent = "Enviar"; });
  }
}

// --- Audio Recording ---
async function toggleRecording() {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(track => track.stop());

      if (audioChunks.length === 0) return;

      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      await uploadAndSendAudio(audioBlob);
    };

    mediaRecorder.start();
    isRecording = true;
    recordingSeconds = 0;

    const micBtn = document.getElementById("mic-btn");
    micBtn.classList.add("recording");
    document.getElementById("recording-indicator").classList.remove("hidden");
    document.getElementById("chat-input").classList.add("hidden");
    document.querySelector(".chat-input-area > .send-btn").classList.add("hidden");
    document.querySelector(".chat-media-btns .chat-attach-btn").classList.add("hidden");

    recordingTimer = setInterval(() => {
      recordingSeconds++;
      const mins = Math.floor(recordingSeconds / 60);
      const secs = recordingSeconds % 60;
      document.getElementById("rec-timer").textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
    }, 1000);

  } catch (error) {
    console.error("Mic access error:", error);
    alert("No se pudo acceder al micrófono. Revisa los permisos.");
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  resetRecordingUI();
}

function cancelRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.ondataavailable = null;
    mediaRecorder.onstop = () => {
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    };
    mediaRecorder.stop();
  }
  audioChunks = [];
  resetRecordingUI();
}

function resetRecordingUI() {
  isRecording = false;
  if (recordingTimer) clearInterval(recordingTimer);
  recordingTimer = null;
  recordingSeconds = 0;

  const micBtn = document.getElementById("mic-btn");
  micBtn.classList.remove("recording");
  document.getElementById("recording-indicator").classList.add("hidden");
  document.getElementById("chat-input").classList.remove("hidden");
  document.querySelector(".chat-input-area > .send-btn").classList.remove("hidden");
  document.querySelector(".chat-media-btns .chat-attach-btn").classList.remove("hidden");
  document.getElementById("rec-timer").textContent = "0:00";
}

async function uploadAndSendAudio(audioBlob) {
  const fileName = `audio/${Date.now()}_${currentUser}.webm`;
  const storageRef = storage.ref(fileName);

  try {
    const micBtn = document.getElementById("mic-btn");
    micBtn.disabled = true;
    micBtn.textContent = "...";

    await storageRef.put(audioBlob);
    const downloadURL = await storageRef.getDownloadURL();

    await db.collection("messages").add({
      sender: currentUser,
      text: "",
      audioUrl: downloadURL,
      audioFileName: fileName,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    micBtn.disabled = false;
    micBtn.textContent = "🎙️";
  } catch (error) {
    console.error("Audio upload error:", error);
    alert("Error subiendo el audio. Intenta de nuevo.");
    const micBtn = document.getElementById("mic-btn");
    micBtn.disabled = false;
    micBtn.textContent = "🎙️";
  }
}

// --- Password input enter key ---
document.addEventListener("DOMContentLoaded", () => {
  const pwInput = document.getElementById("password-input");
  if (pwInput) {
    pwInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") attemptLogin();
    });
  }

  checkAuth();
});
