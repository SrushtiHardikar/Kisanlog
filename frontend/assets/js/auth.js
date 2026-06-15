document.addEventListener("DOMContentLoaded", () => {

  // ---------------- REGISTER FORM ----------------
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fullName = document.getElementById("fullName").value.trim();
      const email = document.getElementById("email").value.trim().toLowerCase();
      const mobile = document.getElementById("mobile").value.trim();
      const location = document.getElementById("location").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (!fullName || !mobile || !location || !email) { alert("Please fill all fields."); return; }
      if (password !== confirmPassword) { alert("Passwords do not match."); return; }

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ fullName, email, mobile, location, password })
        });
        const data = await res.json();
        
        if (res.ok) {
          alert("Registration successful! Please login.");
          // Redirect to Dashboard immediately (cookie is set)
          window.location.replace("dashboard/index.html");
        } else {
          alert(data.message || "Registration failed");
        }
      } catch (error) {
        console.error(error);
        alert("Server error. Is the backend running?");
      }
    });
  }

  // ---------------- LOGIN FORM ----------------
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim().toLowerCase();
      const password = document.getElementById("loginPassword").value;

      try {
        // The cookie is set automatically by the server here
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
          alert("Login successful!");
          // JUST REDIRECT. The dashboard logic (main.js) will handle loading the analysis tab.
          window.location.replace("dashboard/index.html");
        } else {
          alert(data.message || "Login failed");
        }
      } catch (error) {
        console.error(error);
        alert("Server error. Is the backend running?");
      }
    });
  }

  // ---------------- PASSWORD TOGGLE ----------------
  document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const icon = this.querySelector('i');
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });

});