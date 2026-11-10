// Thay địa chỉ mẫu này trước khi đăng website.
const CONTACT_EMAIL = "email-cua-ban@example.com";

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");
const navLinks = [...document.querySelectorAll(".primary-nav a")];
const emailLink = document.querySelector("#email-link");
const emailAddress = document.querySelector("#email-address");
const currentYear = document.querySelector("#current-year");
const backgroundMusic = document.querySelector("#background-music");
const musicToggle = document.querySelector("#music-toggle");
const musicLabel = document.querySelector("#music-label");
const musicStatus = document.querySelector("#music-status");
let statusTimeout;

emailLink.href = `mailto:${CONTACT_EMAIL}`;
emailAddress.textContent = CONTACT_EMAIL;
currentYear.textContent = new Date().getFullYear();
backgroundMusic.volume = 0.2;

function updateMusicButton(isPlaying) {
  musicLabel.textContent = isPlaying ? "Tắt nhạc" : "Bật nhạc";
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
}

function showMusicMessage(message) {
  musicStatus.textContent = message;
  window.clearTimeout(statusTimeout);
  statusTimeout = window.setTimeout(() => {
    musicStatus.textContent = "";
  }, 5000);
}

musicToggle.addEventListener("click", async () => {
  if (!backgroundMusic.paused) {
    backgroundMusic.pause();
    return;
  }

  musicToggle.disabled = true;
  try {
    await backgroundMusic.play();
  } catch {
    updateMusicButton(false);
    showMusicMessage("Không phát được nhạc. Hãy kiểm tra tệp assets/background-music.mp3.");
  } finally {
    musicToggle.disabled = false;
  }
});

backgroundMusic.addEventListener("play", () => {
  updateMusicButton(true);
  musicStatus.textContent = "";
  window.clearTimeout(statusTimeout);
});
backgroundMusic.addEventListener("pause", () => updateMusicButton(false));
backgroundMusic.addEventListener("ended", () => updateMusicButton(false));
backgroundMusic.addEventListener("error", () => {
  updateMusicButton(false);
  showMusicMessage("Không tìm thấy hoặc không phát được tệp nhạc nền.");
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
