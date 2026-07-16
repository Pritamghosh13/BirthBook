// ── API BASE ROUTE DETECTION ──


let currentUser = null;
let allUsers = [];

// Helper: Calculate days remaining for birthday
function daysLeft(dobString) {
  if (!dobString) return "Not set";

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time for accurate date comparison

  const birthDate = new Date(dobString);
  
  // Create birthday date for this year
  let nextBirthday = new Date(
    today.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );

  // If birthday has passed this year, set to next year
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }

  // Calculate difference in milliseconds, convert to days
  const diffTime = nextBirthday - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

// Helper: Generate Initials
function getInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Helper: Custom gradient based on user name
const gradients = [
  "linear-gradient(135deg, #c084fc 0%, #7c3aed 100%)", // Violet
  "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)", // Sky
  "linear-gradient(135deg, #f472b6 0%, #db2777 100%)", // Pink
  "linear-gradient(135deg, #34d399 0%, #059669 100%)", // Emerald
  "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)"  // Orange
];

function getGradientForName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

// ── AUTH GUARD ──
async function checkAuthentication() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      window.location.href = "log_in.html";
      return;
    }

    const data = await res.json();
    currentUser = data.data;

    setupWelcomeHero();
    checkBirthdayWishWall();
    loadDashboardData();
  } catch (err) {
    console.error("Auth verification failed:", err);
    window.location.href = "log_in.html";
  }
}

// ── SETUP WELCOME HEADER ──
function setupWelcomeHero() {
  if (!currentUser) return;

  const welcomeUser = document.getElementById("welcomeUser");
  const userBirthdayCountdown = document.getElementById("userBirthdayCountdown");
  const currentUserAvatar = document.getElementById("currentUserAvatar");
  const currentUserAvatarFallback = document.getElementById("currentUserAvatarFallback");

  // Welcome message
  welcomeUser.innerText = `Welcome back, ${currentUser.fullname}! 👋`;

  // Countdown message
  if (currentUser.dob) {
    const days = daysLeft(currentUser.dob);
    if (days === 0 || days === 365) {
      userBirthdayCountdown.innerHTML = "🎂 <strong>Happy Birthday to you!</strong> Today is your special day! 🎉";
    } else {
      userBirthdayCountdown.innerHTML = `Only <strong>${days}</strong> days left until your next birthday! 🌟`;
    }
  } else {
    userBirthdayCountdown.innerText = "Setup your birth date in your Profile!";
  }

  // Avatar setting
  if (currentUser.profile_image) {
    currentUserAvatar.src = currentUser.profile_image;
    currentUserAvatar.style.display = "block";
    currentUserAvatarFallback.style.display = "none";
  } else {
    currentUserAvatar.style.display = "none";
    currentUserAvatarFallback.style.display = "flex";
    currentUserAvatarFallback.innerText = getInitials(currentUser.fullname);
    currentUserAvatarFallback.style.background = getGradientForName(currentUser.fullname);
    currentUserAvatarFallback.style.color = "#ffffff";
  }
}

// ── LOAD DASHBOARD RECORDS ──
async function loadDashboardData() {
  await Promise.all([
    fetchUpcomingBirthdays(),
    fetchAllUsers()
  ]);
}

