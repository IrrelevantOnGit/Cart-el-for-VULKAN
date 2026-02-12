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

export async function applyRememberMePersistence(rememberMe) {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
}

export function isFirebaseConfigured() {
    return firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("REPLACE_WITH");
}
