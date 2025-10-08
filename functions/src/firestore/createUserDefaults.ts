import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

/**
 * ⚡️ Optimización de coste:
 * - 0 lecturas: NO verificamos existencia previa.
 * - IDs determinísticos -> usamos create() por doc (si existe, ignoramos el error).
 * - Sin reintentos ni lecturas adicionales; cada doc se intenta crear una sola vez.
 * - Batch de ~13+6 = 19 escrituras la primera vez; 0 en ejecuciones posteriores.
 */
export const createUserDefaults = onDocumentCreated("users/{userId}", async (event) => {
    console.log("Registre datos")
  const userId = event.params.userId;
  const userRef = db.collection("users").doc(userId);

  // IDs determinísticos para evitar lecturas y no sobreescribir si ya existen
  const categoryDocs: Array<{ id: string; data: any }> = [
    // EXPENSE
    { id: "expense-comida",              data: { name: "Comida",              type: "EXPENSE", icon: "🍔", color: "#F8D8DF" } },
    { id: "expense-educacion",           data: { name: "Educación",           type: "EXPENSE", icon: "🎓", color: "#F8D8DF" } },
    { id: "expense-transporte",          data: { name: "Transporte",          type: "EXPENSE", icon: "🚗", color: "#F8D8DF" } },
    { id: "expense-ropa",                data: { name: "Ropa",                type: "EXPENSE", icon: "👕", color: "#F8D8DF" } },
    { id: "expense-salud",               data: { name: "Salud",               type: "EXPENSE", icon: "💊", color: "#F8D8DF" } },
    { id: "expense-entretenimiento",     data: { name: "Entretenimiento",     type: "EXPENSE", icon: "🎮", color: "#F8D8DF" } },
    { id: "expense-servicios-basicos",   data: { name: "Servicios básicos",   type: "EXPENSE", icon: "💡", color: "#F8D8DF" } },
    { id: "expense-servicios-streaming", data: { name: "Servicios streaming", type: "EXPENSE", icon: "📺", color: "#F8D8DF" } },
    // INCOME
    { id: "income-sueldo",               data: { name: "Sueldo",              type: "INCOME",  icon: "💼", color: "#D9F8E3" } },
    { id: "income-freelance",            data: { name: "Freelance",           type: "INCOME",  icon: "🧑‍💻", color: "#D9F8E3" } },
    { id: "income-inversiones",          data: { name: "Inversiones",         type: "INCOME",  icon: "📈", color: "#D9F8E3" } },
    { id: "income-bonos",                data: { name: "Bonos",               type: "INCOME",  icon: "🎁", color: "#D9F8E3" } },
    { id: "income-otros",                data: { name: "Otros ingresos",      type: "INCOME",  icon: "💰", color: "#D9F8E3" } }
  ];

  const paymentDocs: Array<{ id: string; data: any }> = [
    { id: "cash",      data: { name: "Efectivo",               type: "CASH",     icon: "💵", color: "#A2F8A2" } },
    { id: "credit",    data: { name: "Tarjeta de crédito",     type: "CREDIT",   icon: "💳", color: "#A2D2F8" } },
    { id: "debit",     data: { name: "Tarjeta de débito",      type: "DEBIT",    icon: "🏦", color: "#F8D7A2" } },
    { id: "transfer",  data: { name: "Transferencia bancaria", type: "TRANSFER", icon: "💸", color: "#F8E5A2" } },
    { id: "wallet",    data: { name: "Billetera digital",      type: "WALLET",   icon: "📱", color: "#D9A2F8" } },
    { id: "other",     data: { name: "Otro",                   type: "OTHER",    icon: "❓", color: "#CCCCCC" } }
  ];

  // Helper: create() sin lectura previa; ignora ALREADY_EXISTS
  const createOrIgnore = async (colPath: string, id: string, base: any) => {
    const ref = userRef.collection(colPath).doc(id);
    const payload = {
      id,
      userId,
      ...base,
      syncState: "SYNCED",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };
    try {
      await ref.create(payload); // falla si existe -> lo ignoramos
    } catch (e: any) {
      // code puede ser 'already-exists' o similar según SDK
      // No relanzamos para evitar reintentos y lecturas.
    }
  };

  // Ejecuta en paralelo pero con límite natural (promesas cortas)
  await Promise.all([
    ...categoryDocs.map((c) => createOrIgnore("categories", c.id, c.data)),
    ...paymentDocs.map((p) => createOrIgnore("payment_methods", p.id, p.data))
  ]);
});