// ── UPCOMING BIRTHDAYS (30 DAYS) ──
async function fetchUpcomingBirthdays() {
  const container = document.getElementById("upcomingContainer");
  const countSpan = document.getElementById("upcomingMonthCount");

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/users/birth/month`, {
      method: "GET",
      credentials: "include"
    });

    if (!res.ok) throw new Error("Failed to load upcoming birthdays");

    const data = await res.json();
    const upcoming = data.data;

    container.innerHTML = "";
    
    // Filter out current user from the list if present, but typically we want to see everyone
    const cleanUpcoming = upcoming.filter(u => u._id !== currentUser._id);
    
    countSpan.innerText = cleanUpcoming.length;

    if (cleanUpcoming.length === 0) {
      container.innerHTML = `<div class="no-records">🎈 No birthdays in the next 30 days!</div>`;
      return;
    }

    cleanUpcoming.forEach(friend => {
      const card = document.createElement("div");
      card.className = "upcoming-card";
      
      const initials = getInitials(friend.fullname);
      const gradient = getGradientForName(friend.fullname);
      
      const avatarHtml = friend.profile_image 
        ? `<div class="friend-avatar"><img src="${friend.profile_image}" alt="${friend.fullname}"></div>`
        : `<div class="friend-avatar" style="background: ${gradient}; color: white;"><div class="friend-avatar-fallback">${initials}</div></div>`;

      const days = daysLeft(friend.dob);

      card.innerHTML = `
        ${avatarHtml}
        <div class="upcoming-meta">
          <h4 style="font-weight: 700; font-size: 0.95rem;">${friend.fullname}</h4>
          <p style="font-size: 0.76rem; color: var(--text-muted);">${new Date(friend.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
          <span style="font-size: 0.72rem; font-weight: 700; color: var(--pink); display: block; margin-top: 2px;">
            ${days === 0 ? "🎂 Today!" : `⏳ ${days} days left`}
          </span>
        </div>
      `;
      container.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="no-records" style="color: #f87171;">⚠️ Failed to load upcoming celebrations</div>`;
  }
}

// ── FETCH ALL FRIENDS ──
async function fetchAllUsers() {
  const grid = document.getElementById("friendsGrid");
  const totalCountSpan = document.getElementById("totalFriendsCount");
  const allCountTag = document.getElementById("allFriendsCountTag");

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/users/userinfo`, {
      method: "GET",
      credentials: "include"
    });

    if (!res.ok) throw new Error("Failed to fetch user list");

    const data = await res.json();
    
    // Sort all friends by days left ascending, excluding current user
    allUsers = data.data
      .filter(u => u._id !== currentUser._id)
      .map(user => ({
        ...user,
        daysRemaining: daysLeft(user.dob)
      }))
      .sort((a, b) => {
        if (typeof a.daysRemaining === "string") return 1;
        if (typeof b.daysRemaining === "string") return -1;
        return a.daysRemaining - b.daysRemaining;
      });

    totalCountSpan.innerText = allUsers.length;
    allCountTag.innerText = `Total: ${allUsers.length}`;

    renderFriendsList(allUsers);

  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div class="no-records" style="color: #f87171;">⚠️ Failed to load friends directory</div>`;
  }
}

// ── RENDER FRIENDS LIST ──
function renderFriendsList(usersList) {
  const grid = document.getElementById("friendsGrid");
  grid.innerHTML = "";

  if (usersList.length === 0) {
    grid.innerHTML = `<div class="no-records">🔍 No matching friends found.</div>`;
    return;
  }

  usersList.forEach(user => {
    const card = document.createElement("div");
    card.className = "friend-card";

    const initials = getInitials(user.fullname);
    const gradient = getGradientForName(user.fullname);
    
    const avatarHtml = user.profile_image
      ? `<div class="friend-avatar"><img src="${user.profile_image}" alt="${user.fullname}"></div>`
      : `<div class="friend-avatar" style="background: ${gradient}; color: white;"><div class="friend-avatar-fallback">${initials}</div></div>`;

    const days = user.daysRemaining;
    let badgeClass = "badge-normal";
    let badgeText = `${days} days left`;

    if (days === "Not set") {
      badgeText = "Not set";
    } else if (days === 0 || days === 365) {
      badgeClass = "badge-today";
      badgeText = "🎂 Today!";
    } else if (days <= 10) {
      badgeClass = "badge-soon";
      badgeText = `⏰ ${days} days`;
    }

    const formattedDob = user.dob 
      ? new Date(user.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : "Not set";

    const isBdayToday = (days === 0 || days === 365);
    const btnText = isBdayToday ? "Wish Happy Birthday 🎂" : "Not Today";
    const disabledAttr = isBdayToday ? "" : "disabled";
    const btnClass = isBdayToday 
      ? "w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border-none font-sans"
      : "w-full mt-4 bg-slate-800/80 text-slate-500 font-semibold py-2.5 px-4 rounded-xl cursor-not-allowed border border-slate-700/50 flex items-center justify-center gap-2 font-sans";

    card.innerHTML = `
      <div class="days-badge ${badgeClass}">${badgeText}</div>
      <div class="friend-header">
        ${avatarHtml}
        <div class="friend-meta">
          <h3>${user.fullname}</h3>
          <span class="dob">🎂 ${formattedDob}</span>
        </div>
      </div>
      <div class="friend-body flex flex-col justify-between h-full">
        <div>
          <div class="detail-row">
            <strong>Email:</strong> ${user.email}
          </div>
          ${user.phone_number ? `
          <div class="detail-row">
            <strong>Phone:</strong> ${user.phone_number}
          </div>` : ""}
        </div>
        <button ${disabledAttr} class="${btnClass}" onclick="openWishModal('${user._id}', '${user.fullname.replace(/'/g, "\\'")}', '${user.profile_image || ''}')">
          ${btnText}
        </button>
      </div>
    `;

    grid.appendChild(card);
  });
}

// ── TOAST NOTIFICATION ──
function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  const toastIcon = document.getElementById("toastIcon");

  toastMessage.innerText = message;
  if (isError) {
    toastIcon.innerText = "❌";
    toast.className = "fixed bottom-8 right-8 z-[2000] transition-all duration-300 ease-out bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg shadow-red-500/20 flex items-center gap-2 pointer-events-none translate-y-0 opacity-100";
  } else {
    toastIcon.innerText = "🎉";
    toast.className = "fixed bottom-8 right-8 z-[2000] transition-all duration-300 ease-out bg-gradient-to-r from-[#10b981] to-[#059669] text-white px-6 py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 pointer-events-none translate-y-0 opacity-100";
  }

  setTimeout(() => {
    toast.className = "fixed bottom-8 right-8 z-[2000] transform translate-y-24 opacity-0 transition-all duration-300 ease-out bg-gradient-to-r from-[#10b981] to-[#059669] text-white px-6 py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 pointer-events-none";
  }, 4000);
}

