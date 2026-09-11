/* ======================================================
   ✏️  EDIT THIS LINE — her name
   ====================================================== */
const HER_NAME = "Star";
/* ====================================================== */

document.getElementById("her-name").textContent = HER_NAME;
document.querySelector(".footer-name").textContent = HER_NAME;

/* ---------- LOADER STARS (behind the rocket) ---------- */
(function () {
  const wrap = document.getElementById("loaderStars");
  for (let i = 0; i < 70; i++) {
    const s = document.createElement("div");
    s.className = "loader-star";
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.animationDelay = Math.random() * 2.4 + "s";
    wrap.appendChild(s);
  }
})();

/* ---------- SMOKE PUFFS (billowing cloud blobs, not a flat wash) ---------- */
(function buildSmokePuffs() {
  const overlay = document.getElementById("smokeOverlay");
  const count = 18;
  for (let i = 0; i < count; i++) {
    const puff = document.createElement("div");
    puff.className = "smoke-puff";
    const size = 32 + Math.random() * 34; // vw — big, overlapping blobs
    puff.style.width = size + "vw";
    puff.style.height = size + "vw";
    puff.style.left = (Math.random() * 120 - 15) + "%";
    puff.style.top = (Math.random() * 110 - 15) + "%";
    puff.style.transitionDelay = (Math.random() * 0.45).toFixed(2) + "s";
    overlay.appendChild(puff);
  }
})();

/* ---------- MUSIC: play tied directly to the launch tap ---------- */
/* Called first, synchronously, inside the click/touch handler so the
   browser still counts it as a genuine user gesture. Looped, so once
   it starts it keeps playing. If a browser blocks the very first
   attempt, it quietly retries on the next tap anywhere on the page. */
function tryPlayMusic() {
  const audio = document.getElementById("bday-audio");
  const musicToggle = document.getElementById("musicToggle");
  audio.loop = true;
  audio.volume = 0.6;

  const playPromise = audio.play();
  if (playPromise && typeof playPromise.then === "function") {
    playPromise
      .then(() => musicToggle.classList.remove("paused"))
      .catch(() => {
        musicToggle.classList.add("paused");
        const retry = () => {
          audio
            .play()
            .then(() => {
              musicToggle.classList.remove("paused");
              document.removeEventListener("pointerdown", retry);
            })
            .catch(() => {});
        };
        document.addEventListener("pointerdown", retry, { once: true });
      });
  }
}

/* ---------- ROCKET LAUNCH → SMOKE FLOOD → HAZY REVEAL ---------- */
/* Tap ANYWHERE on the intro screen (not a specific button) to launch. */
let launched = false;

function launchSequence() {
  if (launched) return;
  launched = true;

  const introScreen = document.getElementById("intro-screen");
  const rocketWrap = document.getElementById("rocketWrap");
  const introHint = document.getElementById("introHint");
  const smokeOverlay = document.getElementById("smokeOverlay");
  const site = document.getElementById("site-content");

  introScreen.style.cursor = "default";
  introHint.style.opacity = "0";

  // 1. Start the music immediately, first thing, on this exact tap
  tryPlayMusic();

  // 2. Ignite the rocket and let it climb
  rocketWrap.classList.add("launching");

  // 3. As it climbs, smoke floods in and fills the entire screen
  setTimeout(() => {
    smokeOverlay.classList.add("cover");
  }, 900);

  // 4. Once the screen is fully smoked over, reveal the site underneath —
  //    it's still hidden behind the smoke/blur at this point
  setTimeout(() => {
    site.classList.add("revealed");
  }, 2100);

  // 5. Start clearing the smoke: a slow fade + falling blur, so the site
  //    appears hazy first and then comes into full focus
  setTimeout(() => {
    smokeOverlay.classList.remove("cover");
    smokeOverlay.classList.add("clearing");
  }, 2500);

  // 6. Remove the intro screen once everything has cleared
  setTimeout(() => {
    introScreen.style.transition = "opacity 0.4s ease";
    introScreen.style.opacity = "0";
    setTimeout(() => introScreen.remove(), 450);
  }, 5500);
}

document.getElementById("intro-screen").addEventListener("click", launchSequence);
document.getElementById("intro-screen").addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    launchSequence();
  },
  { passive: false }
);

