import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, browserLocalPersistence, browserSessionPersistence, setPersistence } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const defaultConfig = {
    apiKey: "REPLACE_WITH_FIREBASE_API_KEY",
    authDomain: "REPLACE_WITH_FIREBASE_AUTH_DOMAIN",
    projectId: "REPLACE_WITH_FIREBASE_PROJECT_ID",
    storageBucket: "REPLACE_WITH_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "REPLACE_WITH_FIREBASE_MESSAGING_SENDER_ID",
    appId: "REPLACE_WITH_FIREBASE_APP_ID"
};

export const firebaseConfig = window.CARTEL_FIREBASE_CONFIG || defaultConfig;

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const AUTH_FEATURE_FLAGS = {
    // Development only. Keep false in production.
    enableMasterOverride: Boolean(window.CARTEL_ENABLE_MASTER_OVERRIDE) || false,
    // Backend endpoint validates master password server-side.
    masterOverrideEndpoint: window.CARTEL_MASTER_OVERRIDE_ENDPOINT || "/api/dev/master-login",
    // Optional lightweight bot protection delay (ms)
    minHumanDelayMs: 1200
};

export const EXAMPLE_TEST_USERS = [
    { email: "demo@cartel.ai", note: "Primary demo account" },
    { email: "ops@cartel.ai", note: "Operations test account" },
    { email: "finance@cartel.ai", note: "Finance test account" }
];

export async function applyRememberMePersistence(rememberMe) {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
}

export function isFirebaseConfigured() {
    return firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("REPLACE_WITH");
}