// ── WISH MODAL CONTROLS ──
function openWishModal(receiverId, friendName, profileImage) {
  const modal = document.getElementById("wishModal");
  const receiverInput = document.getElementById("modalReceiverId");
  const title = document.getElementById("modalTitle");
  const avatarContainer = document.getElementById("modalFriendAvatar");
  const messageInput = document.getElementById("wishMessageInput");
  const charCounter = document.getElementById("charCounter");

  receiverInput.value = receiverId;
  title.innerText = `Today is ${friendName}'s birthday! 🎉`;
  messageInput.value = "";
  charCounter.innerText = "0";

  // Render friend avatar
  const initials = getInitials(friendName);
  const gradient = getGradientForName(friendName);
  
  if (profileImage) {
    avatarContainer.innerHTML = `<img src="${profileImage}" alt="${friendName}" class="w-full h-full object-cover">`;
  } else {
    avatarContainer.style.background = gradient;
    avatarContainer.style.color = "white";
    avatarContainer.innerHTML = `<div class="flex items-center justify-center w-full h-full">${initials}</div>`;
  }

  // Open modal
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeWishModal() {
  const modal = document.getElementById("wishModal");
  modal.classList.remove("flex");
  modal.classList.add("hidden");
}

// Make modal functions globally accessible
window.openWishModal = openWishModal;
window.closeWishModal = closeWishModal;

// Helper: format relative time
function formatTimeRelative(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Helper: render a single wish card markup
function createWishCardHtml(wish) {
  const sender = wish.sender || {};
  const senderName = sender.fullname || "Anonymous";
  const initials = getInitials(senderName);
  const gradient = getGradientForName(senderName);
  const timestamp = wish.createdAt ? formatTimeRelative(wish.createdAt) : "Just now";

  const avatarHtml = sender.profile_image
    ? `<img src="${sender.profile_image}" alt="${senderName}" class="w-10 h-10 rounded-full object-cover flex-shrink-0">`
    : `<div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style="background: ${gradient}; color: white;">${initials}</div>`;

  return `
    <div class="bg-[#161b2c] border border-white/5 rounded-xl p-4 flex gap-3 items-start hover:border-white/10 transition-all font-sans">
      ${avatarHtml}
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <h4 class="font-bold text-slate-200 text-sm truncate">${senderName}</h4>
          <span class="text-[11px] text-slate-500 font-semibold flex-shrink-0">${timestamp}</span>
        </div>
        <p class="text-slate-300 text-sm mt-1 leading-relaxed break-words">${wish.message}</p>
      </div>
    </div>
  `;
}

// ── WISH WALL LOAD AND STATE ──
async function loadWishWall() {
  const container = document.getElementById("wishWallContainer");
  const countSpan = document.getElementById("wishWallCountTag");

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/users/wish/getAll`, {
      method: "GET",
      credentials: "include"
    });

    if (res.status === 400 || res.status === 404) {
      container.innerHTML = `
        <div class="col-span-full text-center p-8 bg-[#161b2c] border border-dashed border-white/10 rounded-xl text-slate-500 font-semibold">
          No birthday wishes yet. 🎈
        </div>
      `;
      countSpan.innerText = "Wishes: 0";
      return;
    }

    if (!res.ok) throw new Error("Failed to load wishes");

    const data = await res.json();
    const wishes = data.data || [];

    countSpan.innerText = `Wishes: ${wishes.length}`;

    if (wishes.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center p-8 bg-[#161b2c] border border-dashed border-white/10 rounded-xl text-slate-500 font-semibold">
          No birthday wishes yet. 🎈
        </div>
      `;
      return;
    }

    container.innerHTML = wishes.map(wish => createWishCardHtml(wish)).join("");

  } catch (err) {
    console.error("Wish wall loading error:", err);
    container.innerHTML = `
      <div class="col-span-full text-center p-8 bg-[#161b2c] border border-dashed border-red-500/20 rounded-xl text-red-400 font-semibold">
        ⚠️ Failed to load your Wish Wall
      </div>
    `;
  }
}

