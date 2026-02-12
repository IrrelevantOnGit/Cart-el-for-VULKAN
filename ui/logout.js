import { SessionManager } from "./auth-session.js";

export async function logoutUser(redirectPath = "login.html") {
    await SessionManager.logoutAndRedirect("Signed out", redirectPath);
}

function attachLogoutHandlers() {
    SessionManager.attachProtectedGuard("login.html");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachLogoutHandlers);
} else {
    attachLogoutHandlers();
}
