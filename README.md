# Multivers'Eau — Suivi (version déployable)

Version autonome de l'application de suivi du business d'eau, avec persistance
sur **Firebase Firestore** (au lieu du stockage propre à Claude.ai). Accessible
depuis n'importe quel navigateur, avec les mêmes données partout, tant que tu
te connectes avec le même email/mot de passe.

## 1. Créer le projet Firebase

1. Va sur https://console.firebase.google.com et crée un nouveau projet
   (ex: `multivers-eau`).
2. Dans le projet, va dans **Authentication > Sign-in method** et active
   **Email/Password**.
3. Va dans **Firestore Database > Créer une base de données** (mode production).
4. Dans **Règles**, colle le contenu du fichier `firestore.rules` fourni ici,
   puis publie.
5. Va dans **Paramètres du projet > Général**, section "Vos applications",
   ajoute une application Web (icône `</>`), donne-lui un nom. Firebase
   affiche alors un objet `firebaseConfig` — tu auras besoin de ces valeurs
   à l'étape suivante.

## 2. Configurer le projet en local

```bash
npm install
cp .env.example .env
```

Ouvre `.env` et colle les valeurs de `firebaseConfig` (apiKey, authDomain,
projectId, storageBucket, messagingSenderId, appId).

```bash
npm run dev
```

Ouvre l'URL affichée (ex: http://localhost:5173), crée ton compte (email +
mot de passe, une seule fois via "Créer un accès"), et vérifie que
l'application se charge correctement avec le stock initial du 10 juin 2026.

## 3. Pousser sur GitHub

```bash
git init
git add .
git commit -m "Version initiale — Multivers'Eau suivi"
git branch -M main
git remote add origin https://github.com/GilBus90/NOM-DU-REPO.git
git push -u origin main
```

(Remplace `NOM-DU-REPO` par le nom que tu veux donner au dépôt sur ton
compte GitHub GilBus90.)

## 4. Déployer sur Vercel

1. Sur https://vercel.com, "Add New Project", importe le dépôt GitHub
   que tu viens de pousser.
2. Vercel détecte automatiquement Vite — laisse les réglages par défaut
   (Build command: `vite build`, Output directory: `dist`).
3. Avant de déployer, va dans **Environment Variables** et ajoute les 6
   mêmes clés que dans ton `.env` (VITE_FIREBASE_API_KEY, etc.).
4. Clique **Deploy**. Une fois terminé, Vercel te donne une URL publique
   (ex: `multivers-eau.vercel.app`) — c'est ton application, accessible
   depuis n'importe quel navigateur ou téléphone.

## 5. Utilisation au quotidien

- Ouvre l'URL Vercel, connecte-toi avec ton email/mot de passe.
- Tes données sont sauvegardées automatiquement dans Firestore à chaque
  action (vente, réappro, etc.) — identiques sur tous tes appareils dès
  que tu utilises le même compte.
- L'onglet **Produits** garde son bouton "Exporter une sauvegarde" (fichier
  JSON téléchargeable) comme filet de sécurité supplémentaire.

## Notes techniques

- Toutes les données d'un compte sont stockées dans un seul document
  Firestore : `businesses/{uid}`. Simple et largement suffisant pour un
  usage mono-utilisateur ; peut être éclaté en sous-collections plus tard
  si le volume de données grossit beaucoup (des milliers de ventes).
- La logique métier (FIFO des lots, calculs de bénéfice, bilan, etc.) est
  identique à la version testée dans Claude — seul le système de
  sauvegarde a changé (Firestore au lieu de `window.storage`).
- Pour repartir de zéro avec des identifiants Firebase différents, il
  suffit de changer les variables d'environnement — aucun changement de
  code nécessaire.
