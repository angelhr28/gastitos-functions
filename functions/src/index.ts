import {setGlobalOptions} from "firebase-functions/v2";

setGlobalOptions({
    region: "southamerica-east1",
    memory: "128MiB",        // ✅ mínimo consumo
    timeoutSeconds: 15,      // ✅ suficiente para batch chico
    maxInstances: 1,         // ✅ evita escalar innecesariamente
    concurrency: 1           // ✅ 1 request/instancia (cpu fraccional)
});

export * from "./firestore/createUserDefaults";