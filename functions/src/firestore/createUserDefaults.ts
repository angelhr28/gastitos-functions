import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

/** Formatea una fecha a dd/mm/yyyy en UTC */
const toDDMMYYYY = (d: Date): string => {
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

type BaseDoc = {
    id: string;
    userId: string;
    name: string;
    type: string;
    icon: string;
    color: string;
    syncState: "SYNCED";
    createdAt: string; // dd/mm/yyyy
    updatedAt: string; // dd/mm/yyyy
};

/** Catálogos por defecto */
const categoryDocs = [
  // EXPENSE
  { id: "expense-comida", data: { name: "Comida", type: "EXPENSE", icon: "🍔", color: "#F8D8DF" } },
  { id: "expense-educacion", data: { name: "Educación", type: "EXPENSE", icon: "🎓", color: "#F8D8DF" } },
  { id: "expense-transporte", data: { name: "Transporte", type: "EXPENSE", icon: "🚗", color: "#F8D8DF" } },
  { id: "expense-ropa", data: { name: "Ropa", type: "EXPENSE", icon: "👕", color: "#F8D8DF" } },
  { id: "expense-salud", data: { name: "Salud", type: "EXPENSE", icon: "💊", color: "#F8D8DF" } },
  { id: "expense-entretenimiento", data: { name: "Entretenimiento", type: "EXPENSE", icon: "🎮", color: "#F8D8DF" } },
  { id: "expense-servicios-basicos", data: { name: "Servicios básicos", type: "EXPENSE", icon: "💡", color: "#F8D8DF" } },
  {
    id: "expense-servicios-streaming",
    data: { name: "Servicios streaming", type: "EXPENSE", icon: "📺", color: "#F8D8DF" }
  },
  // INCOME
  { id: "income-sueldo", data: { name: "Sueldo", type: "INCOME", icon: "💼", color: "#D9F8E3" } },
  { id: "income-freelance", data: { name: "Freelance", type: "INCOME", icon: "🧑‍💻", color: "#D9F8E3" } },
  { id: "income-inversiones", data: { name: "Inversiones", type: "INCOME", icon: "📈", color: "#D9F8E3" } },
  { id: "income-bonos", data: { name: "Bonos", type: "INCOME", icon: "🎁", color: "#D9F8E3" } },
  { id: "income-otros", data: { name: "Otros ingresos", type: "INCOME", icon: "💰", color: "#D9F8E3" } },
] as const;

const paymentDocs = [
  { id: "cash", data: { name: "Efectivo", type: "CASH", icon: "💵", color: "#A2F8A2" } },
  { id: "credit", data: { name: "Tarjeta de crédito", type: "CREDIT", icon: "💳", color: "#A2D2F8" } },
  { id: "debit", data: { name: "Tarjeta de débito", type: "DEBIT", icon: "🏦", color: "#F8D7A2" } },
  { id: "transfer", data: { name: "Transferencia bancaria", type: "TRANSFER", icon: "💸", color: "#F8E5A2" } },
  { id: "wallet", data: { name: "Billetera digital", type: "WALLET", icon: "📱", color: "#D9A2F8" } },
  { id: "other", data: { name: "Otro", type: "OTHER", icon: "❓", color: "#CCCCCC" } },
] as const;

/** Construye payload con auditoría dd/mm/yyyy */
const buildBase = (
  userId: string,
  id: string,
  base: { name: string; type: string; icon: string; color: string }
): BaseDoc => {
  const today = toDDMMYYYY(new Date());
  return {
    id,
    userId,
    ...base,
    syncState: "SYNCED",
    createdAt: today,
    updatedAt: today,
  };
};

export const createUserDefaults = onDocumentCreated("users/{userId}", async (event) => {
  const eventId = event.id;
  const userId = event.params.userId;
  const userRef = db.collection("users").doc(userId);

  console.log(`[createUserDefaults] start eventId=${eventId} userId=${userId}`);

  // BulkWriter: menos roundtrips y control de errores por operación
  const writer = db.bulkWriter();

  // Ignorar "already exists"; loguear otros errores sin abortar
  writer.onWriteError((err) => {
    if (err.code === 6) return false;
    console.error("[createUserDefaults] write error", {
      code: err.code,
      message: err.message,
      path: err.documentRef?.path,
    });
    return false; // evitar reintentos → costo y consistencia
  });

  // Enqueue categorías
  for (const c of categoryDocs) {
    const ref = userRef.collection("categories").doc(c.id);
    await writer.create(ref, buildBase(userId, c.id, c.data));
  }

  // Enqueue métodos de pago
  for (const p of paymentDocs) {
    const ref = userRef.collection("payment_methods").doc(p.id);
    await writer.create(ref, buildBase(userId, p.id, p.data));
  }

  await writer.close();
  console.log(`[createUserDefaults] done eventId=${eventId} userId=${userId}`);
});
