// ── API BASE ROUTE DETECTION ──
const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? (window.location.port === "8000" ? "" : "http://localhost:8000")
  : "http://localhost:8000";

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
    const res = await fetch(`${API_BASE}/api/v1/users/me`, {
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
    const res = await fetch(`${API_BASE}/api/v1/users/birth/month`, {
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
    const res = await fetch(`${API_BASE}/api/v1/users/userinfo`, {
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

    card.innerHTML = `
      <div class="days-badge ${badgeClass}">${badgeText}</div>
      <div class="friend-header">
        ${avatarHtml}
        <div class="friend-meta">
          <h3>${user.fullname}</h3>
          <span class="dob">🎂 ${formattedDob}</span>
        </div>
      </div>
      <div class="friend-body">
        <div class="detail-row">
          <strong>Email:</strong> ${user.email}
        </div>
        ${user.phone_number ? `
        <div class="detail-row">
          <strong>Phone:</strong> ${user.phone_number}
        </div>` : ""}
      </div>
    `;

    grid.appendChild(card);
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
    const res = await fetch(`${API_BASE}/api/v1/users/logout`, {
      method: "POST",
      credentials: "include"
    });

    if (res.ok) {
      window.location.href = "landing_page.html";
    } else {
      alert("Failed to logout. Please try again.");
    }
  } catch (err) {
    console.error("Logout error:", err);
    alert("Connection error. Could not log out.");
  }
});

// Start checks on load
window.addEventListener("DOMContentLoaded", checkAuthentication);
