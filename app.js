// Sélecteurs
const loginPage = document.getElementById("loginPage");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");

// Connexion simulée
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Cache login, montre dashboard
    loginPage.classList.add("hidden");
    dashboard.classList.remove("hidden");
});
