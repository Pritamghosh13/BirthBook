// ── API BASE ROUTE DETECTION ──
const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? (window.location.port === "8000" ? "" : "http://localhost:8000")
  : "http://localhost:8000";

let currentUser = null;

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

// Toast helper
function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.className = "toast show";
  if (isError) toast.classList.add("error");

  setTimeout(() => {
    toast.className = "toast";
  }, 4000);
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

    populateProfile();
  } catch (err) {
    console.error("Auth check error:", err);
    window.location.href = "log_in.html";
  }
}

// ── POPULATE FORM & HEADER ──
function populateProfile() {
  if (!currentUser) return;

  // Header / Aside info
  document.getElementById("summaryName").innerText = currentUser.fullname;
  document.getElementById("summaryEmail").innerText = currentUser.email;
  
  if (currentUser.createdAt) {
    document.getElementById("userJoinDate").innerText = new Date(currentUser.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Set avatar preview
  const imgPreview = document.getElementById("profileImagePreview");
  const fallback = document.getElementById("avatarFallback");
  const removeBtn = document.getElementById("deleteAvatarBtn");

  if (currentUser.profile_image) {
    imgPreview.src = currentUser.profile_image;
    imgPreview.style.display = "block";
    fallback.style.display = "none";
    removeBtn.style.display = "inline-block";
  } else {
    imgPreview.style.display = "none";
    fallback.style.display = "flex";
    fallback.innerText = getInitials(currentUser.fullname);
    fallback.style.background = getGradientForName(currentUser.fullname);
    fallback.style.color = "#ffffff";
    removeBtn.style.display = "none";
  }

  // Set Form inputs
  document.getElementById("fullname").value = currentUser.fullname || "";
  document.getElementById("email").value = currentUser.email || "";
  document.getElementById("phone").value = currentUser.phone_number || "";

  if (currentUser.dob) {
    const dateObj = new Date(currentUser.dob);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    document.getElementById("dob").value = `${year}-${month}-${day}`;
  }
}

// ── SUBMIT DETAILS UPDATE ──
document.getElementById("detailsForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("saveDetailsBtn");
  btn.disabled = true;
  btn.innerText = "Saving...";

  const fullname = document.getElementById("fullname").value;
  const phone_number = document.getElementById("phone").value;

  try {
    const res = await fetch(`${API_BASE}/api/v1/users/profile/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ fullname, phone_number })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      currentUser = data.data;
      populateProfile();
      showToast("Personal details updated successfully! ✅");
    } else {
      throw new Error(data.message || "Failed to update profile details");
    }
  } catch (error) {
    console.error(error);
    showToast(error.message || "Could not save details", true);
  } finally {
    btn.disabled = false;
    btn.innerText = "Save Personal Details";
  }
});

// ── PHOTO UPLOAD HANDLER ──
document.getElementById("avatarInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Validation
  if (!file.type.startsWith("image/")) {
    showToast("Please upload an image file ❌", true);
    return;
  }
  if (file.size > 2 * 1024 * 1024) { // 2MB Limit
    showToast("File is too large. Max size is 2MB. ❌", true);
    return;
  }

  const formData = new FormData();
  formData.append("profilePic", file);

  showToast("Uploading new photo... ⏳");

  try {
    const res = await fetch(`${API_BASE}/api/v1/users/profile/upload`, {
      method: "POST",
      credentials: "include",
      body: formData
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast("Profile image uploaded! ✅");
      // Fetch updated info to get new image URL
      await refreshCurrentUserData();
    } else {
      throw new Error(data.message || "Upload failed");
    }
  } catch (err) {
    console.error(err);
    showToast(err.message || "Could not upload image", true);
  }
});

// ── PHOTO DELETE HANDLER ──
document.getElementById("deleteAvatarBtn").addEventListener("click", async () => {
  if (!confirm("Are you sure you want to remove your profile photo?")) return;

  showToast("Removing photo... ⏳");

  try {
    const res = await fetch(`${API_BASE}/api/v1/users/profile/delete-image`, {
      method: "DELETE",
      credentials: "include"
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast("Profile image removed! ✅");
      await refreshCurrentUserData();
    } else {
      throw new Error(data.message || "Deletion failed");
    }
  } catch (err) {
    console.error(err);
    showToast(err.message || "Could not remove image", true);
  }
});

// ── PASSWORD CHANGE HANDLER ──
document.getElementById("passwordForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("savePasswordBtn");
  
  const oldpassword = document.getElementById("oldpassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmNewPassword = document.getElementById("confirmNewPassword").value;

  if (newPassword.length < 6) {
    showToast("New password must be at least 6 characters ❌", true);
    return;
  }

  if (newPassword !== confirmNewPassword) {
    showToast("Passwords do not match! ❌", true);
    return;
  }

  btn.disabled = true;
  btn.innerText = "Updating...";

  try {
    const res = await fetch(`${API_BASE}/api/v1/users/change-pass`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ oldpassword, newPassword, confirmNewPassword })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast("Password updated successfully! ✅");
      document.getElementById("passwordForm").reset();
    } else {
      throw new Error(data.message || "Failed to update password");
    }
  } catch (err) {
    console.error(err);
    showToast(err.message || "Invalid credentials or system error", true);
  } finally {
    btn.disabled = false;
    btn.innerText = "Update Password";
  }
});

// ── DELETE ACCOUNT HANDLER ──
document.getElementById("deleteAccountBtn").addEventListener("click", async () => {
  const confirm1 = confirm("⚠️ WARNING: You are about to permanently delete your account.\nThis will clear all your profile data and emails. Proceed?");
  if (!confirm1) return;

  const confirm2 = confirm("❌ FINAL CONFIRMATION: This action is absolutely irreversible. Are you 100% sure?");
  if (!confirm2) return;

  try {
    const res = await fetch(`${API_BASE}/api/v1/users/delete/account`, {
      method: "POST",
      credentials: "include"
    });

    const data = await res.json();
    if (res.ok && data.success) {
      alert("Your account has been deleted successfully. Goodbye!");
      window.location.href = "landing_page.html";
    } else {
      throw new Error(data.message || "Account deletion failed");
    }
  } catch (err) {
    console.error(err);
    showToast(err.message || "Could not delete account. Contact support.", true);
  }
});

// Helper: Refresh user info from server
async function refreshCurrentUserData() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/users/me`, {
      method: "GET",
      credentials: "include"
    });
    if (res.ok) {
      const data = await res.json();
      currentUser = data.data;
      populateProfile();
    }
  } catch (err) {
    console.error("Failed to refresh user context:", err);
  }
}

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