/* ---------- MUSIC TOGGLE ---------- */
const musicToggle = document.getElementById("musicToggle");
musicToggle.addEventListener("click", () => {
  const audio = document.getElementById("bday-audio");
  if (audio.paused) {
    audio.play();
    musicToggle.classList.remove("paused");
  } else {
    audio.pause();
    musicToggle.classList.add("paused");
  }
});

/* ---------- MUTE BACKGROUND MUSIC WHILE THE VIDEO PLAYS ---------- */
(function () {
  const bgAudio = document.getElementById("bday-audio");
  const video = document.getElementById("birthday-video");
  if (!video) return;

  video.addEventListener("play", () => {
    bgAudio.muted = true;
  });
  video.addEventListener("pause", () => {
    bgAudio.muted = false;
  });
  video.addEventListener("ended", () => {
    bgAudio.muted = false;
  });

  // auto-play the video once it's scrolled into view, pause it once it
  // scrolls back out — position is kept, so it resumes where it left off
  const videoScrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {
              // some browsers block unmuted autoplay without a direct
              // click on the video itself — fall back to muted so it
              // still plays, and the visitor can unmute via controls
              video.muted = true;
              video.play().catch(() => {});
            });
          }
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.5 }
  );
  videoScrollObserver.observe(video);
})();

/* ---------- STARFIELD ---------- */
const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d");
let stars = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = document.body.scrollHeight;
  buildStars();
}

function buildStars() {
  const count = Math.floor((canvas.width * canvas.height) / 9000);
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.3 + 0.3,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.015 + 0.005,
  }));
}

