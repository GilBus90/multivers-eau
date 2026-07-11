import React, { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";
import App from "./App";

export default function AuthGate() {
  const [user, setUser] = useState(undefined); // undefined = chargement, null = déconnecté
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(translateError(err.code));
    }
    setBusy(false);
  };

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50 text-slate-500 text-sm">
        Chargement…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-teal-50 flex items-center justify-center px-4 font-sans">
        <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 w-full max-w-sm space-y-3">
          <h1 className="text-lg font-bold text-teal-800 text-center mb-1">Multivers'Eau — Suivi</h1>
          <p className="text-xs text-slate-500 text-center mb-3">
            {mode === "signin" ? "Connecte-toi pour accéder à tes données." : "Crée ton accès (une seule fois)."}
          </p>
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-teal-700 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-50"
          >
            {mode === "signin" ? "Se connecter" : "Créer mon accès"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-xs text-slate-500 underline"
          >
            {mode === "signin" ? "Pas encore de compte ? En créer un" : "Déjà un compte ? Se connecter"}
          </button>
        </form>
      </div>
    );
  }

  return <App uid={user.uid} onSignOut={() => signOut(auth)} />;
}

function translateError(code) {
  const map = {
    "auth/invalid-email": "Adresse email invalide.",
    "auth/user-not-found": "Aucun compte avec cet email.",
    "auth/wrong-password": "Mot de passe incorrect.",
    "auth/invalid-credential": "Email ou mot de passe incorrect.",
    "auth/email-already-in-use": "Un compte existe déjà avec cet email.",
    "auth/weak-password": "Le mot de passe doit faire au moins 6 caractères.",
  };
  return map[code] || "Une erreur est survenue, réessaie.";
}
