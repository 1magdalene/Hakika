/* ==========================================================================
   LOGIN PAGE SCRIPT
   --------------------------------------------------------------------------
   Two independent pieces of behaviour:
     1. Show/hide password
     2. Submitting the login form to the real backend at /api/login
        (see api/index.js in this project)
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. SHOW / HIDE PASSWORD
   --------------------------------------------------------------------------
   The checkbox in login.html calls this function directly via its
   `onclick="togglePasswordVisibility()"` attribute. An <input>'s `type`
   attribute controls how the browser displays it — "password" shows
   dots instead of characters. Switching it to "text" and back is all
   that's needed to reveal or re-hide what's typed.
   -------------------------------------------------------------------------- */
function togglePasswordVisibility() {
  const passwordField = document.getElementById('password');
  const isHidden = passwordField.type === 'password';
  passwordField.type = isHidden ? 'text' : 'password';
}

/* --------------------------------------------------------------------------
   2. FORM SUBMIT — real login against /api/login
   --------------------------------------------------------------------------
   On success, the server sends back a signed token proving who you
   are, plus your caregiver name and the elder's name. That token is
   saved in the browser's localStorage under "hakikaToken" — the same
   key register.js writes to after a successful sign-up — so either
   page landing you in a "logged in" state means the same thing.

   This is a simple approach (a token in localStorage, sent back on
   future requests) rather than a full session-cookie system — good
   enough for a small personal project, though a production app would
   typically add extra protections around where that token is stored.
   -------------------------------------------------------------------------- */
const loginForm = document.getElementById('loginForm');

if (loginForm) {
  const errorBox = document.getElementById('loginError');
  const submitButton = loginForm.querySelector('button[type="submit"]');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.hidden = true;

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    submitButton.disabled = true;
    submitButton.textContent = 'Logging in…';

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        // The server deliberately sends the same generic message for
        // both "no such username" and "wrong password" (see
        // api/index.js) — telling the two apart would let someone
        // probe which usernames exist on the site.
        errorBox.textContent = result.error || 'Something went wrong. Please try again.';
        errorBox.hidden = false;
        return;
      }

      localStorage.setItem('hakikaToken', result.token);
      localStorage.setItem('hakikaCaregiverName', result.caregiverName);

      // Send them back to the homepage now that they're logged in.
      // (A future step here could be building a real caregiver
      // dashboard page and redirecting there instead.)
      window.location.href = 'index.html#top';

    } catch (networkError) {
      errorBox.textContent = "Couldn't reach the server. Please check your connection and try again.";
      errorBox.hidden = false;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Login';
    }
  });
}
