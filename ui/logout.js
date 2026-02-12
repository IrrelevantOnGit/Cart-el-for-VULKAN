import { SessionManager } from "./session.js";

export async function logoutUser(redirectPath = "login.html") {
    await SessionManager.logoutAndRedirect("Signed out", redirectPath);
}

function attachLogoutHandlers() {
    const logoutBtn = document.getElementById("logoutBtn") || document.getElementById("logoutButton");
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        await logoutUser("login.html");
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachLogoutHandlers);
} else {
    attachLogoutHandlers();
}
