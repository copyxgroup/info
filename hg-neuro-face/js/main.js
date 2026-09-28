// ==============================
// main.js – Húngaro (Neuropatia)
// ==============================

// ---------- Configs rápidas ----------
const VIEWER_CONFIG = {
  selector: ".viewer-count",
  start: 1216,       // número inicial mostrado
  min: 1180,         // mínimo da faixa
  max: 1320,         // máximo da faixa
  stepMin: -10,      // variação mínima por tick
  stepMax: 10,       // variação máxima por tick
  intervalMinMs: 900,   // intervalo mínimo entre ticks
  intervalMaxMs: 1800,  // intervalo máximo entre ticks
};

const DEADLINE_CONFIG = {
  selector: ".deadline",
  addDaysFromToday: 0,
  format: "numeric",
};

// ---------- Dados dos comentários (Neuropatia - Húngaro) ----------
let comments = [
  {
    id: 1,
    name: "Kovács László",
    time: "5 perce",
    likes: 132,
    text:
      "Hű, nagyon hülyén érzem magam, amiért nem találtam meg ezt az információt korábban. Végignéztem az egész videót, és végre megértettem, mi okozza a zsibbadást és az idegfájdalmat a lábamban. Köszönöm, hogy megosztották ezt!",
    avatar: "KL",
    liked: false,
    replies: [
      {
        id: 11,
        name: "Nagy Anna",
        time: "34 perce",
        likes: 58,
        text:
          "Én is végignéztem az egész videót, és muszáj beismernem, hogy felnyitotta a szemem. Egyszerű információk, de óriási különbséget jelenthetnek a mindennapokban.",
        avatar: "NA",
        liked: false
      }
    ]
  },

  {
    id: 2,
    name: "Szabó Péter",
    time: "26 perce",
    likes: 102,
    text:
      "A LEGJOBB BEMUTATÓ, AMIT LÁTTAM ÉVEK ÓTA! Éveken át azt hittem, hogy a zsibbadás egyszerűen az öregedés velejárója. A videó megtekintése után teljesen megváltozott a szemléletem.",
      avatar: "SZP",
    liked: false,
    replies: [
      {
        id: 21,
        name: "Tóth Gábor",
        time: "39 perce",
        likes: 61,
        text:
          "Nagyon örülök, hogy rábukkantam erre. Hihetetlen, hogy egy kis odafigyeléssel mennyire visszanyerhető a komfortérzet.",
        avatar: "TG",
        liked: false
      }
    ]
  },

  {
    id: 3,
    name: "Horváth Katalin",
    time: "14 perce",
    likes: 78,
    text:
      "Alkalmaztam a videóban látott tippeket, és ma már sokkal nyugodtabban telnek az éjszakáim zsibbadás nélkül. Kár, hogy nem találtam meg ezt hamarabb.",
    avatar: "HK",
    liked: false
  },

  {
    id: 4,
    name: "Molnár József",
    time: "19 perce",
    likes: 60,
    text:
      "Gratulálok a tartalomhoz! A videó után sokkal bizakodóbb vagyok a jövőt illetően. Köszönöm, hogy egy ilyen fontos témáról beszéltek.",
    avatar: "MJ",
    liked: false
  },

  {
    id: 5,
    name: "Varga István",
    time: "16 perce",
    likes: 146,
    text:
      "Fantasztikus felfedezés. Néhány hét alatt sokkal energikusabbnak éreztem magam, és a végtagjaim sem zsibbadnak úgy, mint régen. Őszintén szólva nem hittem volna.",
    avatar: "VI",
    liked: false,
    replies: [
      {
        id: 51,
        name: "Fekete Zoltán",
        time: "46 perce",
        likes: 63,
        text:
          "Hű, én sem számítottam rá, hogy valami ennyire egyszerű ennyit segít. Valóban nagyon hasznos videó volt!",
        avatar: "FZ",
        liked: false
      }
    ]
  }
];

let commentsCount = 32;

