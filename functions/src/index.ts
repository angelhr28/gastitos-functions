import { setGlobalOptions } from "firebase-functions/v2";

// ⚙️ Configuración global para todas las funciones
setGlobalOptions({
  region: "southamerica-east1", // 🇧🇷 São Paulo (más cercano a Perú)
  memory: "128MiB",   // ✅ mínimo consumo
  timeoutSeconds: 15, // ✅ suficiente para operaciones pequeñas
  maxInstances: 1,    // ✅ evita escalar innecesariamente
  concurrency: 1,     // ✅ 1 request por instancia (consumo controlado)
});

// 🚀 Exporta los triggers de Firestore
export * from "./firestore/createUserDefaults";