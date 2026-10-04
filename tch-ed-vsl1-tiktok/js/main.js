// ==============================
// main.js – com:
// - Likes sem "piscar"
// - Fotos opcionais nos comentários (comment.photo)
// - Contador de espectadores variando em faixa
// - Data/Deadline formatada pela localidade/TimeZone do usuário
// ==============================

// ---------- Configs rápidas ----------
const VIEWER_CONFIG = {
  selector: ".viewer-count",
  start: 1216,      // número inicial mostrado
  min: 1180,        // mínimo da faixa
  max: 1320,        // máximo da faixa
  stepMin: -10,     // variação mínima por tick
  stepMax: 10,      // variação máxima por tick
  intervalMinMs: 900,   // intervalo mínimo entre ticks
  intervalMaxMs: 1800,  // intervalo máximo entre ticks
};

const DEADLINE_CONFIG = {
  selector: ".deadline",
  // 0 = hoje; se quiser "até amanhã", use 1; para 7 dias: 7, etc.
  addDaysFromToday: 0,
  // formato: "auto" usa ordem do país; "numeric" força dd/mm/aaaa para locais latinos, mm/dd/aaaa para en-US etc.
  format: "numeric",
};

// ---------- Data komentářů ----------
let comments = [
  {
    id: 1,
    name: "Tereza Nováková",
    time: "1h",
    likes: 1254,
    text:
      "Dr., začala jsem před 15 dny a výsledky jsou prostě neuvěřitelné. Rozhodla jsem se vydržet, protože to opravdu funguje!",
    avatar: "TN",
    liked: false,
    replies: [
      {
        id: 11,
        name: "Anna Svobodová",
        time: "1h",
        likes: 619,
        text:
          "KONEČNĚ NĚKDO, KDO NECHODÍ KOLEM HORKÉ KAŠE! DĚKUJI!! DNES JSEM ZAČALA A JSEM STRAŠNĚ NADŠENÁ! ❤",
        avatar: "AS",
        liked: false
      },
      {
        id: 12,
        name: "Klára Dvořáková",
        time: "1h",
        likes: 410,
        text:
          "Jak to vysvětlujete, je to tak srozumitelné a přímočaré, přesně tohle jsme potřebovali. Dnes hned tu metodu vyzkouším!",
        avatar: "KD",
        liked: false
      }
    ]
  },

  {
    id: 2,
    name: "Lucie Černá",
    time: "1h",
    likes: 566,
    text:
      "Dělám to už 17 dní a všimla jsem si nejen, že váha jde dolů, ale vidím i neuvěřitelné změny na těle. Byl to opravdový ZLOM! Miluju to!",
    avatar: "LČ",
    liked: false
  },

  {
    id: 3,
    name: "Martina Procházková",
    time: "1h",
    likes: 885,
    text:
      "Jasnost toho videa je neskutečná: žádná omáčka, žádné okecávání. Máte odvahu říct pravdu a ukázat cestu. Skvělé, Dr.!",
    avatar: "MP",
    liked: false
  },

  {
    id: 4,
    name: "Veronika Králová",
    time: "1h",
    likes: 785,
    text:
      "Dr., byla jste pro mě opravdu světlo. Před pár lety jsem procházela nejtěžším obdobím svého života a tehdy jsem se rozhodla, že se konečně začnu věnovat sama sobě a najdu něco, co opravdu funguje. Narazila jsem na vaše video a bylo to jako dar. Sleduji tu metodu teprve 5 dní, ale už se cítím úplně jinak: mám víc energie, jsem motivovanější a výsledky jsou vidět. Nečekala jsem, že se takhle můžu cítit za tak krátkou dobu.",
    avatar: "VK",
    liked: false
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
            Lubię to
          </button>
          <button class="comment-action-btn reply-btn" type="button" data-comment-id="${comment.id}" data-is-reply="${isReply ? "true" : "false"}">
            Odpowiedz
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
    name: "Użytkownik",
    time: "teraz",
    likes: 0,
    text: commentText,
    avatar: "U",
    liked: false
    // photo: "assets/img/imagem01.jpg"
  };

  comments.unshift(newComment);
  commentsCount++;
  if (commentsCountElement) commentsCountElement.textContent = `${commentsCount} komentarze`;

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

// ---------- Viewer Count (variação contínua, faixa e formatação local) ----------
function startViewerTicker(config = VIEWER_CONFIG) {
  const el = document.querySelector(config.selector);
  if (!el) return;

  const locale = navigator.language || "pl-PL";
  let current = Number(el.textContent.replace(/\D+/g, "")) || config.start;

  // Inicial formatação
  el.textContent = current.toLocaleString(locale);

  const tick = () => {
    // passo aleatório entre stepMin e stepMax
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

  const locale = navigator.language || "pl-PL";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  const date = new Date();
  date.setDate(date.getDate() + (config.addDaysFromToday || 0));

  // formato numérico (ex.: 16/09/2025 em pt-BR; 09/16/2025 em en-US)
  const numeric = new Intl.DateTimeFormat(locale, {
    timeZone: tz,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

  // formato com mês por extenso (se um dia você quiser alternar)
  // const long = new Intl.DateTimeFormat(locale, {
  //   timeZone: tz, day: "2-digit", month: "long", year: "numeric"
  // }).format(date);

  el.textContent = numeric;
}

// ---------- Lazy para imagens com data-src (mantido) ----------
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
  // Comentários
  renderCommentsInitial();
  if (newCommentInput) newCommentInput.addEventListener("input", handleInputChange);
  if (postCommentBtn) postCommentBtn.addEventListener("click", handlePostComment);
  if (newCommentInput) {
    newCommentInput.addEventListener("keypress", (e) => { if (e.key === "Enter") handlePostComment(); });
  }

  // Vídeo (placeholder)
  if (continueBtn) continueBtn.addEventListener("click", () => alert("Funkcja wideo: kontynuuj"));
  if (restartBtn) restartBtn.addEventListener("click", () => alert("Funkcja wideo: od nowa"));

  // Likes — delegação
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

  // Viewer count + Deadline localizados
  startViewerTicker(VIEWER_CONFIG);
  setLocalizedDeadline(DEADLINE_CONFIG);

  // Lazy
  lazyLoadImages();
});

// Smooth scroll (links internos)
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  e.preventDefault();
  const id = a.getAttribute("href").slice(1);
  const target = document.getElementById(id);
  if (target) target.scrollIntoView({ behavior: "smooth" });
});
