
//script for styling the landing page, and the animation
/* ─────────────────────────────────────────────
   Birthday Reminder — script.js
   Design-only JS: animations & scroll effects
───────────────────────────────────────────── */

// import { get } from "mongoose";

// import { json } from "express";

// 1. Sticky navbar shadow on scroll
(function initNavScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
})();


// 2. Scroll-reveal for feature cards (IntersectionObserver)
(function initFeatureReveal() {
  const cards = document.querySelectorAll('.feature-card[data-animate]');
  if (!cards.length) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (entry.isIntersecting) {
        // Stagger each card slightly
        const delay = Array.from(cards).indexOf(entry.target) * 120;
        setTimeout(function () {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach(function (card) {
    observer.observe(card);
  });
})();


// 3. Mini-card pulse on hover (adds/removes a glow ring)
(function initMiniCardGlow() {
  const miniCards = document.querySelectorAll('.mini-card');
  if (!miniCards.length) return;

  miniCards.forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      card.style.boxShadow = '0 0 0 1.5px rgba(91,158,249,0.45), 0 4px 18px rgba(0,0,0,0.3)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.boxShadow = '';
    });
  });
})();


// 4. CTA primary button — subtle ripple effect on click
(function initRipple() {
  const btn = document.querySelector('.cta-primary');
  if (!btn) return;

  btn.addEventListener('click', function (e) {
    e.preventDefault();

    const ripple = document.createElement('span');
    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);

    ripple.style.cssText = [
      'position:absolute',
      'border-radius:50%',
      'background:rgba(255,255,255,0.25)',
      'pointer-events:none',
      'transform:scale(0)',
      'animation:rippleAnim 0.55s ease-out forwards',
      'width:'  + size + 'px',
      'height:' + size + 'px',
      'left:'   + (e.clientX - rect.left  - size / 2) + 'px',
      'top:'    + (e.clientY - rect.top   - size / 2) + 'px',
    ].join(';');

    // Ensure btn has relative positioning
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);

    ripple.addEventListener('animationend', function () {
      ripple.remove();
    });
  });

  // Inject ripple keyframes once
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = '@keyframes rippleAnim { to { transform: scale(2.5); opacity: 0; } }';
    document.head.appendChild(style);
  }
})();


// 5. Floating deco orbs — randomise animation-delay on load for variety
(function initDecoVariance() {
  const decos = document.querySelectorAll('.deco');
  decos.forEach(function (el) {
    const delay = (Math.random() * 2).toFixed(2) + 's';
    el.style.animationDelay = delay;
  });
})();





// ── CONFIGURATION & GLOBAL STATE ────────────────────────────────────────────
const API_BASE_URL = window.API_BASE_URL || "https://birthbook.onrender.com";

// ── LOG IN FLOW ─────────────────────────────────────────────────────────────
const log_in_form = document.getElementById("loginForm");

if (log_in_form) {
  const btn       = document.getElementById('submitBtn');
  const emailInp  = document.getElementById('email');
  const passInp   = document.getElementById('password');
  const fEmail    = document.getElementById('fieldEmail');
  const fPass     = document.getElementById('fieldPassword');
  const togglePwd = document.getElementById('togglePwd');

  // Toggle password visibility
  if (togglePwd && passInp) {
    togglePwd.addEventListener('click', () => {
      const show = passInp.type === 'password';
      passInp.type = show ? 'text' : 'password';
      togglePwd.querySelector('.eye-show').style.display = show ? 'none' : '';
      togglePwd.querySelector('.eye-hide').style.display = show ? '' : 'none';
    });
  }

  function validate() {
    let ok = true;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRe.test(emailInp.value.trim())) {
      fEmail.classList.add('field--error');
      ok = false;
    } else {
      fEmail.classList.remove('field--error');
    }

    if (passInp.value.trim().length < 6) {
      fPass.classList.add('field--error');
      ok = false;
    } else {
      fPass.classList.remove('field--error');
    }
    return ok;
  }

  /* Live clear errors on input */
  emailInp.addEventListener('input', () => fEmail.classList.remove('field--error'));
  passInp.addEventListener('input',  () => fPass.classList.remove('field--error'));

  log_in_form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validate()) {
      btn.classList.add('btn-submit--shake');
      btn.addEventListener('animationend', () => btn.classList.remove('btn-submit--shake'), { once: true });
      return;
    }

    /* Start loading animation */
    btn.classList.add('btn-submit--loading');
    btn.disabled = true;

    const email = emailInp.value.trim();
    const password = passInp.value;

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      console.log(data);

      if (res.ok && data.success) {
        /* Success animation state */
        btn.classList.remove('btn-submit--loading');
        btn.classList.add('btn-submit--success');

        await new Promise(r => setTimeout(r, 1500));
        window.location.href = "dashboard.html";
      } else {
        throw new Error(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      btn.classList.remove('btn-submit--loading');
      btn.classList.add('btn-submit--shake');
      btn.addEventListener('animationend', () => btn.classList.remove('btn-submit--shake'), { once: true });
      btn.disabled = false;
      alert(error.message || "Log in failed. Please try again.");
    }
  });
}

