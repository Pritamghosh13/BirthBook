//registation page animation 
/* ============================================
   BirthBook Sign Up — script.js
   ============================================ */

(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const setValid   = (el) => { el.classList.remove('invalid'); el.classList.add('valid'); };
  const setInvalid = (el) => { el.classList.remove('valid'); el.classList.add('invalid'); };
  const clearState = (el) => { el.classList.remove('valid', 'invalid'); };

  // ── Element refs ────────────────────────────────────────────────────────
  const form       = $('signupForm');
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

  // ── OTP State ────────────────────────────────────────────────────────────
  let otpVerified  = false;
  let generatedOtp = null;
  let resendInterval = null;
  let resendSeconds  = 30;

  // ── Field validators ─────────────────────────────────────────────────────
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

  // ── Password strength ────────────────────────────────────────────────────
  function calcStrength(pw) {
    let s = 0;
    if (pw.length >= 8)  s++;
    if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  }
  password.addEventListener('input', () => {
    const pw = password.value;
    const score = calcStrength(pw);
    const pct = pw.length ? Math.min(score / 5 * 100, 100) : 0;
    const colors = ['#ff5f7e','#ff9f43','#ffd32a','#3ee8b5','#3ee8b5'];
    const labels = ['Weak','Fair','Good','Strong','Strong'];
    strengthFill.style.width = pct + '%';
    strengthFill.style.background = pw.length ? colors[Math.max(0, score - 1)] : 'transparent';
    strengthLabel.textContent = pw.length ? labels[Math.max(0, score - 1)] : '';
    strengthLabel.style.color = pw.length ? colors[Math.max(0, score - 1)] : 'var(--muted)';
    if (pw.length >= 8) validatePassword(); else clearState($('field-password'));
  });

  // ── Realtime validation ───────────────────────────────────────────────────
  fullname.addEventListener('input', () =>
    fullname.value.trim().length >= 2 ? validateFullname() : clearState($('field-fullname')));

  emailInput.addEventListener('input', () => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (re.test(emailInput.value.trim())) {
      // Only mark valid if already verified, or not yet started OTP
      if (!otpSection.classList.contains('visible')) setValid($('field-email'));
      // else keep neutral — let OTP verification control the valid state
    } else {
      clearState($('field-email'));
    }
  });

  dob.addEventListener('change', validateDob);
  phone.addEventListener('input', () => {
    const d = phone.value.replace(/\D/g,'');
    d.length >= 7 ? validatePhone() : clearState($('field-phone'));
  });

  // ── Password toggle ───────────────────────────────────────────────────────
  togglePw.addEventListener('click', () => {
    const show = password.type === 'password';
    password.type = show ? 'text' : 'password';
    eyeIcon.innerHTML = show
      ? `<path d="M17.9 17.4A10 10 0 0 1 12 19c-7 0-11-7-11-7a18 18 0 0 1 5.1-5.9M9.9 4.2A9 9 0 0 1 12 4c7 0 11 7 11 7a18 18 0 0 1-2.1 3M1 1l22 22"/>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
  });

  // ── OTP digit keyboard nav ────────────────────────────────────────────────
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
  function showOtpError(msg) { errOtp.textContent = msg || 'Incorrect OTP. Please try again.'; errOtp.classList.add('show'); }
  function hideOtpError() { errOtp.classList.remove('show'); }

  // ── Resend countdown ──────────────────────────────────────────────────────
  function startResendCountdown() {
    resendSeconds = 30;
    resendBtn.disabled = true;
    resendTimer.textContent = resendSeconds + 's';
    clearInterval(resendInterval);
    resendInterval = setInterval(() => {
      resendSeconds--;
      resendTimer.textContent = resendSeconds + 's';
      if (resendSeconds <= 0) {
        clearInterval(resendInterval);
        resendBtn.disabled = false;
        resendTimer.textContent = '';
      }
    }, 1000);
  }

  // function generateOtp() { return String(Math.floor(100000 + Math.random() * 900000)); }

  // ── Send OTP (email) ──────────────────────────────────────────────────────
  sendOtpBtn.addEventListener('click', () => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(emailInput.value.trim())) {
      setInvalid($('field-email'));
      emailInput.focus();
      return;
    }

    // generatedOtp = generateOtp();
    // console.log('%c📧 Email OTP for testing: ' + generatedOtp,
    //   'color: #3ee8b5; font-size: 16px; font-weight: bold;');

    // Show OTP section
    otpSection.classList.add('visible');
    clearOtpInputs();
    hideOtpError();
    otpVerified = false;
    verifyOtpBtn.classList.remove('done');

    // Disable email input while OTP in progress
    emailInput.disabled = true;

    // Update Send OTP button
    sendOtpBtn.textContent = 'Resent';
    sendOtpBtn.classList.add('sent');
    sendOtpBtn.disabled = true;

    startResendCountdown();
    setTimeout(() => otpDigits[0].focus(), 120);
  });

  // ── Resend OTP ────────────────────────────────────────────────────────────
  resendBtn.addEventListener('click', () => {
    generatedOtp = generateOtp();
    console.log('%c📧 Resent OTP: ' + generatedOtp,
      'color: #63d2ff; font-size: 16px; font-weight: bold;');
    clearOtpInputs();
    hideOtpError();
    otpVerified = false;
    verifyOtpBtn.classList.remove('done');
    startResendCountdown();
    otpDigits[0].focus();
    sendOtpBtn.textContent = 'Resent';
    sendOtpBtn.classList.add('sent');
    sendOtpBtn.disabled = true;
  });

  // ── Verify OTP ────────────────────────────────────────────────────────────
  verifyOtpBtn.addEventListener('click', () => {
    const entered = getOtpValue();
    if (entered.length < 6) {
      showOtpError('Please enter the complete 6-digit OTP.');
      shakeOtpInputs();
      return;
    }

    verifyOtpBtn.classList.add('loading');
    verifyOtpBtn.disabled = true;
    hideOtpError();

    // setTimeout(() => {
    //   verifyOtpBtn.classList.remove('loading');
    //   verifyOtpBtn.disabled = false;

    //   if (entered === generateOtp) {
    //     otpVerified = true;
    //     verifyOtpBtn.classList.add('done');
    //     setValid($('field-email'));
    //     // Lock everything
    //     otpDigits.forEach(d => d.disabled = true);
    //     resendBtn.disabled = true;
    //     sendOtpBtn.disabled = true;
    //     clearInterval(resendInterval);
    //     resendTimer.textContent = '';
    //   } else {
    //     otpVerified = false;
    //     shakeOtpInputs();
    //     showOtpError('Incorrect OTP. Please try again.');
    //     clearOtpInputs();
    //     otpDigits[0].focus();
    //   }
    // }, 1200);
  });

  // ── Form submit ───────────────────────────────────────────────────────────
  form.addEventListener('submit', (e) => {
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
    }

    if (!fieldsOk || !otpVerified) return;

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.classList.remove('loading');
      submitBtn.classList.add('done');
      setTimeout(() => {
        successOverlay.classList.add('show');
        launchConfetti();
      }, 600);
    }, 1800);
  });

  // ── Confetti ──────────────────────────────────────────────────────────────
//   function launchConfetti() {
//     const colors = ['#3ee8b5','#63d2ff','#ff5f7e','#ffd32a','#a78bfa','#f97316'];
//     confettiContainer.innerHTML = '';
//     for (let i = 0; i < 36; i++) {
//       const p = document.createElement('div');
//       p.className = 'confetti-piece';
//       p.style.cssText = `
//         left: ${Math.random() * 100}%;
//         background: ${colors[Math.floor(Math.random() * colors.length)]};
//         animation-duration: ${0.8 + Math.random() * 1.4}s;
//         animation-delay: ${Math.random() * 0.6}s;
//         width: ${6 + Math.random() * 6}px;
//         height: ${6 + Math.random() * 6}px;
//         border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
//       `;
//       confettiContainer.appendChild(p);
//     }
//   }

})();