import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";
import { SessionManager } from "./session.js";

function getInitials(nameOrEmail) {
    const raw = (nameOrEmail || "U").trim();
    if (!raw) return "U";
    const parts = raw.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function applyProfileToUi(profile) {
    const name = profile.name || profile.displayName || profile.email || "User";
    const initials = getInitials(name);

    const modalName = document.getElementById("modalNameInput");
    if (modalName && !modalName.value) modalName.value = name;

    const initialsNodes = [
        document.getElementById("profileAvatarInitials"),
        document.getElementById("modalAvatarInitials")
    ].filter(Boolean);

    initialsNodes.forEach((node) => {
        node.textContent = initials;
    });

    const dropdown = document.getElementById("profileDropdown");
    if (dropdown && !dropdown.dataset.userName) {
        dropdown.dataset.userName = name;
    }
}

async function loadProfile(user) {
    if (!user) {
        const fallbackEmail = localStorage.getItem("cartel_session_user") || "dev-master@local";
        applyProfileToUi({ email: fallbackEmail, name: fallbackEmail.split("@")[0] });
        return;
    }

    try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
            applyProfileToUi(snap.data());
            return;
        }
    } catch (_err) {
        // fallback below
    }

    applyProfileToUi({
        email: user.email || "",
        displayName: user.displayName || ""
    });
}

function initGuard() {
    SessionManager.attachProtectedGuard("login.html");

    onAuthStateChanged(auth, async (user) => {
        if (!user && !SessionManager.hasActiveLocalSession()) {
            window.location.href = "login.html";
            return;
        }
        await loadProfile(user);
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGuard);
} else {
    initGuard();
}
