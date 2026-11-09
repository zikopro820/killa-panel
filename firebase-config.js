/* =========================================================
   CONFIGURACIÓN — Panel Killa Hospedaje
   Mientras apiKey diga "PEGA_AQUI", el panel funciona en MODO DEMO.
   ========================================================= */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyCgYEpPgeIwRV4dqXnap3TJzl0fLVP1NS8",
  authDomain: "hospedaje-e2658.firebaseapp.com",
  projectId: "hospedaje-e2658",
  storageBucket: "hospedaje-e2658.firebasestorage.app",
  messagingSenderId: "57180906382",
  appId: "1:57180906382:web:ac4f12d2a338727c4c7adf"
};

window.APP = {
  web: "https://zikopro820.github.io/killa-hospedaje",   // dirección de la web pública (para los QR y enlaces)

  /* EQUIPO Y PERMISOS — cada persona entra con su correo.
     rol: "Administración" → todo · "Recepción" → reservas, check-in/out, pagos, pedidos, caja, tienda
          "Limpieza" → habitaciones por limpiar y pedidos de servicio
     sedes: "todas" o la lista de sedes que puede ver, por ejemplo ["cusco"].
     Usa los MISMOS correos en firestore.rules. */
  equipo: [
    { email: "admin@killahospedaje.pe", nombre: "Administración", rol: "Administración", sedes: "todas" },
    { email: "recepcion.lima@killahospedaje.pe", nombre: "Recepción Miraflores", rol: "Recepción", sedes: ["miraflores"] },
    { email: "recepcion.cusco@killahospedaje.pe", nombre: "Recepción Cusco", rol: "Recepción", sedes: ["cusco"] },
    { email: "recepcion.mancora@killahospedaje.pe", nombre: "Recepción Máncora", rol: "Recepción", sedes: ["mancora"] },
    { email: "recepcion.oxapampa@killahospedaje.pe", nombre: "Recepción Oxapampa", rol: "Recepción", sedes: ["oxapampa"] },
    { email: "limpieza@killahospedaje.pe", nombre: "Limpieza", rol: "Limpieza", sedes: "todas" }
  ]
};
