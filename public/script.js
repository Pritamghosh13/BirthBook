
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





//log-in page animation js ***************************************************************


//for log-in a user

  function logInAnimation(){
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




  }
 





//******************************************************************************************************* */










//************************************************************************************************************ */
//************************************************************************************************************ */


//send otp


const sendOtpBtn = document.getElementById("sendOtpBtn");


if(sendOtpBtn){
  sendOtpBtn.addEventListener("click", async() => {
  const email = document.getElementById("email").value;

  try {
    const res = await fetch("http://localhost:8000/api/v1/users/sendotp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({email})
    })

    const data = await res.json();
    console.log(data);

    
      document.getElementById("otpSection").classList.add("visible");
    

    // disable button temporarily
    sendOtpBtn.disabled = true;
    
  } catch (err) {
    console.log(err, "Send OTP fetching failed");
  }

 
  
})
}


//*********************************************************************************** */


const inputs = document.querySelectorAll(".otp-digit");

inputs.forEach((input, index) => {
  // Only allow numbers
  input.addEventListener("input", (e) => {
    input.value = input.value.replace(/[^0-9]/g, "");

    // Move to next
    if (input.value && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  });

  // Handle backspace
  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace") {
      if (!input.value && index > 0) {
        inputs[index - 1].focus();
      }
    }
  });

  // Handle paste (FULL OTP)
  input.addEventListener("paste", (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();

    if (/^\d{6}$/.test(pasteData)) {
      pasteData.split("").forEach((digit, i) => {
        if (inputs[i]) inputs[i].value = digit;
      });
      inputs[inputs.length - 1].focus();
    }
  });
});
 





//************************************************ */*************** */******************* */


let otpVerified = false;

//verify otp

const verifyOtpBtn = document.getElementById("verifyOtpBtn");

if(verifyOtpBtn){
verifyOtpBtn.addEventListener("click", async() => {
  // const otp = document.getElementById("otpInputGroup");
  const email = document.getElementById("email").value;
  const inputs = document.querySelectorAll(".otp-digit");

  const getOtp = () => {
  let otp = "";

  inputs.forEach(input => {
    otp += input.value;
  });

  return otp;
  };

  const otp = getOtp();

  if (otp.length < 6) {
  alert("Enter full OTP");
  return;
  }


  try {
    const res = await fetch("http://localhost:8000/api/v1/users/verifyotp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({email, otp})
    })

    const data = await res.json()
    console.log(data);

    if (res.ok && data.success) {
      otpVerified = true;
      alert("OTP Verified ✅");
      document.getElementById("email").disabled = true; //  lock email

      verifyOtpBtn.innerText = "Verified ✅";
      verifyOtpBtn.disabled = true;
      inputs.forEach(input => input.disabled = true);
      sendOtpBtn.disabled = true;
      setTimeout(() => {
        sendOtpBtn.disabled = false;
      }, 30000); // 30 sec

    } else {
      otpVerified = false;
      alert("Wrong OTP ❌");
      inputs.forEach(input => input.value = "");
    }

    
  } catch (err) {
    console.log(err, "Verify OTP is failed.");
    
  }
})


}




//**************************************************************************************** */

const register_form = document.getElementById("signupForm");
const log_in_form = document.getElementById("loginForm");


//register user.
function registration(){
register_form.addEventListener("submit", async (e) => {
  e.preventDefault()

    if (!otpVerified) {
    alert("Please verify OTP first");
    return;
    }

    const data = {
        fullname: document.getElementById("fullname").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        dob: document.getElementById("dob").value,
        phone_number: document.getElementById("phone").value
      }

    console.log(data);

    try {
      const res = await fetch("http://localhost:8000/api/v1/users/register", {
          method: "POST",
          headers: {
          "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
      })
  
      const userData = await res.json()
      console.log(userData);

      if (res.ok && userData.success) {
      window.location.href = "landing_page.html";
    } else {
      alert(userData.message || "Registration failed");
    }

    }catch (error) {
      console.log(error.message, "Register user failed");  
  }

    
    
})
}






//********************************************************************************** */


//log-in user

function login(){

log_in_form.addEventListener("submit", async (e) => {
  e.preventDefault()

  const email = document.getElementById("email").value
  const password = document.getElementById("password").value

    //console.log(email, password);
  
    try {
      const res = await fetch("http://localhost:8000/api/v1/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",  //for cookies
      body: JSON.stringify({
        email, 
        password
      })
    })
    
    if (!res.ok) {
      throw new Error("log in failed");
    }

    const data = await res.json();
    console.log(data);

    //calling for user details
    if (res.ok) {
    window.location.href = "dashboard.html"
    
    }



    
  } catch (error) {
    console.log(error.message);
  }
  

})
}
  


if(log_in_form){
  login()
  logInAnimation()
}

if(register_form){
  registration()
}



//DOB in days

function daysLeft(dob) {
  if (!dob) return "Not set";

  const today = new Date();
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



//getting users details 

const getUserDetails = async () => {
  try {
    const res = await fetch("http://localhost:8000/api/v1/users/userinfo", {
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
    console.log(data);

    const hello = data.data;



    const container = document.getElementById("users")
    container.innerHTML = "";

    hello.forEach(user => {
      const div = document.createElement("div");
      div.classList.add("user-card");

     const days = daysLeft(user.dob)

      div.innerHTML =`
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
    })


  } catch (err) {
    console.log(err.message);
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



