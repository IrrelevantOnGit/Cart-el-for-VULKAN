import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

const KEYS = {
    active: "cartel_session_active",
    token: "cartel_auth_token",
    lastActive: "cartel_last_active",
    user: "cartel_session_user",
    legacyLoggedIn: "cartel_logged_in",
    sessionId: "cartel_session_doc_id"
};

const IDLE_LIMIT_MS = 30 * 60 * 1000;
let idleInterval = null;
let idleBound = false;

function now() {
    return Date.now();
}

function touch() {
    localStorage.setItem(KEYS.lastActive, String(now()));
}

function clearSessionStorage() {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}

async function logSessionStart(user, method) {
    try {
        const docRef = await addDoc(collection(db, "sessions"), {
            userId: user.uid,
            email: user.email || "",
            method,
            startedAt: serverTimestamp(),
            status: "active"
        });
        localStorage.setItem(KEYS.sessionId, docRef.id);

        await addDoc(collection(db, "loginLogs"), {
            userId: user.uid,
            email: user.email || "",
            method,
            success: true,
            createdAt: serverTimestamp()
        });
    } catch (_err) {
        // Best effort logging.
    }
}

function bindIdleActivityListeners() {
    if (idleBound) return;
    idleBound = true;
    ["click", "keydown", "mousemove", "touchstart", "scroll"].forEach((eventName) => {
        window.addEventListener(eventName, touch, { passive: true });
    });
}

function startIdleMonitor(onTimeout) {
    stopIdleMonitor();
    touch();
    bindIdleActivityListeners();

    idleInterval = window.setInterval(() => {
        const lastActive = Number(localStorage.getItem(KEYS.lastActive) || "0");
        if (lastActive && now() - lastActive > IDLE_LIMIT_MS) {
            onTimeout();
        }
    }, 15000);
}

function stopIdleMonitor() {
    if (idleInterval) {
        window.clearInterval(idleInterval);
        idleInterval = null;
    }
}

export const SessionManager = {
    async completeLogin(user, options = {}) {
        const method = options.method || "email_password";

        const token = await user.getIdToken();
        localStorage.setItem(KEYS.active, "true");
        localStorage.setItem(KEYS.token, token);
        localStorage.setItem(KEYS.user, user.email || "");
        localStorage.setItem(KEYS.legacyLoggedIn, "true");
        touch();

        await logSessionStart(user, method);
        startIdleMonitor(async () => {
            await SessionManager.logoutAndRedirect("Session timed out due to inactivity", "login.html");
        });
    },

    completeLocalOnlyLogin(email, method = "master_override") {
        localStorage.setItem(KEYS.active, "true");
        localStorage.setItem(KEYS.legacyLoggedIn, "true");
        localStorage.setItem(KEYS.user, email || "dev-master@local");
        localStorage.setItem(KEYS.token, `local-${Math.random().toString(36).slice(2)}-${Date.now()}`);
        touch();

        startIdleMonitor(async () => {
            await SessionManager.logoutAndRedirect("Session timed out due to inactivity", "login.html");
        });

        addDoc(collection(db, "loginLogs"), {
            email: email || "dev-master@local",
            method,
            success: true,
            createdAt: serverTimestamp()
        }).catch(() => {});
    },

    hasActiveLocalSession() {
        const active = localStorage.getItem(KEYS.active) === "true";
        const token = localStorage.getItem(KEYS.token);
        return active && !!token;
    },

    attachProtectedGuard(redirectPath = "login.html") {
        onAuthStateChanged(auth, (user) => {
            if (!user && !SessionManager.hasActiveLocalSession()) {
                window.location.href = redirectPath;
                return;
            }
            startIdleMonitor(async () => {
                await SessionManager.logoutAndRedirect("Session timed out due to inactivity", redirectPath);
            });
        });
    },

    attachAuthPageRedirect(targetPath = "dashboard.html") {
        onAuthStateChanged(auth, (user) => {
            if (user || SessionManager.hasActiveLocalSession()) {
                window.location.href = targetPath;
            }
        });
    },

    async logoutAndRedirect(_reason = "Signed out", redirectPath = "login.html") {
        try {
            await signOut(auth);
        } catch (_err) {
            // Continue cleanup.
        }

        stopIdleMonitor();
        clearSessionStorage();
        window.location.href = redirectPath;
    }
};

window.CartelSessionManager = SessionManager;
