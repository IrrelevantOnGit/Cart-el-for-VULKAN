import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { db } from "./firebase-config.js";

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 3;

function generateOtpCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

async function hashOtp(input) {
    const enc = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function requestOtp(email) {
    const normalizedEmail = email.trim().toLowerCase();
    const code = generateOtpCode();
    const codeHash = await hashOtp(code + normalizedEmail);
    const expiresAtMs = Date.now() + OTP_EXPIRY_MS;

    const docRef = await addDoc(collection(db, "otpRequests"), {
        email: normalizedEmail,
        codeHash,
        attempts: 0,
        maxAttempts: OTP_MAX_ATTEMPTS,
        status: "active",
        expiresAtMs,
        createdAt: serverTimestamp()
    });

    // Demo email delivery simulation.
    console.info("[CART-EL OTP Demo] OTP for", normalizedEmail, "is", code, "requestId:", docRef.id);

    return {
        requestId: docRef.id,
        expiresAtMs
    };
}

export async function verifyOtp(requestId, email, otpCode) {
    const ref = doc(db, "otpRequests", requestId);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
        return { ok: false, message: "OTP request not found" };
    }

    const data = snapshot.data();
    const normalizedEmail = email.trim().toLowerCase();

    if (data.status !== "active") {
        return { ok: false, message: "OTP is no longer active" };
    }

    if (data.email !== normalizedEmail) {
        return { ok: false, message: "OTP email mismatch" };
    }

    if (Date.now() > Number(data.expiresAtMs || 0)) {
        await updateDoc(ref, { status: "expired" });
        return { ok: false, message: "OTP expired" };
    }

    if (Number(data.attempts || 0) >= OTP_MAX_ATTEMPTS) {
        await updateDoc(ref, { status: "locked" });
        return { ok: false, message: "Too many attempts" };
    }

    const submittedHash = await hashOtp(otpCode.trim() + normalizedEmail);
    if (submittedHash !== data.codeHash) {
        const nextAttempts = Number(data.attempts || 0) + 1;
        await updateDoc(ref, {
            attempts: nextAttempts,
            status: nextAttempts >= OTP_MAX_ATTEMPTS ? "locked" : "active"
        });
        return {
            ok: false,
            message: nextAttempts >= OTP_MAX_ATTEMPTS ? "Too many attempts" : "Invalid OTP"
        };
    }

    await updateDoc(ref, {
        status: "verified",
        verifiedAt: serverTimestamp()
    });

    return { ok: true };
}

export function formatOtpCountdown(expiresAtMs) {
    const remaining = Math.max(0, expiresAtMs - Date.now());
    const minutes = String(Math.floor(remaining / 60000)).padStart(2, "0");
    const seconds = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");
    return `${minutes}:${seconds}`;
}