// ── REGISTRATION & OTP FLOW ─────────────────────────────────────────────────
const register_form = document.getElementById("signupForm");

if (register_form) {
  const $ = (id) => document.getElementById(id);
  const setValid   = (el) => { if (el) { el.classList.remove('invalid'); el.classList.add('valid'); } };
  const setInvalid = (el) => { if (el) { el.classList.remove('valid'); el.classList.add('invalid'); } };
  const clearState = (el) => { if (el) { el.classList.remove('valid', 'invalid'); } };

  // Element refs
  const fullname   = $('fullname');
  const emailInput = $('email');
  const dob        = $('dob');
  const phone      = $('phone');
  const password   = $('password');
  const togglePw   = $('togglePw');
  const eyeIcon    = $('eyeIcon');
  const strengthFill  = $('strengthFill');
  const strengthLabel = $('strengthLabel');
  const submitBtn  = $('submitBtn');
  const successOverlay    = $('successOverlay');
  const confettiContainer = $('confettiContainer');

  // OTP refs
  const sendOtpBtn   = $('sendOtpBtn');
  const otpSection   = $('otpSection');
  const otpDigits    = Array.from(document.querySelectorAll('.otp-digit'));
  const verifyOtpBtn = $('verifyOtpBtn');
  const resendBtn    = $('resendBtn');
  const resendTimer  = $('resendTimer');
  const errOtp       = $('err-otp');

  // OTP State
  let otpVerified  = false;
  let resendInterval = null;
  let resendSeconds  = 30;

  // Field validators
  function validateFullname() {
    const f = $('field-fullname');
    if (fullname.value.trim().length >= 2) { setValid(f); return true; }
    setInvalid(f); return false;
  }
  function validateEmail() {
    const f = $('field-email');
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (re.test(emailInput.value.trim())) { setValid(f); return true; }
    setInvalid(f); return false;
  }
  function validateDob() {
    const f = $('field-dob');
    if (dob.value) { setValid(f); return true; }
    setInvalid(f); return false;
  }
  function validatePhone() {
    const f = $('field-phone');
    const d = phone.value.replace(/\D/g, '');
    if (d.length >= 7) { setValid(f); return true; }
    setInvalid(f); return false;
  }
  function validatePassword() {
    const f = $('field-password');
    if (password.value.length >= 8) { setValid(f); return true; }
    setInvalid(f); return false;
  }

  // Password strength
  function calcStrength(pw) {
    let s = 0;
    if (pw.length >= 8)  s++;
    if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  }

  if (password) {
    password.addEventListener('input', () => {
      const pw = password.value;
      const score = calcStrength(pw);
      const pct = pw.length ? Math.min(score / 5 * 100, 100) : 0;
      const colors = ['#ff5f7e','#ff9f43','#ffd32a','#3ee8b5','#3ee8b5'];
      const labels = ['Weak','Fair','Good','Strong','Strong'];
      if (strengthFill) {
        strengthFill.style.width = pct + '%';
        strengthFill.style.background = pw.length ? colors[Math.max(0, score - 1)] : 'transparent';
      }
      if (strengthLabel) {
        strengthLabel.textContent = pw.length ? labels[Math.max(0, score - 1)] : '';
        strengthLabel.style.color = pw.length ? colors[Math.max(0, score - 1)] : 'var(--muted)';
      }
      if (pw.length >= 8) validatePassword(); else clearState($('field-password'));
    });
  }

  // Realtime validation listeners
  if (fullname) {
    fullname.addEventListener('input', () =>
      fullname.value.trim().length >= 2 ? validateFullname() : clearState($('field-fullname')));
  }

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (re.test(emailInput.value.trim())) {
        if (!otpSection.classList.contains('visible')) setValid($('field-email'));
      } else {
        clearState($('field-email'));
      }
    });
  }

  if (dob) dob.addEventListener('change', validateDob);
  if (phone) {
    phone.addEventListener('input', () => {
      const d = phone.value.replace(/\D/g,'');
      d.length >= 7 ? validatePhone() : clearState($('field-phone'));
    });
  }

  // Password toggle
  if (togglePw && password) {
    togglePw.addEventListener('click', () => {
      const show = password.type === 'password';
      password.type = show ? 'text' : 'password';
      if (eyeIcon) {
        eyeIcon.innerHTML = show
          ? `<path d="M17.9 17.4A10 10 0 0 1 12 19c-7 0-11-7-11-7a18 18 0 0 1 5.1-5.9M9.9 4.2A9 9 0 0 1 12 4c7 0 11 7 11 7a18 18 0 0 1-2.1 3M1 1l22 22"/>`
          : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
      }
    });
  }

  // OTP digits navigation
  otpDigits.forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g, '');
      e.target.value = val ? val[val.length - 1] : '';
      if (e.target.value) {
        input.classList.add('filled');
        if (idx < otpDigits.length - 1) otpDigits[idx + 1].focus();
      } else {
        input.classList.remove('filled');
      }
      hideOtpError();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && idx > 0) {
        otpDigits[idx - 1].focus();
        otpDigits[idx - 1].value = '';
        otpDigits[idx - 1].classList.remove('filled');
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const paste = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
      paste.split('').slice(0, otpDigits.length - idx).forEach((char, i) => {
        if (otpDigits[idx + i]) {
          otpDigits[idx + i].value = char;
          otpDigits[idx + i].classList.add('filled');
        }
      });
      const nextEmpty = otpDigits.find(d => !d.value);
      if (nextEmpty) nextEmpty.focus();
      else otpDigits[otpDigits.length - 1].focus();
    });
  });

  function getOtpValue()  { return otpDigits.map(d => d.value).join(''); }
  function clearOtpInputs() { otpDigits.forEach(d => { d.value = ''; d.classList.remove('filled','shake'); }); }
  function shakeOtpInputs() {
    otpDigits.forEach(d => { d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake'); });
  }
  function showOtpError(msg) {
    if (errOtp) {
      errOtp.textContent = msg || 'Incorrect OTP. Please try again.';
      errOtp.classList.add('show');
    }
  }
  function hideOtpError() { if (errOtp) errOtp.classList.remove('show'); }

  // Resend countdown
  function startResendCountdown() {
    resendSeconds = 30;
    if (resendBtn) resendBtn.disabled = true;
    if (resendTimer) resendTimer.textContent = resendSeconds + 's';
    clearInterval(resendInterval);
    resendInterval = setInterval(() => {
      resendSeconds--;
      if (resendTimer) resendTimer.textContent = resendSeconds + 's';
      if (resendSeconds <= 0) {
        clearInterval(resendInterval);
        if (resendBtn) resendBtn.disabled = false;
        if (resendTimer) resendTimer.textContent = '';
      }
    }, 1000);
  }

  // Send OTP
  async function performSendOtp() {
    const email = emailInput.value.trim();
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/users/sendotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Show OTP section
        otpSection.classList.add('visible');
        clearOtpInputs();
        hideOtpError();
        otpVerified = false;
        verifyOtpBtn.classList.remove('done');

        // Disable email input
        emailInput.disabled = true;

        // Start countdown
        sendOtpBtn.textContent = 'Resent';
        sendOtpBtn.classList.add('sent');
        sendOtpBtn.disabled = true;
        startResendCountdown();

        setTimeout(() => otpDigits[0].focus(), 120);
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Send OTP failed:", err);
      alert("Network error sending OTP. Please check backend connection.");
    }
  }

  if (sendOtpBtn) {
    sendOtpBtn.addEventListener('click', performSendOtp);
  }

  // Resend OTP Button click
  if (resendBtn) {
    resendBtn.addEventListener('click', performSendOtp);
  }

  // Verify OTP
  if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener('click', async () => {
      const email = emailInput.value.trim();
      const entered = getOtpValue();
      if (entered.length < 6) {
        showOtpError('Please enter the complete 6-digit OTP.');
        shakeOtpInputs();
        return;
      }

      verifyOtpBtn.classList.add('loading');
      verifyOtpBtn.disabled = true;
      hideOtpError();

      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/users/verifyotp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: entered })
        });
        const data = await res.json();
        
        verifyOtpBtn.classList.remove('loading');
        verifyOtpBtn.disabled = false;

        if (res.ok && data.success) {
          otpVerified = true;
          verifyOtpBtn.classList.add('done');
          setValid($('field-email'));
          otpDigits.forEach(d => d.disabled = true);
          if (resendBtn) resendBtn.disabled = true;
          sendOtpBtn.disabled = true;
          clearInterval(resendInterval);
          if (resendTimer) resendTimer.textContent = '';
        } else {
          throw new Error(data.message || "Invalid OTP");
        }
      } catch (err) {
        otpVerified = false;
        shakeOtpInputs();
        showOtpError(err.message || 'Incorrect OTP. Please try again.');
        clearOtpInputs();
        verifyOtpBtn.classList.remove('loading');
        verifyOtpBtn.disabled = false;
        otpDigits[0].focus();
      }
    });
  }

  // Form Submit (Registration)
  register_form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fieldsOk = [
      validateFullname(),
      validateDob(),
      validatePhone(),
      validatePassword(),
    ].every(Boolean);

    // Email must be verified via OTP
    if (!otpVerified) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(emailInput.value.trim())) setInvalid($('field-email'));
      showOtpError(otpSection.classList.contains('visible')
        ? 'Please verify your OTP first.'
        : 'Please send and verify your email OTP first.');
      otpSection.classList.add('visible');
      return;
    }

    if (!fieldsOk) return;

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const data = {
      fullname: fullname.value.trim(),
      email: emailInput.value.trim(),
      password: password.value,
      dob: dob.value,
      phone_number: phone.value.trim()
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const userData = await res.json();

      if (res.ok && userData.success) {
        submitBtn.classList.remove('loading');
        submitBtn.classList.add('done');
        setTimeout(() => {
          if (successOverlay) successOverlay.classList.add('show');
          launchConfetti();
          setTimeout(() => {
            window.location.href = "log_in.html";
          }, 3000);
        }, 600);
      } else {
        throw new Error(userData.message || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      alert(error.message || "Registration failed. Please try again.");
    }
  });

  // Confetti Animation
  function launchConfetti() {
    if (!confettiContainer) return;
    const colors = ['#3ee8b5','#63d2ff','#ff5f7e','#ffd32a','#a78bfa','#f97316'];
    confettiContainer.innerHTML = '';
    for (let i = 0; i < 36; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        animation-duration: ${0.8 + Math.random() * 1.4}s;
        animation-delay: ${Math.random() * 0.6}s;
        width: ${6 + Math.random() * 6}px;
        height: ${6 + Math.random() * 6}px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      `;
      confettiContainer.appendChild(p);
    }
  }
}

// ── DOB & FRIENDS LISTING ON LANDING PAGE ───────────────────────────────────
function daysLeft(dob) {
  if (!dob) return "Not set";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const birthDate = new Date(dob);

  // next birthday (this year)
  let nextBirthday = new Date(
    today.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );

  // if birthday already passed → next year
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }

  // difference in days
  const diffTime = nextBirthday - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

const getUserDetails = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/users/userinfo`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch user details");
    }

    const data = await res.json();
    const hello = data.data;

    const container = document.getElementById("users");
    if (!container) return;
    container.innerHTML = "";

    hello.forEach(user => {
      const div = document.createElement("div");
      div.classList.add("user-card");

      const days = daysLeft(user.dob);

      div.innerHTML = `
        <p><strong>Name:</strong> ${user.fullname}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>DOB:</strong> ${user.dob ? new Date(user.dob).toDateString() : "Not set"}</p>
        <p><strong>Days Left:</strong> ${
          days === "Not set"
            ? "Not set"
            : days === 0
            ? "🎂 Today!"
            : `${days} days`
        }</p>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error("Failed to load user details for users grid:", err.message);
  }
};

window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("users");
  if (container) {
    getUserDetails();
  }
});
















//************************************************************************************************************ */
//*************************************************************************************************************** */