function drawStars(t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const s of stars) {
    const twinkle = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(233,232,245,${0.25 + twinkle * 0.6})`;
    ctx.fill();
  }
  requestAnimationFrame(drawStars);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
requestAnimationFrame(drawStars);

/* ---------- MOON: auto-flip every 2.5s + tap to flip (kept separate so they don't collide) ---------- */
const moon = document.getElementById("moon");
let moonFlipped = false;
let moonAutoTimer = null;

function setMoonState(flipped) {
  moonFlipped = flipped;
  moon.classList.toggle("flipped", moonFlipped);
  moon.classList.remove("tapped");
  void moon.offsetWidth; // restart pulse animation
  moon.classList.add("tapped");
}

function autoFlipMoon() {
  setMoonState(!moonFlipped);
}

function startMoonAutoFlip() {
  moonAutoTimer = setInterval(autoFlipMoon, 2500);
}

function restartMoonAutoFlip() {
  clearInterval(moonAutoTimer);
  startMoonAutoFlip();
}

function handleMoonTap() {
  // manual tap always drives the state directly, then resets the auto
  // cycle so it can't fire again right on top of this tap
  setMoonState(!moonFlipped);
  restartMoonAutoFlip();
}

startMoonAutoFlip();

moon.addEventListener("click", handleMoonTap);
moon.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") handleMoonTap();
});

/* ---------- SKY NOTE (rotating sweet line) ---------- */
const skyNoteEl = document.getElementById("sky-note");
const skyNotes = [
  "made of moonlight ✦",
  "wrapped in warm wishes",
  "orbiting around a good day",
  "sprinkled with stardust",
  "a little bit of everything nice",
];
let skyNoteIndex = 0;

setInterval(() => {
  skyNoteEl.classList.add("fading");
  setTimeout(() => {
    skyNoteIndex = (skyNoteIndex + 1) % skyNotes.length;
    skyNoteEl.textContent = skyNotes[skyNoteIndex];
    skyNoteEl.classList.remove("fading");
  }, 500);
}, 3200);

/* ---------- SCROLL REVEAL ---------- */
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.25 }
);
revealEls.forEach((el) => io.observe(el));

/* ---------- SCATTERED LETTERS (drag to move, grab the pin to rotate) ---------- */
let highestZ = 10;

class Paper {
  holding = false;
  rotating = false;
  pointerId = null;
  touchX = 0;
  touchY = 0;
  curX = 0;
  curY = 0;
  prevX = 0;
  prevY = 0;
  velX = 0;
  velY = 0;
  rotation = 0;

  init(paper, handle) {
    // gentle random starting scatter so they don't line up perfectly
    this.rotation = Math.random() * 16 - 8;
    this.curX = Math.random() * 16 - 8;
    this.curY = Math.random() * 12 - 6;
    this.apply(paper);

    const onPointerMove = (e) => {
      if (!this.holding) return;

      if (this.rotating) {
        const dx = e.clientX - this.touchX;
        const dy = e.clientY - this.touchY;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        this.rotation = angle;
      } else {
        this.velX = e.clientX - this.prevX;
        this.velY = e.clientY - this.prevY;
        this.curX += this.velX;
        this.curY += this.velY;
        this.prevX = e.clientX;
        this.prevY = e.clientY;
      }
      this.apply(paper);
    };

    const startMove = (e) => {
      this.holding = true;
      this.pointerId = e.pointerId;
      paper.setPointerCapture(e.pointerId);
      paper.style.zIndex = highestZ++;
      this.prevX = e.clientX;
      this.prevY = e.clientY;
      e.stopPropagation();
    };

    const startRotate = (e) => {
      this.holding = true;
      this.rotating = true;
      this.pointerId = e.pointerId;
      handle.setPointerCapture(e.pointerId);
      paper.style.zIndex = highestZ++;
      this.touchX = e.clientX;
      this.touchY = e.clientY;
      e.stopPropagation();
    };

    const stop = () => {
      this.holding = false;
      this.rotating = false;
    };

    paper.addEventListener("pointerdown", startMove);
    handle.addEventListener("pointerdown", startRotate);
    document.addEventListener("pointermove", onPointerMove);
    paper.addEventListener("pointerup", stop);
    handle.addEventListener("pointerup", stop);
    paper.addEventListener("pointercancel", stop);
  }

  apply(paper) {
    paper.style.transform = `translate(${this.curX}px, ${this.curY}px) rotateZ(${this.rotation}deg)`;
  }
}

document.querySelectorAll(".paper").forEach((paper) => {
  const handle = paper.querySelector(".rotate-handle");
  const p = new Paper();
  p.init(paper, handle);
});

/* ---------- CAKE / CANDLE ---------- */
const cake = document.getElementById("cake");
const flameGroup = document.getElementById("flame-group");
const smokeGroup = document.getElementById("smoke-group");
const cakeCaption = document.getElementById("cake-caption");
let candleLit = true;

cake.addEventListener("click", () => {
  candleLit = !candleLit;
  flameGroup.classList.toggle("out", !candleLit);
  smokeGroup.classList.toggle("show", !candleLit);
  cakeCaption.textContent = candleLit
    ? "tap the flame to blow it out"
    : "wish sent — tap to relight";

  if (!candleLit) {
    // blowing the candle sends a little burst of shooting stars
    for (let i = 0; i < 3; i++) {
      setTimeout(spawnShootingStar, i * 220);
    }
  }
});

/* ---------- SHOOTING STAR (full pass across the sky) ---------- */
function spawnShootingStar() {
  const star = document.createElement("div");
  star.className = "shooting-star";
  document.body.appendChild(star);

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // start just off the top-left-ish edge, travel the full diagonal and beyond
  const startX = -60 - Math.random() * 120;
  const startY = Math.random() * vh * 0.35;
  const dx = vw * 1.25;
  const dy = vh * 0.6 + Math.random() * vh * 0.3;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const duration = 1400 + Math.random() * 500;

  star.style.left = startX + "px";
  star.style.top = startY + "px";
  star.style.transform = `rotate(${angle}deg)`;

  star.animate(
    [
      { transform: `rotate(${angle}deg) translateX(0)`, opacity: 1 },
      { transform: `rotate(${angle}deg) translateX(${Math.hypot(dx, dy)}px)`, opacity: 0 },
    ],
    { duration, easing: "linear" }
  ).onfinish = () => star.remove();
}

/* ---------- AMBIENT SHOOTING STARS ---------- */
// A steady trickle of stars crossing the sky the whole time, no button needed.
function scheduleNextStar() {
  const delay = 1500 + Math.random() * 2000; // every 1.5–3.5s
  setTimeout(() => {
    spawnShootingStar();
    // occasionally send two close together
    if (Math.random() < 0.3) {
      setTimeout(spawnShootingStar, 200 + Math.random() * 300);
    }
    scheduleNextStar();
  }, delay);
}
scheduleNextStar();

/* ---------- SHOOTING STAR BUTTON (big burst on demand) ---------- */
const shootingStarBtn = document.getElementById("shooting-star-btn");
shootingStarBtn.addEventListener("click", () => {
  const burstCount = 28 + Math.floor(Math.random() * 12); // a lot more stars
  for (let i = 0; i < burstCount; i++) {
    setTimeout(spawnShootingStar, i * 80 + Math.random() * 90);
  }
});