// ---------- Seletores ----------
const commentsList = document.getElementById("commentsList");
const newCommentInput = document.getElementById("newCommentInput");
const postCommentBtn = document.getElementById("postCommentBtn");
const postToFacebookCheckbox = document.getElementById("postToFacebook");
const commentsCountElement = document.getElementById("commentsCount");
const continueBtn = document.getElementById("continueBtn");
const restartBtn = document.getElementById("restartBtn");

// ---------- Helpers UI (avatar/foto) ----------
function renderAvatar(avatar) {
  const isImagePath = typeof avatar === "string" && avatar.includes("/");
  if (isImagePath) {
    return `<img src="${avatar}" alt="" class="comment-avatar-img" loading="lazy" decoding="async">`;
  }
  return `<div class="comment-avatar">${avatar || "U"}</div>`;
}

function renderCommentPhoto(photo) {
  if (!photo) return "";
  return `
    <figure class="comment-photo-wrap">
      <img src="${photo}" alt="" class="comment-photo" loading="lazy" decoding="async">
    </figure>
  `;
}

function commentTemplate(comment, isReply = false) {
  const avatarHTML = renderAvatar(comment.avatar);
  const photoHTML = renderCommentPhoto(comment.photo);

  return `
    <div class="comment-item ${isReply ? "reply" : ""}" data-id="${comment.id}" data-reply="${isReply ? "true" : "false"}">
      ${avatarHTML}
      <div class="comment-content">
        <div class="comment-bubble">
          <h4 class="comment-author">${comment.name}</h4>
          <p class="comment-text">${comment.text}</p>
          ${photoHTML}
        </div>
        <div class="comment-actions">
          <button class="comment-action-btn like-btn ${comment.liked ? "liked" : ""}"
                  type="button"
                  data-comment-id="${comment.id}"
                  data-is-reply="${isReply ? "true" : "false"}">
            <svg class="thumbs-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
            Tetszik
          </button>
          <button class="comment-action-btn reply-btn" type="button" data-comment-id="${comment.id}" data-is-reply="${isReply ? "true" : "false"}">
            Válasz
          </button>
          <span class="comment-likes" data-like-count="${comment.likes}">${comment.likes}</span>
          <span class="comment-time">${comment.time}</span>
        </div>
      </div>
    </div>
  `;
}

function renderCommentsInitial() {
  if (!commentsList) return;
  const fragments = [];
  comments.forEach((c) => {
    fragments.push(commentTemplate(c, false));
    if (c.replies && c.replies.length) {
      c.replies.forEach((r) => fragments.push(commentTemplate(r, true)));
    }
  });
  commentsList.innerHTML = fragments.join("");
  requestAnimationFrame(() => {
    commentsList.querySelectorAll(".comment-item").forEach((el) => el.classList.add("appear"));
  });
}

// ---------- Likes (dados + UI sem piscada) ----------
function toggleLikeInData(commentId, isReply) {
  if (!isReply) {
    const c = comments.find((x) => x.id === commentId);
    if (!c) return null;
    c.liked = !c.liked;
    c.likes += c.liked ? 1 : -1;
    return { liked: c.liked, likes: c.likes };
  } else {
    for (const c of comments) {
      if (Array.isArray(c.replies)) {
        const r = c.replies.find((y) => y.id === commentId);
        if (r) {
          r.liked = !r.liked;
          r.likes += r.liked ? 1 : -1;
          return { liked: r.liked, likes: r.likes };
        }
      }
    }
    return null;
  }
}

function updateLikeUI(commentId, isReply, liked, likes) {
  if (!commentsList) return;
  const replyFlag = isReply ? "true" : "false";

  let item = commentsList.querySelector(`.comment-item[data-id="${commentId}"][data-reply="${replyFlag}"]`);
  if (!item) {
    const btn = commentsList.querySelector(`.like-btn[data-comment-id="${commentId}"][data-is-reply="${replyFlag}"]`);
    if (btn) item = btn.closest(".comment-item");
  }
  if (!item) return;

  const likeBtn = item.querySelector(".like-btn");
  const likeCountEl = item.querySelector(".comment-likes");
  if (likeBtn) likeBtn.classList.toggle("liked", liked);
  if (likeCountEl) {
    likeCountEl.setAttribute("data-like-count", String(likes));
    likeCountEl.textContent = String(likes);
  }
}

