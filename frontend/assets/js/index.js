// ------------------------- SESSION CHECK ON HOMEPAGE -------------------------
// Check if user is already logged in and update nav button accordingly
document.addEventListener("DOMContentLoaded", async () => {
  if (window.SharedStorage && window.SharedStorage.checkSession) {
    const user = await window.SharedStorage.checkSession();

    if (user) {
      // User is logged in - change "Login" button to "Go to Dashboard"
      const navAuthButton = document.getElementById("navAuthButton");
      if (navAuthButton) {
        navAuthButton.innerHTML = `
          <a href="dashboard/" class="btn-login">
            <i class="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </a>
        `;
      }
    }
  }
});

// ------------------------- NAVBAR SCROLL EFFECT -------------------------
window.addEventListener("scroll", () => {
  document.querySelector(".navbar")
    .classList.toggle("scrolled", window.scrollY > 50);
});
