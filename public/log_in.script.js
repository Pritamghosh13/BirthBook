//for log-in a user


 /* ── Toggle password visibility ── */
    const togglePwd = document.getElementById('togglePwd');
    const pwdInput  = document.getElementById('password');
    togglePwd.addEventListener('click', () => {
      const show = pwdInput.type === 'password';
      pwdInput.type = show ? 'text' : 'password';
      togglePwd.querySelector('.eye-show').style.display = show ? 'none' : '';
      togglePwd.querySelector('.eye-hide').style.display = show ? '' : 'none';
    });
 
    /* ── Form validation + submit animation ── */
    const form      = document.getElementById('loginForm');
    const btn       = document.getElementById('submitBtn');
    const emailInp  = document.getElementById('email');
    const passInp   = document.getElementById('password');
    const fEmail    = document.getElementById('fieldEmail');
    const fPass     = document.getElementById('fieldPassword');
 
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
 
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate()) {
        /* shake the button on error */
        btn.classList.add('btn-submit--shake');
        btn.addEventListener('animationend', () => btn.classList.remove('btn-submit--shake'), { once: true });
        return;
      }
 
      /* Start loading */
      btn.classList.add('btn-submit--loading');
      btn.disabled = true;
 
      /* Simulate network (replace with real fetch) */
      await new Promise(r => setTimeout(r, 2000));
 
      /* Success */
      btn.classList.remove('btn-submit--loading');
      btn.classList.add('btn-submit--success');
 
      await new Promise(r => setTimeout(r, 1800));
      btn.classList.remove('btn-submit--success');
      btn.disabled = false;
    });
 
    /* Live clear errors on input */
    emailInp.addEventListener('input', () => fEmail.classList.remove('field--error'));
    passInp.addEventListener('input',  () => fPass.classList.remove('field--error'));




























//************************************************************************************************************ */


