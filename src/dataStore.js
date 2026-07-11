import { auth } from "./firebase";

const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function getIdToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return await user.getIdToken(true);
}

function toFirestoreValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  if (typeof value === "object") return { mapValue: { fields: toFirestoreFields(value) } };
  return { stringValue: String(value) };
}
function toFirestoreFields(obj) {
  const fields = {};
  Object.entries(obj).forEach(([k, v]) => { fields[k] = toFirestoreValue(v); });
  return fields;
}
function fromFirestoreValue(value) {
  if (!value) return null;
  if ("nullValue" in value) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(fromFirestoreValue);
  if ("mapValue" in value) return fromFirestoreFields(value.mapValue.fields || {});
  return null;
}
function fromFirestoreFields(fields) {
  const obj = {};
  Object.entries(fields).forEach(([k, v]) => { obj[k] = fromFirestoreValue(v); });
  return obj;
}

export async function loadData(uid) {
  const token = await getIdToken();
  const res = await fetch(`${BASE_URL}/businesses/${uid}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Firestore read failed: " + res.status);
  const json = await res.json();
  return json.fields && json.fields.payload ? fromFirestoreValue(json.fields.payload) : null;
}

export async function saveData(uid, payload) {
  const token = await getIdToken();
  const body = {
    fields: {
      payload: toFirestoreValue(payload),
      updatedAt: { stringValue: new Date().toISOString() },
    },
  };
  const res = await fetch(`${BASE_URL}/businesses/${uid}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Firestore write failed: " + res.status);
}