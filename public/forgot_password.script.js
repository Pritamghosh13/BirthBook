(function () {
  'use strict';

  const API_BASE_URL = window.API_BASE_URL || "https://birthbook.onrender.com";

  const $ = (id) => document.getElementById(id);
  const setValid   = (el) => { if (el) { el.classList.remove('invalid'); el.classList.add('valid'); } };
  const setInvalid = (el) => { if (el) { el.classList.remove('valid'); el.classList.add('invalid'); } };
  const clearState = (el) => { if (el) { el.classList.remove('valid', 'invalid'); } };

  // Elements
  const form            = $('forgotPasswordForm');
  const emailInput      = $('email');
  const password        = $('password');
  const confirmPassword = $('confirmPassword');
  const togglePwd       = $('togglePwd');
  const strengthFill    = $('strengthFill');
  const strengthLabel   = $('strengthLabel');
  const submitBtn       = $('submitBtn');
  const passwordSection = $('passwordSection');

  // OTP elements
  const sendOtpBtn   = $('sendOtpBtn');
  const otpSection   = $('otpSection');
  const otpDigits    = Array.from(document.querySelectorAll('.otp-digit'));
  const verifyOtpBtn = $('verifyOtpBtn');
  const resendBtn    = $('resendBtn');
  const resendTimer  = $('resendTimer');
  const errOtp       = $('err-otp');

  // State
  let otpVerified = false;
  let resendInterval = null;
  let resendSeconds = 30;

  // Validation functions
  function validateEmail() {
    const f = $('fieldEmail');
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (re.test(emailInput.value.trim())) {
      setValid(f);
      return true;
    }
    setInvalid(f);
    return false;
  }

  function validatePassword() {
    const f = $('fieldPassword');
    if (password.value.length >= 8) {
      setValid(f);
      return true;
    }
    setInvalid(f);
    return false;
  }

  function validateConfirmPassword() {
    const f = $('fieldConfirmPassword');
    if (confirmPassword.value === password.value && confirmPassword.value.length >= 8) {
      setValid(f);
      return true;
    }
    setInvalid(f);
    return false;
  }

  // Password strength meter
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
      if (pw.length >= 8) validatePassword(); else clearState($('fieldPassword'));
    });
  }

  if (confirmPassword) {
    confirmPassword.addEventListener('input', () => {
      if (confirmPassword.value.length >= 8) validateConfirmPassword(); else clearState($('fieldConfirmPassword'));
    });
  }

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (re.test(emailInput.value.trim())) {
        if (!otpSection.classList.contains('visible')) setValid($('fieldEmail'));
      } else {
        clearState($('fieldEmail'));
      }
    });
  }

  // Password Visibility Toggle
  if (togglePwd && password) {
    togglePwd.addEventListener('click', () => {
      const show = password.type === 'password';
      password.type = show ? 'text' : 'password';
      togglePwd.querySelector('.eye-show').style.display = show ? 'none' : '';
      togglePwd.querySelector('.eye-hide').style.display = show ? '' : 'none';
    });
  }

  // OTP keyboard nav
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

  // Countdown timer
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
    if (!validateEmail()) {
      emailInput.focus();
      return;
    }

    const email = emailInput.value.trim();

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/users/sendotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        otpSection.classList.add('visible');
        clearOtpInputs();
        hideOtpError();
        otpVerified = false;
        verifyOtpBtn.classList.remove('done');

        // Disable email modification during OTP validation
        emailInput.disabled = true;

        sendOtpBtn.textContent = 'Resent';
        sendOtpBtn.classList.add('sent');
        sendOtpBtn.disabled = true;
        startResendCountdown();

        setTimeout(() => otpDigits[0].focus(), 120);
      } else {
        alert(data.message || "Failed to send OTP. Please check if this email exists.");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending OTP. Please try again later.");
    }
  }

  if (sendOtpBtn) {
    sendOtpBtn.addEventListener('click', performSendOtp);
  }

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
          setValid($('fieldEmail'));

          // Lock OTP inputs
          otpDigits.forEach(d => d.disabled = true);
          if (resendBtn) resendBtn.disabled = true;
          sendOtpBtn.disabled = true;
          clearInterval(resendInterval);
          if (resendTimer) resendTimer.textContent = '';

          // Show Password Section
          passwordSection.classList.add('visible');
          setTimeout(() => password.focus(), 200);
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

  // Submit Password Reset
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!otpVerified) {
        alert("Please verify your OTP first.");
        return;
      }

      const pOk = validatePassword();
      const cpOk = validateConfirmPassword();

      if (!pOk || !cpOk) {
        submitBtn.classList.add('btn-submit--shake');
        submitBtn.addEventListener('animationend', () => submitBtn.classList.remove('btn-submit--shake'), { once: true });
        return;
      }

      submitBtn.classList.add('btn-submit--loading');
      submitBtn.disabled = true;

      const email = emailInput.value.trim();
      const newPassword = password.value;
      const confirmNewPassword = confirmPassword.value;

      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/users/forgot-pass`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, newPassword, confirmNewPassword })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          submitBtn.classList.remove('btn-submit--loading');
          submitBtn.classList.add('btn-submit--success');

          await new Promise(r => setTimeout(r, 1500));
          window.location.href = "log_in.html";
        } else {
          throw new Error(data.message || "Failed to reset password.");
        }
      } catch (err) {
        console.error(err);
        submitBtn.classList.remove('btn-submit--loading');
        submitBtn.classList.add('btn-submit--shake');
        submitBtn.addEventListener('animationend', () => submitBtn.classList.remove('btn-submit--shake'), { once: true });
        submitBtn.disabled = false;
        alert(err.message || "An error occurred while resetting password.");
      }
    });
  }

})();
