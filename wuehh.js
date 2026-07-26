/*for qr code */
const qr = document.getElementById('qrGrid');

if (qr) {
  // Turn the empty div into a 7-column, 7-row grid.
  qr.style.display = 'grid';
  qr.style.gridTemplateColumns = 'repeat(7,1fr)';
  qr.style.gridTemplateRows = 'repeat(7,1fr)';
  qr.style.padding = '5px';

  // 1 = dark square, 0 = empty square. There are 49 numbers here for
  // the 7x7 = 49 grid cells, read left-to-right, top-to-bottom.
  const seed = [
    1,0,1,1,0,1,1,
    1,1,0,0,1,0,1,
    0,1,1,1,0,1,0,
    1,0,0,1,0,0,1,
    0,1,1,0,1,1,0,
    1,0,1,1,0,0,1,
    1,1,0,1,1,1,0
  ];

  // For every number in the list above, create one <div> and colour it
  // dark navy if the number is 1, or leave it see-through if it's 0.
  seed.forEach((isDark) => {
    const square = document.createElement('div');
    square.style.background = isDark ? '#172033' : 'transparent';
    qr.appendChild(square);
  });
}

/* back flip for card*/
const card = document.getElementById('heroCard');

if (card) {
  const toggleFlip = () => card.classList.toggle('flipped');

  card.addEventListener('click', toggleFlip);

  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      // Prevent the page from scrolling down when Space is pressed,
      // which is the browser's default behaviour for a Space key press.
      event.preventDefault();
      toggleFlip();
    }
  });
}

/* menu shii */
const menuButton = document.getElementById('menuButton');
const navLinks = document.getElementById('navLinks');

if (menuButton && navLinks) {
  menuButton.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('mobile-open');
    menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

/* magic*/
const revealEls = document.querySelectorAll('.reveal');

const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
    }
  });
}, { threshold: 0.15 });

revealEls.forEach((el) => io.observe(el));

/* for register form */
const registerForm = document.getElementById('registerForm');

if (registerForm) {
  const successPanel = document.getElementById('registerSuccess');
  const successName = document.getElementById('successName');
  const successId = document.getElementById('successId');
  const errorBox = document.getElementById('registerError');
  const submitButton = registerForm.querySelector('button[type="submit"]');

  registerForm.addEventListener('submit', async (event) => {
    // Stop the browser's default full-page-reload submission — we're
    // sending this with fetch() instead, further down.
    event.preventDefault();
    errorBox.hidden = true;

    // FormData reads every named field in the form at once, so we
    // don't have to grab each input individually by its id.
    const data = new FormData(registerForm);
    const password = data.get('password');
    const confirmPassword = data.get('confirmPassword');

    // This check happens here, in the browser, before anything is
    // sent anywhere — no point making a network request for a mistake
    // we can already see.
    if (password !== confirmPassword) {
      errorBox.textContent = "Those two passwords don't match.";
      errorBox.hidden = false;
      return;
    }

    // Build a plain object out of the form fields to send as JSON.
    // (confirmPassword is deliberately left out — the server only
    // needs the real password, not the confirmation copy.)
    const payload = {
      caregiverName: data.get('caregiverName'),
      caregiverPhone: data.get('caregiverPhone'),
      relationship: data.get('relationship'),
      username: data.get('username'),
      password: password,
      elderName: data.get('elderName'),
      condition: data.get('condition'),
      homeArea: data.get('homeArea'),
      safeInstruction: data.get('safeInstruction'),
    };

    submitButton.disabled = true;
    submitButton.textContent = 'Creating profile…';

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        // The server sends back a JSON body like { error: "..." } when
        // something goes wrong (duplicate username, missing field,
        // etc) — show that message directly rather than a generic one.
        errorBox.textContent = result.error || 'Something went wrong. Please try again.';
        errorBox.hidden = false;
        return;
      }

      // Success: the server sends back a login token plus the
      // caregiver's basic details and the real, permanent card ID it
      // generated. Storing the token in localStorage is what "being
      // logged in" means here — see login.js for the matching code
      // that reads it back out.
      localStorage.setItem('hakikaToken', result.token);
      localStorage.setItem('hakikaCaregiverName', result.caregiverName);

      successName.textContent = result.elderName;
      successId.textContent = result.cardId;
      successPanel.hidden = false;
      successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      registerForm.reset();

    } catch (networkError) {
      // This runs if the request couldn't reach the server at all —
      // e.g. the API isn't deployed yet, or there's no internet.
      errorBox.textContent = "Couldn't reach the server. Please check your connection and try again.";
      errorBox.hidden = false;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Create profile';
    }
  });
}