// ---------- Postar comentário ----------
function handlePostComment() {
  if (!newCommentInput || !commentsList) return;
  const commentText = newCommentInput.value.trim();
  if (!commentText) return;

  const newComment = {
    id: Date.now(),
    name: "Felhasználó",
    time: "most",
    likes: 0,
    text: commentText,
    avatar: "F",
    liked: false
  };

  comments.unshift(newComment);
  commentsCount++;
  if (commentsCountElement) commentsCountElement.textContent = `${commentsCount} hozzászólás`;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = commentTemplate(newComment, false);
  const element = wrapper.firstElementChild;
  element.classList.add("appear");
  commentsList.prepend(element);

  newCommentInput.value = "";
  if (postToFacebookCheckbox) postToFacebookCheckbox.checked = false;
  if (postCommentBtn) postCommentBtn.disabled = true;
}

function handleInputChange() {
  if (!newCommentInput || !postCommentBtn) return;
  postCommentBtn.disabled = newCommentInput.value.trim().length === 0;
}

// ---------- Viewer Count ----------
function startViewerTicker(config = VIEWER_CONFIG) {
  const el = document.querySelector(config.selector);
  if (!el) return;

  const locale = "hu-HU";
  let current = Number(el.textContent.replace(/\D+/g, "")) || config.start;

  el.textContent = current.toLocaleString(locale);

  const tick = () => {
    const delta = Math.floor(Math.random() * (config.stepMax - config.stepMin + 1)) + config.stepMin;
    let next = current + delta;

    if (next < config.min) next = current + Math.abs(delta);
    if (next > config.max) next = current - Math.abs(delta);

    current = next;
    el.textContent = current.toLocaleString(locale);

    const wait =
      Math.floor(Math.random() * (config.intervalMaxMs - config.intervalMinMs + 1)) + config.intervalMinMs;
    setTimeout(tick, wait);
  };

  setTimeout(tick, config.intervalMinMs);
}

// ---------- Deadline/Data por localidade ----------
function setLocalizedDeadline(config = DEADLINE_CONFIG) {
  const el = document.querySelector(config.selector);
  if (!el) return;

  const locale = "hu-HU";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Budapest";

  const date = new Date();
  date.setDate(date.getDate() + (config.addDaysFromToday || 0));

  const numeric = new Intl.DateTimeFormat(locale, {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  el.textContent = numeric;
}

// ---------- Lazy para imagens com data-src ----------
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  if (!images.length) return;
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        observer.unobserve(img);
      }
    });
  });
  images.forEach((img) => imageObserver.observe(img));
}

// ---------- Boot ----------
document.addEventListener("DOMContentLoaded", () => {
  renderCommentsInitial();
  if (newCommentInput) newCommentInput.addEventListener("input", handleInputChange);
  if (postCommentBtn) postCommentBtn.addEventListener("click", handlePostComment);
  if (newCommentInput) {
    newCommentInput.addEventListener("keypress", (e) => { if (e.key === "Enter") handlePostComment(); });
  }

  if (continueBtn) continueBtn.addEventListener("click", () => alert("Videó funkció: folytatás"));
  if (restartBtn) restartBtn.addEventListener("click", () => alert("Videó funkció: újból"));

  if (commentsList) {
    commentsList.addEventListener("click", (e) => {
      const btn = e.target.closest('.like-btn[data-comment-id]');
      if (!btn) return;
      const commentId = Number(btn.dataset.commentId);
      const isReply = btn.dataset.isReply === "true";
      const result = toggleLikeInData(commentId, isReply);
      if (result) updateLikeUI(commentId, isReply, result.liked, result.likes);
    });
  }

  startViewerTicker(VIEWER_CONFIG);
  setLocalizedDeadline(DEADLINE_CONFIG);
  lazyLoadImages();
});

// Smooth scroll
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  e.preventDefault();
  const id = a.getAttribute("href").slice(1);
  const target = document.getElementById(id);
  if (target) target.scrollIntoView({ behavior: "smooth" });
});
