import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// Un seul document Firestore par utilisateur, contenant tout l'état de
// l'application (ventes, stock, clients, prêts...). Simple et suffisant
// pour un usage mono-utilisateur ; peut être éclaté en sous-collections
// plus tard si le volume de données devient important.
function docRef(uid) {
  return doc(db, "businesses", uid);
}

export async function loadData(uid) {
  const snap = await getDoc(docRef(uid));
  return snap.exists() ? snap.data().payload : null;
}

export async function saveData(uid, payload) {
  await setDoc(docRef(uid), {
    payload,
    updatedAt: new Date().toISOString(),
  });
}