// Check if current user birthday is today
function checkBirthdayWishWall() {
  if (!currentUser || !currentUser.dob) return;

  const today = new Date();
  const dob = new Date(currentUser.dob);
  
  const isBirthday = dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth();

  if (isBirthday) {
    const wishWallSection = document.getElementById("wishWallSection");
    if (wishWallSection) {
      wishWallSection.classList.remove("hidden");
      loadWishWall();
    }
  }
}

// ── SETUP MODAL EVENT LISTENERS ──
function setupModalEventListeners() {
  const closeModalBtn = document.getElementById("closeModalBtn");
  const wishModal = document.getElementById("wishModal");
  const wishForm = document.getElementById("wishForm");
  const messageInput = document.getElementById("wishMessageInput");
  const charCounter = document.getElementById("charCounter");
  const emojiButtons = document.querySelectorAll(".emoji-btn");

  if (!wishModal) return;

  // Close modal click
  closeModalBtn.addEventListener("click", closeWishModal);

  // Close when clicking outside content card
  wishModal.addEventListener("click", (e) => {
    if (e.target === wishModal) {
      closeWishModal();
    }
  });

  // Character counter
  messageInput.addEventListener("input", () => {
    charCounter.innerText = messageInput.value.length;
  });

  // Emoji shortcut click
  emojiButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const emoji = btn.innerText;
      const startPos = messageInput.selectionStart;
      const endPos = messageInput.selectionEnd;
      const text = messageInput.value;
      
      messageInput.value = text.substring(0, startPos) + emoji + text.substring(endPos);
      messageInput.focus();
      
      const newCursorPos = startPos + emoji.length;
      messageInput.setSelectionRange(newCursorPos, newCursorPos);
      charCounter.innerText = messageInput.value.length;
    });
  });

  // Wish Form submit
  wishForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const receiverId = document.getElementById("modalReceiverId").value;
    const message = messageInput.value.trim();
    const sendBtn = document.getElementById("sendWishBtn");

    if (!message) return;

    if (message.length > 300) {
      showToast("Message cannot exceed 300 characters ❌", true);
      return;
    }

    sendBtn.disabled = true;
    sendBtn.innerText = "Sending... ⏳";

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/users/wish/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ receiverId, message })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        closeWishModal();
        showToast("Birthday wish sent successfully! 🎉");

        // Instantly add the wish to local Wish Wall if the recipient is the logged in user
        const wishWallContainer = document.getElementById("wishWallContainer");
        if (wishWallContainer) {
          const localWish = {
            sender: {
              fullname: currentUser.fullname,
              profile_image: currentUser.profile_image
            },
            message: message,
            createdAt: new Date().toISOString()
          };

          const noWishesDiv = wishWallContainer.querySelector(".col-span-full");
          if (noWishesDiv) {
            wishWallContainer.innerHTML = "";
          }

          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = createWishCardHtml(localWish);
          wishWallContainer.insertBefore(tempDiv.firstElementChild, wishWallContainer.firstChild);

          const countSpan = document.getElementById("wishWallCountTag");
          if (countSpan) {
            const currentCount = wishWallContainer.children.length;
            countSpan.innerText = `Wishes: ${currentCount}`;
          }
        }
      } else {
        throw new Error(data.message || "Failed to submit birthday wish");
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Could not send birthday wish ❌", true);
    } finally {
      sendBtn.disabled = false;
      sendBtn.innerText = "Send Wish 🚀";
    }
  });
}

// ── SEARCH FILTER ──
document.getElementById("searchInput").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase().trim();
  
  if (!query) {
    renderFriendsList(allUsers);
    return;
  }

  const filtered = allUsers.filter(user => 
    user.fullname.toLowerCase().includes(query) || 
    user.email.toLowerCase().includes(query)
  );

  renderFriendsList(filtered);
});

// ── LOGOUT TRIGGER ──
document.getElementById("logoutBtn").addEventListener("click", async () => {
  if (!confirm("Are you sure you want to log out?")) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/users/logout`, {
      method: "POST",
      credentials: "include"
    });

    if (res.ok) {
      window.location.href = "index.html";
    } else {
      alert("Failed to logout. Please try again.");
    }
  } catch (err) {
    console.error("Logout error:", err);
    alert("Connection error. Could not log out.");
  }
});

// Start checks on load
window.addEventListener("DOMContentLoaded", () => {
  checkAuthentication();
  setupModalEventListeners();
});

