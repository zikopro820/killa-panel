/* =========================================================
   KILLA — Datos de demostración (MODO DEMO)
   Este archivo es IGUAL en la web y en el panel: así los dos
   comparten las mismas reservas de prueba en el navegador.
   ========================================================= */
/* Copia cada producto a cada sede (según su estilo): cada sede queda con su propio stock */
window.KH_PRODS_POR_SEDE = function (prods, sedes) {
  const out = [];
  prods.forEach(p => {
    const destino = p.sede && p.sede !== "todas" ? sedes.filter(s => s.id === p.sede) : sedes.filter(s => !p.tipos || !p.tipos.length || p.tipos.includes(s.tipo));
    destino.forEach(s => { const { tipos, ...q } = p; out.push({ ...q, id: (p.id || "p").replace(/-(?:todas)$/, "") + "-" + s.id, sede: s.id, activo: p.activo !== false, base: p.id }); });
  });
  return out;
};
window.KH_SEMILLA = function () {
  const D = window.KH_DATOS, iso = d => { const z = new Date(d); z.setMinutes(z.getMinutes() - z.getTimezoneOffset()); return z.toISOString().slice(0, 10); };
  const hoy = new Date(), dia = n => iso(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + n)), now = new Date().toISOString();
  const db = { ajustes: { general: JSON.parse(JSON.stringify(D.ajustes)) }, sedes: {}, habitaciones: {}, productos: {}, reservas: {}, ocupacion: {}, pagos_web: {}, pedidos: {}, qr: {}, pines: {}, clientes: {}, movimientos: {} };
  D.sedes.forEach((s, i) => db.sedes[s.id] = { ...s, orden: i, wifiNombre: s.nombre.replace(/\s+/g, "_"), wifiClave: "killa" + (2026 + i) });
  D.habitaciones.forEach(h => {
    const key = "demo-" + h.id;
    db.habitaciones[h.id] = { ...h, estado: "libre", qr: key };
    const s = db.sedes[h.sede];
    db.qr[key] = { sede: h.sede, hab: h.id, num: h.num, wifiNombre: s.wifiNombre, wifiClave: s.wifiClave };
  });
  window.KH_PRODS_POR_SEDE(D.productos, D.sedes).forEach(p => db.productos[p.id] = p);

  // Reservas de ejemplo
  const ejemplos = [
    { hab: "mir-204", n: "Carlos Rivas Soto", doc: "45678912", cel: "987111222", nac: "Perú", desde: -1, noches: 3, tipo: "completo", estado: "checkin", met: "Yape", pin: "4821" },
    { hab: "cus-03", n: "Emma Johnson", doc: "P8812345", docTipo: "Pasaporte", cel: "14155550123", nac: "Estados Unidos", desde: 0, noches: 4, tipo: "adelanto", estado: "confirmada", met: "Transferencia", banco: "BCP" },
    { hab: "cus-01", n: "Lucía Mamani Quispe", doc: "71234567", cel: "984222333", nac: "Perú", desde: 2, noches: 2, tipo: "adelanto", estado: "por-validar", met: "Plin" },
    { hab: "man-11", n: "Diego Fernández", doc: "40998877", cel: "987333444", nac: "Perú", desde: 5, noches: 3, tipo: "completo", estado: "por-validar", met: "Yape", leido: 900 },
    { hab: "oxa-b", n: "Familia Torres", doc: "42112233", cel: "987555666", nac: "Perú", desde: 0, noches: 2, tipo: "adelanto", estado: "checkin", met: "Yape", pin: "1357" },
    { hab: "man-12", n: "Sofía Paredes", doc: "73334455", cel: "987666777", nac: "Perú", desde: 10, noches: 4, tipo: "adelanto", estado: "confirmada", met: "Yape" }
  ];
  ejemplos.forEach((e, i) => {
    const h = db.habitaciones[e.hab], s = db.sedes[h.sede], code = "KH-DEMO" + (i + 1), noches = [...Array(e.noches)].map((_, k) => dia(e.desde + k));
    const total = h.precio * e.noches, monto = e.tipo === "completo" ? total : h.precio;
    db.reservas[code] = { codigo: code, sede: h.sede, sedeNombre: s.nombre, hab: h.id, habNum: h.num, habTipo: h.tipo, llegada: dia(e.desde), salida: dia(e.desde + e.noches), noches: e.noches,
      adultos: Math.min(2, h.cap), ninos: 0, nombre: e.n, docTipo: e.docTipo || "DNI", docNum: e.doc, nacionalidad: e.nac, celular: e.cel, email: "", horaLlegada: "15:00", nota: "",
      precioNoche: h.precio, total, pagoTipo: e.tipo, monto, metodo: e.met, banco: e.banco || "", pagado: e.estado === "por-validar" ? 0 : monto,
      estado: e.estado, origen: i === 0 ? "recepcion" : "web", lang: e.nac === "Perú" ? "es" : "en", creado: now };
    noches.forEach(f => db.ocupacion[h.id + "_" + f] = { hab: h.id, sede: h.sede, fecha: f, reserva: code, estado: "reservada" });
    if (e.estado === "por-validar") db.pagos_web[code] = { reserva: code, tipo: "reserva", sede: h.sede, nombre: e.n, celular: e.cel, detalle: `Hab. ${h.num} · ${e.noches} noches`, total, monto, metodo: e.met, banco: e.banco || "",
      operacion: String(10000000 + i * 7919), captura: "", montoLeido: e.leido || monto, montosLeidos: [e.leido || monto], coincide: !e.leido, fechaOk: true, estado: "por-validar", creado: now };
    if (e.pin) { db.pines[h.qr] = { pin: e.pin, reserva: code, nombre: e.n }; h.estado = "ocupada"; }
  });
  db.habitaciones["cus-04"].estado = "limpieza"; db.habitaciones["oxa-c"].estado = "mantenimiento";
  // Pedidos de ejemplo
  db.pedidos["PD-DEMO1"] = { tipo: "tienda", origen: "habitacion", sede: "miraflores", hab: "mir-204", num: "204", qr: "demo-mir-204", items: [{ id: "p-cafe-miraflores", n: "Café pasado de Chanchamayo", precio: 8, cant: 2 }, { id: "p-chocolate-miraflores", n: "Chocolate al 70 %", precio: 10, cant: 1 }], total: 26, pago: "habitacion", estado: "nuevo", creado: now };
  db.pedidos["PD-DEMO2"] = { tipo: "servicio", origen: "habitacion", sede: "oxapampa", hab: "oxa-b", num: "B", qr: "demo-oxa-b", servicio: "toallas", detalle: "Toallas extra · 2", estado: "nuevo", creado: now };
  return db;
};
