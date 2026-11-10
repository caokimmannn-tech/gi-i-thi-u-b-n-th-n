// Thay địa chỉ mẫu này trước khi đăng website.
const CONTACT_EMAIL = "email-cua-ban@example.com";

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");
const navLinks = [...document.querySelectorAll(".primary-nav a")];
const emailLink = document.querySelector("#email-link");
const emailAddress = document.querySelector("#email-address");
const currentYear = document.querySelector("#current-year");
const musicToggle = document.querySelector("#music-toggle");
const musicLabel = document.querySelector("#music-label");
const musicStatus = document.querySelector("#music-status");
const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 659.25, 880, 783.99,
  659.25, 523.25, 587.33, 659.25, 783.99, 880, 783.99, 659.25];
const activeOscillators = new Set();
let audioContext = null;
let musicTimer = null;
let melodyIndex = 0;
let isMusicPlaying = false;

emailLink.href = `mailto:${CONTACT_EMAIL}`;
emailAddress.textContent = CONTACT_EMAIL;
currentYear.textContent = new Date().getFullYear();

function updateMusicButton(isPlaying) {
  musicLabel.textContent = isPlaying ? "Tắt nhạc" : "Bật nhạc";
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
}

function playTone(frequency, startTime, duration, volume, waveform = "sine") {
  const oscillator = audioContext.createOscillator();
  const envelope = audioContext.createGain();
  oscillator.type = waveform;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  envelope.gain.setValueAtTime(0.0001, startTime);
  envelope.gain.linearRampToValueAtTime(volume, startTime + 0.025);
  envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(envelope);
  envelope.connect(audioContext.destination);
  activeOscillators.add(oscillator);
  oscillator.addEventListener("ended", () => {
    activeOscillators.delete(oscillator);
    oscillator.disconnect();
    envelope.disconnect();
  }, { once: true });
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

function playNextNote() {
  if (!isMusicPlaying || !audioContext) return;

  const frequency = melody[melodyIndex];
  if (frequency) {
    const now = audioContext.currentTime;
    playTone(frequency, now, 0.85, 0.12);
    playTone(frequency * 2, now, 0.42, 0.018, "triangle");
    if (melodyIndex % 4 === 0) {
      playTone(frequency / 2, now, 1.05, 0.035);
    }
  }

  melodyIndex = (melodyIndex + 1) % melody.length;
  musicTimer = window.setTimeout(playNextNote, 620);
}

async function startMusic() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    musicStatus.textContent = "Trình duyệt này chưa hỗ trợ phát nhạc.";
    return;
  }

  if (!audioContext || audioContext.state === "closed") {
    audioContext = new AudioContextClass();
  }
  await audioContext.resume();
  melodyIndex = 0;
  isMusicPlaying = true;
  musicStatus.textContent = "";
  updateMusicButton(true);
  playNextNote();
}

async function stopMusic() {
  isMusicPlaying = false;
  window.clearTimeout(musicTimer);
  musicTimer = null;
  activeOscillators.forEach((oscillator) => {
    try {
      oscillator.stop();
    } catch (error) {
      if (error.name !== "InvalidStateError") throw error;
    }
  });
  activeOscillators.clear();

  const contextToClose = audioContext;
  audioContext = null;
  updateMusicButton(false);
  if (contextToClose && contextToClose.state !== "closed") {
    await contextToClose.close();
  }
}

musicToggle.addEventListener("click", async () => {
  musicToggle.disabled = true;
  try {
    if (isMusicPlaying) {
      await stopMusic();
    } else {
      await startMusic();
    }
  } catch {
    await stopMusic();
    musicStatus.textContent = "Không thể khởi động âm thanh trên trình duyệt này.";
  } finally {
    musicToggle.disabled = false;
  }
});

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  primaryNav.classList.remove("is-open");
}

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  primaryNav.classList.toggle("is-open", !isExpanded);
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menuToggle.focus();
  }
});

const observedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    navLinks.forEach((link) => {
      if (link.getAttribute("href") === `#${entry.target.id}`) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  });
}, { rootMargin: "-30% 0px -60% 0px" });

observedSections.forEach((section) => sectionObserver.observe(section));
