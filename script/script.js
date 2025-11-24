// === CẤU HÌNH ===
const API_URL = ""; // DÁN API CỦA BẠN VÀO ĐÂY (nếu có), để trống vẫn chạy ngon

// === DOM Elements ===
const btn = document.getElementById('getkey-btn');
const keyBox = document.getElementById('key-box');
const keyDisplay = document.getElementById('generated-key');
const timerEl = document.getElementById('timer');
const copyBtn = document.getElementById('copy-btn');

let countdown;

// === Tạo key + hết hạn 60s ===
async function generateKey() {
  btn.disabled = true;
  btn.textContent = "Generating Key… Please Wait";
  btn.style.background = "#2a2a2a";

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$^*-_";
  let keyPart = "";
  for (let i = 0; i < 12; i++) keyPart += chars.charAt(Math.floor(Math.random() * chars.length));
  const finalKey = "NEXUS_" + keyPart;

  keyDisplay.textContent = finalKey;
  keyBox.classList.add('show');
  btn.style.display = "none";
  autoCopy(finalKey);
  showToast("Key Generated & Copied! Valid for 60 seconds only!");

  // Gửi API (nếu có)
  if (API_URL) {
    try {
      const res = await fetch('https://ipapi.co/json/').catch(() => ({ip:"unknown"}));
      const data = await res.json();
      await fetch(API_URL, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          key: finalKey,
          ip: data.ip || "unknown",
          city: data.city || "unknown",
          expires_at: new Date(Date.now() + 60000).toISOString()
        })
      });
    } catch(e) { console.log("API failed but key still works"); }
  }

  // Đếm ngược 60s
  let timeLeft = 60;
  countdown = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Expires in: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(countdown);
      keyDisplay.textContent = "EXPIRED";
      keyDisplay.classList.add('key-expired');
      timerEl.textContent = "This key has expired";
      copyBtn.disabled = true;
      copyBtn.textContent = "Key Expired";
      showToast("Key has expired!");
    }
  }, 1000);
}

// === Copy to clipboard ===
function autoCopy(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text);
  } else {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed'; el.style.left = '-9999px';
    document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el);
  }
}

function copyKey() {
  if (copyBtn.disabled) return;
  autoCopy(keyDisplay.textContent);
  showToast("Key Copied Again!");
}

// === Toast Notification ===
function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-message').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => toast.classList.remove('show'), 5000);
}

function closeToast() {
  clearTimeout(document.getElementById('toast').timer);
  document.getElementById('toast').classList.remove('show');
}

// === Event ===
btn.addEventListener('click', generateKey);
