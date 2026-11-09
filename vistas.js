/* =========================================================
   KILLA — Panel · Vistas
   ========================================================= */
const VIEWS = {}; let VISTA = "tablero";
const NAV = [
  ["tablero", "home", "Tablero", ["Administración", "Recepción"]], ["reservas", "cal", "Reservas", ["Administración", "Recepción"]],
  ["pagos", "cash", "Pagos web", ["Administración", "Recepción"]], ["pedidos", "bell", "Pedidos", ["Administración", "Recepción", "Limpieza"]],
  ["limpieza", "broom", "Limpieza", ["Administración", "Recepción", "Limpieza"]], ["caja", "cash", "Caja", ["Administración", "Recepción"]],
  ["huespedes", "users", "Huéspedes", ["Administración", "Recepción"]], ["tienda", "bag", "Tienda", ["Administración", "Recepción"]],
  ["habitaciones", "bed", "Habitaciones y QR", ["Administración"]], ["sedes", "building", "Sedes", ["Administración"]],
  ["reportes", "chart", "Reportes", ["Administración"]], ["ajustes", "gear", "Ajustes", ["Administración"]]
];
const puede = v => (NAV.find(n => n[0] === v) || [, , , []])[3].includes(YO().rol);

/* ================= Sesión ================= */
function pantallaLogin() {
  document.body.innerHTML = `<main class="login"><form class="l-box" id="lf"><div class="l-logo">${ico("moon")}</div><h1>Killa · Panel</h1><p>Entra con el correo de tu equipo.</p>
    ${DEMO ? `<div class="demo-n"><b>MODO DEMO</b> · elige con qué rol probar:</div>${fld("rol", "Entrar como", APP.equipo[0].email, { opts: APP.equipo.map(p => [p.email, `${p.nombre} · ${p.rol}`]) })}`
      : `${fld("email", "Correo", "", { type: "email", req: true, extra: 'autocomplete="username"' })}${fld("pass", "Contraseña", "", { type: "password", req: true, extra: 'autocomplete="current-password"' })}`}
    <p class="l-err" id="lErr" role="alert"></p><button class="btn btn-pri btn-lg">Entrar</button></form></main>`;
  $("#lf").addEventListener("submit", async e => {
    e.preventDefault(); const d = datosForm(e.currentTarget), err = $("#lErr");
    if (DEMO) { sessionStorage.setItem("kh_admin", d.rol); return iniciar(perfil(d.rol)); }
    try { const { au, auth } = await fb(); await au.signInWithEmailAndPassword(auth, d.email, d.pass); }
    catch (er) { err.textContent = /invalid|wrong|user-not-found/i.test(er.code || "") ? "Correo o contraseña incorrectos." : "No se pudo entrar: " + (er.code || er.message); }
  });
}
async function salir() { if (DEMO) sessionStorage.removeItem("kh_admin"); else { const { au, auth } = await fb(); await au.signOut(auth); } location.reload(); }
async function arrancar() {
  if (DEMO) { const e = sessionStorage.getItem("kh_admin"); return e && perfil(e) ? iniciar(perfil(e)) : pantallaLogin(); }
  const { au, auth } = await fb();
  au.onAuthStateChanged(auth, u => { if (!u) return pantallaLogin(); const p = perfil(u.email); if (!p) { document.body.innerHTML = `<main class="login"><div class="l-box"><h1>Sin permiso</h1><p>${esc(u.email)} no está en el equipo (firebase-config.js → equipo).</p><button class="btn btn-pri" onclick="salir()">Salir</button></div></main>`; return; } iniciar(p); });
}
async function iniciar(p) {
  USER = p; await cargarCatalogo();
  if (!CAT.sedes.length && esAdm() && !DEMO) VISTA = "ajustes";
  SEDE = store.get("kh_psede", "todas"); if (SEDE !== "todas" && !misSedes().includes(SEDE)) SEDE = "todas";
  if (!esAdm() && misSedes().length === 1) SEDE = misSedes()[0];
  if (esLimp()) VISTA = "limpieza";
  const nav = NAV.filter(n => n[3].includes(p.rol));
  document.body.innerHTML = `<div class="shell"><aside class="side" id="side"><div class="s-brand">${ico("moon")}<div><b>${esc(CAT.aj.nombre || "Killa")}</b><small>Panel</small></div></div>
      <nav class="s-nav">${nav.map(([k, i, t]) => `<button data-v="${k}">${ico(i)}<span>${t}</span><b class="cnt" id="cnt-${k}" hidden></b></button>`).join("")}</nav>
      <div class="s-user"><small>Sesión</small><b>${esc(p.nombre)}</b><span class="st mute">${esc(p.rol)}</span>${DEMO ? `<span class="st warn">MODO DEMO</span>` : ""}<button class="btn btn-light btn-sm" id="salir">${ico("logout")} Salir</button></div></aside>
    <div class="main"><header class="tb"><button class="tb-m" id="menuB" aria-label="Menú">${ico("menu")}</button>
      ${misSedes().length > 1 ? `<label class="tb-s">${ico("building")}<select id="sedeSel" aria-label="Sede">${esAdm() || YO().sedes === "todas" ? `<option value="todas">Todas las sedes</option>` : ""}${CAT.sedes.filter(s => misSedes().includes(s.id)).map(s => `<option value="${esc(s.id)}" ${SEDE === s.id ? "selected" : ""}>${esc(s.nombre)}</option>`).join("")}</select></label>` : `<span class="tb-s1">${ico("building")} ${esc(sedeDe(SEDE).nombre || "")}</span>`}
      <span class="tb-f">${fmtF(HOY(), { weekday: "long", day: "numeric", month: "long" })}</span>
      ${puede("reservas") ? `<button class="btn btn-pri btn-sm" id="nuevaR">${ico("plus")} <span>Nueva reserva</span></button>` : ""}</header>
      <main id="view" class="view" tabindex="-1"></main></div></div>`;
  if ($("#sedeSel")) $("#sedeSel").value = SEDE;
  $(".s-nav").addEventListener("click", e => { const b = e.target.closest("[data-v]"); if (b) go(b.dataset.v); });
  $("#salir").addEventListener("click", salir); $("#menuB").addEventListener("click", () => $("#side").classList.toggle("open"));
  $("#sedeSel")?.addEventListener("change", e => { SEDE = e.target.value; store.set("kh_psede", SEDE); go(VISTA); });
  $("#nuevaR")?.addEventListener("click", () => nuevaReserva());
  document.addEventListener("click", e => { const g = e.target.closest("[data-go]"); if (g) go(g.dataset.go); });
  go(puede(VISTA) ? VISTA : nav[0][0]); vigilar(); setInterval(vigilar, 20000);
}
async function go(v) {
  VISTA = v; $$(".s-nav button").forEach(b => b.setAttribute("aria-current", b.dataset.v === v ? "page" : "false")); $("#side")?.classList.remove("open");
  $("#view").innerHTML = `<div class="loading"><span class="spin"></span></div>`;
  try { await VIEWS[v](); if (!CAT.sedes.length && esAdm() && v !== "ajustes") $("#view").insertAdjacentHTML("afterbegin", `<div class="alert warn">${ico("alert")} <span><b>Tu base de datos aún no tiene sedes ni habitaciones.</b> Las reservas de la web llegan igual, pero para ver el calendario y el tablero completos ve a Ajustes y pulsa «Cargar ejemplos».</span><button class="btn btn-pri btn-sm" data-go="ajustes">Ir a Ajustes</button></div>`); } catch (e) { console.error(e); $("#view").innerHTML = `<div class="empty">${ico("alert")}<p>No se pudo cargar: ${esc(e.message)}</p></div>`; }
}
const refrescar = () => go(VISTA);

/* --- avisos en vivo: pedidos nuevos y pagos por validar --- */
let ULT_PED = null;
async function vigilar() {
  try {
    const [peds, pagos] = await Promise.all([puede("pedidos") ? DB.list("pedidos", ["estado", "in", ["nuevo", "preparando"]]) : [], puede("pagos") ? DB.list("pagos_web", ["estado", "==", "por-validar"]) : []]);
    const pp = peds.filter(p => enSede(p.sede) && p.tipo !== "encuesta" && (!esLimp() || p.tipo === "servicio")), nuevos = pp.filter(p => p.estado === "nuevo").length;
    const pw = pagos.filter(p => enSede(p.sede)).length + (puede("pagos") ? (await DB.list("pedidos", ["estado", "==", "por-validar"])).filter(p => enSede(p.sede)).length : 0);
    const set = (k, n) => { const b = $("#cnt-" + k); if (b) { b.textContent = n; b.hidden = !n; } };
    set("pedidos", nuevos); set("pagos", pw);
    if (ULT_PED !== null && nuevos > ULT_PED) { beep(); toast(`🔔 ${nuevos - ULT_PED} pedido(s) nuevo(s)`); if (VISTA === "pedidos") VIEWS.pedidos(); }
    ULT_PED = nuevos;
  } catch (e) { console.warn("vigilar:", e.message); }
}

/* ================= Reservas: utilidades ================= */
async function reservasDesde(desde) { return (await DB.list("reservas", ["salida", ">=", desde])).filter(r => enSede(r.sede)); }
function estadoHab(h, rs, hoy = HOY()) {
  const actual = rs.find(r => r.hab === h.id && r.estado === "checkin");
  if (h.estado === "mantenimiento") return { k: "mant", t: "Mantenimiento", r: actual };
  if (actual) return { k: actual.salida <= hoy ? "sale" : "ocup", t: actual.salida <= hoy ? "Sale hoy" : "Ocupada", r: actual };
  if (h.estado === "limpieza") return { k: "limp", t: "Por limpiar" };
  const llega = rs.find(r => r.hab === h.id && r.llegada === hoy && ["confirmada", "por-validar"].includes(r.estado));
  if (llega) return { k: "llega", t: "Llega hoy", r: llega };
  return { k: "libre", t: "Libre" };
}
async function ocupadas(desde, hasta, excepto) { return new Set((await DB.list("ocupacion", ["fecha", ">=", desde])).filter(o => o.fecha < hasta && o.reserva !== excepto).map(o => o.hab)); }
function movimiento(m) { const id = codigo("MV"); return { op: "set", col: "movimientos", id, data: { fecha: HOY(), hora: new Date().toISOString(), usuario: YO().nombre, ...m, monto: r2(m.monto) } }; }
async function upsertCliente(r) {
  const id = String(r.docNum || "").replace(/[^\w]/g, "").toUpperCase(); if (!id) return [];
  const c = await DB.get("clientes", id);
  return [{ op: "set", col: "clientes", id, data: { nombre: r.nombre, docTipo: r.docTipo, docNum: r.docNum, nacionalidad: r.nacionalidad || "", celular: r.celular || "", email: r.email || "", ultima: r.llegada, visitas: ((c && c.visitas) || 0) + (c && c.ultimaReserva === r.codigo ? 0 : 1), ultimaReserva: r.codigo, sedes: [...new Set([...((c && c.sedes) || []), r.sede])] } }];
}
function cotizar(h, a, b) {
  const aj = CAT.aj, enT = iso => { const md = iso.slice(5); return (aj.temporadas || []).find(x => x.desde <= x.hasta ? md >= x.desde && md <= x.hasta : md >= x.desde || md <= x.hasta); };
  const l = nochesDe(a, b).map(f => Math.round(h.precio * (1 + ((enT(f) || {}).pct || 0) / 100)));
  const total = l.reduce((x, y) => x + y, 0), ad = aj.adelantoTipo === "porcentaje" ? Math.round(total * (+aj.adelantoValor || 30) / 100) : aj.adelantoTipo === "fijo" ? +aj.adelantoValor || 50 : l[0] || 0;
  return { total, noches: l.length, adelanto: Math.min(ad, total) };
}
const msgBienvenida = (r, h, pin) => `Hola ${String(r.nombre).split(" ")[0]} 👋 ¡Bienvenido(a) a *${sedeDe(r.sede).nombre}*!\n\n🛏️ Habitación *${r.habNum}*\n📅 Salida: ${fmtF(r.salida)} hasta las ${CAT.aj.checkout}\n🔑 Tu PIN para pedir a tu habitación: *${pin}*\n\nEscanea el QR de tu habitación o entra aquí para ver el WiFi, la tienda, pedir limpieza y tours:\n${linkHab(h.qr)}\n\n¡Que disfrutes tu estadía!`;

/* ================= TABLERO ================= */
VIEWS.tablero = async () => {
  const hoy = HOY(), rs = await reservasDesde(addD(hoy, -1)), habs = CAT.habs.filter(h => enSede(h.sede) && h.activa !== false);
  const est = habs.map(h => ({ h, e: estadoHab(h, rs, hoy) })), ocu = est.filter(x => ["ocup", "sale"].includes(x.e.k)).length;
  const llegan = rs.filter(r => r.llegada === hoy && ["confirmada", "por-validar"].includes(r.estado)), salen = rs.filter(r => r.estado === "checkin" && r.salida <= hoy);
  const atras = rs.filter(r => r.estado === "checkin" && r.salida < hoy);
  const sedesV = SEDE === "todas" ? CAT.sedes.filter(s => misSedes().includes(s.id)) : [sedeDe(SEDE)];
  const K = [["Ocupación hoy", habs.length ? Math.round(ocu / habs.length * 100) + "%" : "—", `${ocu} de ${habs.length} habitaciones`], ["Llegan hoy", llegan.length, llegan.filter(r => r.estado === "por-validar").length ? `${llegan.filter(r => r.estado === "por-validar").length} con pago por validar` : "check-in desde " + CAT.aj.checkin],
    ["Salen hoy", salen.length, "check-out hasta " + CAT.aj.checkout], ["Por limpiar", est.filter(x => x.e.k === "limp").length, est.filter(x => x.e.k === "mant").length + " en mantenimiento"]];
  const li = (r, acc) => `<li><div><b>${esc(r.nombre)}</b><small>Hab. ${esc(r.habNum)} · ${esc(sedeDe(r.sede).nombre || "")} · ${r.noches} noche(s) ${r.horaLlegada ? "· llega " + esc(r.horaLlegada) : ""}</small></div>${estR(r.estado)}${acc}</li>`;
  $("#view").innerHTML = topBar("Tablero", SEDE === "todas" ? "Todas tus sedes, hoy." : esc(sedeDe(SEDE).nombre) + ", hoy.") + `
    ${atras.length ? `<div class="alert bad">${ico("alert")} <span><b>${atras.length}</b> huésped(es) debían salir antes de hoy y siguen como hospedados: ${atras.map(r => `Hab. ${esc(r.habNum)} (${esc(r.nombre)})`).join(", ")}.</span></div>` : ""}
    <div class="kpis">${K.map(([a, b, c]) => `<div class="kpi"><span>${a}</span><b>${b}</b><small>${c}</small></div>`).join("")}</div>
    <div class="two"><section class="card"><div class="card-h"><h2>${ico("in")} Llegan hoy</h2></div><ul class="lst">${llegan.map(r => li(r, `<button class="btn btn-pri btn-sm" data-ci="${esc(r.id)}">${ico("key")} Check-in</button>`)).join("") || `<li class="muted">Nadie más llega hoy.</li>`}</ul></section>
      <section class="card"><div class="card-h"><h2>${ico("out")} Salen hoy</h2></div><ul class="lst">${salen.map(r => li(r, `<button class="btn btn-acc btn-sm" data-co="${esc(r.id)}">${ico("out")} Check-out</button>`)).join("") || `<li class="muted">Nadie sale hoy.</li>`}</ul></section></div>
    ${sedesV.map(s => { const l = est.filter(x => x.h.sede === s.id); return l.length ? `<section class="card"><div class="card-h"><h2>${ico("bed")} ${esc(s.nombre)}</h2><div class="leg">${[["libre", "Libre"], ["llega", "Llega hoy"], ["ocup", "Ocupada"], ["sale", "Sale hoy"], ["limp", "Por limpiar"], ["mant", "Mantenimiento"]].map(([k, t]) => `<span class="lg ${k}">${t}</span>`).join("")}</div></div>
      <div class="rooms">${l.map(({ h, e }) => `<button class="room ${e.k}" data-room="${esc(h.id)}"><b>${esc(h.num)}</b><small>${esc(h.tipo)}</small><span>${e.t}</span>${e.r ? `<em>${esc(String(e.r.nombre).split(" ").slice(0, 2).join(" "))}${e.k === "ocup" ? " · sale " + fmtF(e.r.salida, { day: "numeric", month: "short" }) : ""}</em>` : ""}</button>`).join("")}</div></section>` : ""; }).join("")}`;
  const V = $("#view");
  V.onclick = async e => {
    const ci = e.target.closest("[data-ci]"), co = e.target.closest("[data-co]"), rm = e.target.closest("[data-room]");
    if (ci) return checkIn(rs.find(r => r.id === ci.dataset.ci)); if (co) return checkOut(rs.find(r => r.id === co.dataset.co));
    if (rm) { const h = habDe(rm.dataset.room), x = est.find(y => y.h.id === h.id).e; return menuHab(h, x); }
  };
};
function menuHab(h, x) {
  const r = x.r;
  modal(`Habitación ${h.num} · ${sedeDe(h.sede).nombre}`, `<p class="muted">${esc(h.tipo)} · hasta ${h.cap} personas · ${S(h.precio)} / noche</p>
    <p>Estado: <b>${x.t}</b></p>${r ? `<div class="mini-r">${estR(r.estado)} <b>${esc(r.nombre)}</b><small>${fmtF(r.llegada)} → ${fmtF(r.salida)} · ${esc(r.celular || "")}</small></div>` : ""}
    <div class="acts-g">${r ? `<button type="button" class="btn btn-light" data-a="ver">${ico("file")} Ver reserva</button>` : ""}
      ${r && r.estado !== "checkin" ? `<button type="button" class="btn btn-pri" data-a="ci">${ico("key")} Check-in</button>` : ""}${r && r.estado === "checkin" ? `<button type="button" class="btn btn-acc" data-a="co">${ico("out")} Check-out</button><button type="button" class="btn btn-light" data-a="cuenta">${ico("cash")} Ver cuenta</button>` : ""}
      ${!r && x.k === "libre" ? `<button type="button" class="btn btn-pri" data-a="nueva">${ico("plus")} Nueva reserva aquí</button>` : ""}
      ${x.k === "limp" ? `<button type="button" class="btn btn-pri" data-a="lista">${ico("check")} Ya está limpia</button>` : ""}
      ${x.k !== "mant" ? `<button type="button" class="btn btn-light" data-a="mant">${ico("tool")} Mantenimiento</button>` : `<button type="button" class="btn btn-pri" data-a="lista">${ico("check")} Habilitar</button>`}
      ${h.qr ? `<a class="btn btn-light" target="_blank" rel="noopener" href="${linkHab(h.qr)}">${ico("qr")} Abrir su página QR</a>` : ""}</div>`, null);
  $("#mB").onclick = async e => { const b = e.target.closest("[data-a]"); if (!b) return; const a = b.dataset.a; cerrarModal();
    if (a === "ver") return verReserva(r); if (a === "ci") return checkIn(r); if (a === "co") return checkOut(r); if (a === "cuenta") return checkOut(r, true);
    if (a === "nueva") return nuevaReserva({ sede: h.sede, hab: h.id });
    if (a === "lista" || a === "mant") { await DB.set("habitaciones", h.id, { estado: a === "lista" ? "libre" : "mantenimiento" }); h.estado = a === "lista" ? "libre" : "mantenimiento"; toast("Habitación actualizada"); refrescar(); } };
}

/* ================= RESERVAS ================= */
let CAL0 = null;
VIEWS.reservas = async () => {
  const hoy = HOY(); CAL0 = CAL0 || addD(hoy, -1); const dias = 14, fin = addD(CAL0, dias);
  const rs = (await reservasDesde(CAL0)).filter(r => r.llegada < fin && !["cancelada", "rechazada"].includes(r.estado));
  const habs = CAT.habs.filter(h => enSede(h.sede) && h.activa !== false), ds = [...Array(dias)].map((_, i) => addD(CAL0, i));
  const q = (CUR_Q || "").toLowerCase();
  $("#view").innerHTML = topBar("Reservas", "Toca un espacio libre para reservar o una barra para ver la reserva.", `<button class="btn btn-light btn-sm" data-cal="-7">${ico("left")}</button><button class="btn btn-light btn-sm" data-cal="0">Hoy</button><button class="btn btn-light btn-sm" data-cal="7">${ico("right")}</button>`) + `
    <div class="cal-w card"><div class="cal" style="--n:${dias}"><div class="cal-hd"><span></span>${ds.map(d => `<span class="${d === hoy ? "hoy" : ""} ${[0, 6].includes(new Date(d + "T12:00").getDay()) ? "fin" : ""}"><small>${fmtF(d, { weekday: "short" })}</small><b>${+d.slice(8)}</b></span>`).join("")}</div>
      ${habs.map(h => `<div class="cal-r"><span class="cal-n"><b>${esc(h.num)}</b><small>${esc(SEDE === "todas" ? sedeDe(h.sede).nombre.replace(/^Killa /, "") : h.tipo)}</small></span>
        ${ds.map((d, i) => `<button class="cal-c ${d === hoy ? "hoy" : ""}" style="grid-column:${i + 2}" data-libre="${esc(h.id)}|${d}" aria-label="Reservar ${esc(h.num)} el ${d}"></button>`).join("")}
        ${rs.filter(r => r.hab === h.id).map(r => { const a = Math.max(0, difD(CAL0, r.llegada)), b = Math.min(dias, difD(CAL0, r.salida)); if (b <= 0 || a >= dias) return "";
          return `<button class="cal-b ${esc(r.estado)}" style="grid-column:${a + 2} / ${b + 2}" data-res="${esc(r.id)}" title="${esc(r.nombre)} · ${fmtF(r.llegada)} → ${fmtF(r.salida)}"><span>${esc(r.nombre)}</span></button>`; }).join("")}</div>`).join("")}
    </div></div>
    <div class="leg">${Object.entries(EST_R).slice(0, 4).map(([k, [t]]) => `<span class="lg b-${k}">${t}</span>`).join("")}</div>
    <section class="card"><div class="card-h"><h2>Próximas y en curso</h2><input class="q" id="rq" placeholder="Buscar nombre, DNI, código o habitación" value="${esc(CUR_Q || "")}"></div>
      <div class="tbl-w"><table class="tbl"><thead><tr><th>Código</th><th>Huésped</th><th>Hab.</th><th>Fechas</th><th>Total</th><th>Pagado</th><th>Estado</th><th></th></tr></thead><tbody>
      ${(await reservasDesde(hoy)).filter(r => !q || [r.nombre, r.docNum, r.codigo || r.id, r.habNum, r.celular].join(" ").toLowerCase().includes(q)).sort((a, b) => a.llegada.localeCompare(b.llegada)).map(r => `<tr><td class="mono">${esc(r.codigo || r.id)}</td><td><b>${esc(r.nombre)}</b><small>${esc(r.docTipo)} ${esc(r.docNum)} · ${r.origen === "web" ? "Web" : "Recepción"}</small></td>
        <td>${esc(r.habNum)}<small>${esc(sedeDe(r.sede).nombre || "")}</small></td><td>${fmtF(r.llegada)} → ${fmtF(r.salida)}<small>${r.noches} noche(s)</small></td><td>${S(r.total)}</td><td>${S(r.pagado)}</td><td>${estR(r.estado)}</td><td><button class="btn btn-light btn-sm" data-res="${esc(r.id)}">Ver</button></td></tr>`).join("") || `<tr><td colspan="8" class="muted">Sin reservas.</td></tr>`}</tbody></table></div></section>`;
  const V = $("#view");
  V.onclick = async e => { const c = e.target.closest("[data-cal]"), l = e.target.closest("[data-libre]"), r = e.target.closest("[data-res]");
    if (c) { CAL0 = c.dataset.cal === "0" ? addD(HOY(), -1) : addD(CAL0, +c.dataset.cal); return VIEWS.reservas(); }
    if (l) { const [hab, f] = l.dataset.libre.split("|"); if (f < HOY()) return toast("Esa fecha ya pasó", true); return nuevaReserva({ sede: habDe(hab).sede, hab, llegada: f }); }
    if (r) return verReserva(await DB.get("reservas", r.dataset.res)); };
  $("#rq").addEventListener("change", e => { CUR_Q = e.target.value; VIEWS.reservas(); });
};
let CUR_Q = "";

async function verReserva(r) {
  if (!r) return; r.codigo = r.codigo || r.id; const h = habDe(r.hab), saldo = Math.max(r.total - (+r.pagado || 0), 0), pw = await DB.get("pagos_web", r.codigo);
  modal(`Reserva ${r.codigo}`, `<div class="rv">${estR(r.estado)} <span class="st mute">${r.origen === "web" ? "Reservó por la web" : "Reservó en recepción"}</span>
    <dl class="dl"><div><dt>Huésped</dt><dd>${esc(r.nombre)}<small>${esc(r.docTipo)} ${esc(r.docNum)} · ${esc(r.nacionalidad || "")}</small></dd></div><div><dt>Celular</dt><dd>${esc(r.celular || "—")}<small>${esc(r.email || "")}</small></dd></div>
      <div><dt>Habitación</dt><dd>${esc(r.habNum)} · ${esc(r.habTipo)}<small>${esc(sedeDe(r.sede).nombre || "")}</small></dd></div><div><dt>Fechas</dt><dd>${fmtF(r.llegada)} → ${fmtF(r.salida)}<small>${r.noches} noche(s) · ${r.adultos || 1} adulto(s)${r.ninos ? ` + ${r.ninos} niño(s)` : ""}</small></dd></div>
      <div><dt>Total</dt><dd>${S(r.total)}<small>${S(r.precioNoche)} / noche</small></dd></div><div><dt>Pagado</dt><dd>${S(r.pagado)}<small>Saldo ${S(saldo)}${r.metodo ? " · " + esc(r.metodo) + (r.banco ? " " + esc(r.banco) : "") : ""}</small></dd></div>
      ${r.horaLlegada ? `<div><dt>Llegada aprox.</dt><dd>${esc(r.horaLlegada)}</dd></div>` : ""}${r.boleta ? `<div><dt>Boleta / factura</dt><dd>${esc(r.boleta)}</dd></div>` : ""}</dl>
    ${r.nota ? `<p class="nota">📝 ${esc(r.nota)}</p>` : ""}${pw && pw.estado === "por-validar" ? `<div class="alert warn">${ico("cash")} Pago de ${S(pw.monto)} por ${esc(pw.metodo)} esperando validación. <button type="button" class="btn btn-sm btn-pri" data-a="pago">Revisar pago</button></div>` : ""}
    <div class="acts-g">${["confirmada", "por-validar"].includes(r.estado) ? `<button type="button" class="btn btn-pri" data-a="ci">${ico("key")} Check-in</button>` : ""}
      ${r.estado === "checkin" ? `<button type="button" class="btn btn-acc" data-a="co">${ico("out")} Check-out</button><button type="button" class="btn btn-light" data-a="pin">${ico("key")} Reenviar PIN</button>` : ""}
      ${saldo > 0 && !["cancelada", "rechazada", "finalizada"].includes(r.estado) ? `<button type="button" class="btn btn-light" data-a="cobrar">${ico("cash")} Registrar pago</button>` : ""}
      <button type="button" class="btn btn-light" data-a="pdf">${ico("file")} Comprobante PDF</button><button type="button" class="btn btn-wa" data-a="wa">${ico("wa")} WhatsApp</button>
      <button type="button" class="btn btn-light" data-a="boleta">${ico("edit")} N.° de boleta</button>
      ${["confirmada", "por-validar"].includes(r.estado) ? `<button type="button" class="btn btn-light danger" data-a="cancelar">${ico("x")} Cancelar reserva</button>` : ""}</div></div>`, null, "", { wide: true });
  $("#mB").onclick = async e => { const b = e.target.closest("[data-a]"); if (!b) return; const a = b.dataset.a;
    if (a === "pdf") return pdfReserva(r);
    if (a === "wa") return abrirWA(r.celular, `Hola ${String(r.nombre).split(" ")[0]}, te escribimos de *${sedeDe(r.sede).nombre}* sobre tu reserva ${r.codigo} (hab. ${r.habNum}, ${fmtF(r.llegada)} → ${fmtF(r.salida)}).\nTu comprobante: ${linkReserva(r.codigo)}`);
    cerrarModal();
    if (a === "ci") return checkIn(r); if (a === "co") return checkOut(r); if (a === "pago") return go("pagos");
    if (a === "pin") { const p = await DB.get("pines", h.qr); return p ? abrirWA(r.celular, msgBienvenida(r, h, p.pin)) : toast("Esta estadía no tiene PIN", true); }
    if (a === "cobrar") return cobrar(r);
    if (a === "boleta") return modal("Boleta o factura", fld("boleta", "Número de boleta o factura (SUNAT)", r.boleta || "", { ph: "B001-000123", full: true }), async d => { await DB.set("reservas", r.id, { boleta: d.boleta }); toast("Guardado"); refrescar(); });
    if (a === "cancelar") return modal("Cancelar reserva", `<p>Se libera la habitación ${esc(r.habNum)} para esas fechas.</p>${fld("motivo", "Motivo", "", { full: true, ph: "Ej. el huésped canceló" })}${(+r.pagado || 0) > 0 ? fld("devolver", `Registrar devolución de ${S(r.pagado)} en caja`, false, { type: "checkbox", full: true }) : ""}`, async d => {
      const ocs = (await DB.list("ocupacion", ["reserva", "==", r.id]));
      await DB.batch([{ op: "set", col: "reservas", id: r.id, data: { estado: "cancelada", motivo: d.motivo || "" } }, ...ocs.map(o => ({ op: "del", col: "ocupacion", id: o.id })), ...(d.devolver ? [movimiento({ sede: r.sede, concepto: `Devolución reserva ${r.codigo}`, monto: -(+r.pagado), metodo: r.metodo || "Efectivo", reserva: r.codigo })] : [])]);
      toast("Reserva cancelada"); refrescar(); }, "Cancelar reserva");
  };
}
function cobrar(r, conceptoBase = "Pago de estadía") {
  const saldo = Math.max(r.total - (+r.pagado || 0), 0);
  modal(`Registrar pago · ${r.codigo || r.id}`, `<div class="g2">${fld("monto", "Monto (S/)", saldo, { type: "number", req: true, extra: 'min="0.1" step="0.1"' })}${fld("metodo", "Método", "Efectivo", { opts: METODOS })}</div>`, async d => {
    if (!(d.monto > 0)) { toast("Monto no válido", true); return false; }
    await DB.batch([{ op: "set", col: "reservas", id: r.id, data: { pagado: r2((+r.pagado || 0) + d.monto) } }, movimiento({ sede: r.sede, concepto: `${conceptoBase} · Hab. ${r.habNum} · ${r.nombre}`, monto: d.monto, metodo: d.metodo, reserva: r.codigo || r.id })]);
    toast(`Pago de ${S(d.monto)} registrado`); refrescar();
  }, "Registrar");
}

/* --- nueva reserva en recepción --- */
async function nuevaReserva(pre = {}) {
  const sedes = CAT.sedes.filter(s => misSedes().includes(s.id)); if (!sedes.length) return toast("No tienes sedes", true);
  const R = { sede: pre.sede || (SEDE !== "todas" ? SEDE : sedes[0].id), hab: pre.hab || "", llegada: pre.llegada || HOY(), salida: addD(pre.llegada || HOY(), 1) };
  modal("Nueva reserva (recepción)", `<div class="g2">
    ${sedes.length > 1 ? fld("sede", "Sede", R.sede, { opts: sedes.map(s => [s.id, s.nombre]) }) : `<input type="hidden" name="sede" value="${esc(R.sede)}">`}
    ${fld("llegada", "Llegada", R.llegada, { type: "date", req: true })}${fld("salida", "Salida", R.salida, { type: "date", req: true })}
    ${fld("adultos", "Adultos", 2, { type: "number", extra: 'min="1" max="10"' })}${fld("ninos", "Niños", 0, { type: "number", extra: 'min="0" max="10"' })}
    <label class="fld full"><span>Habitación libre *</span><select name="hab" id="nrHab" required></select></label>
    <div class="full sep">Huésped</div>
    <label class="fld"><span>N.° de documento *</span><div class="in-b"><input name="docNum" required maxlength="20" id="nrDoc"><button type="button" class="btn btn-light btn-sm" id="nrBus">${ico("search")}</button></div><small id="nrCli"></small></label>
    ${fld("docTipo", "Tipo", "DNI", { opts: ["DNI", "Pasaporte", "Carné de extranjería"] })}${fld("nombre", "Nombres y apellidos", "", { req: true, full: true })}
    ${fld("nacionalidad", "Nacionalidad", "Perú")}${fld("celular", "Celular (WhatsApp)", "", { type: "tel", req: true })}${fld("email", "Correo", "", { type: "email", full: true })}
    <div class="full sep">Pago (obligatorio)</div>
    <div class="full" id="nrCot"></div>
    ${fld("pagoTipo", "¿Cuánto paga ahora?", "completo", { opts: [["completo", "Todo"], ["adelanto", "Adelanto"], ["otro", "Otro monto"]] })}${fld("monto", "Monto (S/)", "", { type: "number", req: true, extra: 'min="1" step="0.1"' })}
    ${fld("metodo", "Método", "Efectivo", { opts: METODOS })}${fld("boleta", "N.° de boleta o factura (opcional)", "", { ph: "B001-000123" })}
    ${fld("nota", "Nota", "", { full: true })}${fld("checkin", "Hacer check-in ahora (llega hoy)", R.llegada === HOY(), { type: "checkbox", full: true })}</div>`, async d => {
    const h = habDe(d.hab); if (!h.id) { toast("Elige una habitación", true); return false; }
    if (d.salida <= d.llegada) { toast("La salida debe ser después de la llegada", true); return false; }
    if ((+d.adultos || 1) + (+d.ninos || 0) > h.cap) { toast(`La habitación ${h.num} es para ${h.cap} persona(s)`, true); return false; }
    if ((await ocupadas(d.llegada, d.salida)).has(h.id)) { toast("Esa habitación ya está ocupada en esas fechas", true); return false; }
    const c = cotizar(h, d.llegada, d.salida); if (!(d.monto > 0)) { toast("El pago es obligatorio", true); return false; }
    const s = sedeDe(h.sede), cod = codigo("KH"), ci = d.checkin && d.llegada === HOY();
    const r = { codigo: cod, sede: s.id, sedeNombre: s.nombre, hab: h.id, habNum: String(h.num), habTipo: h.tipo, llegada: d.llegada, salida: d.salida, noches: c.noches, adultos: +d.adultos || 1, ninos: +d.ninos || 0,
      nombre: d.nombre, docTipo: d.docTipo, docNum: d.docNum, nacionalidad: d.nacionalidad, celular: d.celular, email: d.email, horaLlegada: "", nota: d.nota, precioNoche: +h.precio, total: c.total, pagoTipo: d.pagoTipo,
      monto: r2(d.monto), metodo: d.metodo, banco: "", pagado: r2(Math.min(d.monto, c.total)), estado: ci ? "checkin" : "confirmada", origen: "recepcion", boleta: d.boleta, creado: new Date().toISOString(), creadoPor: YO().nombre };
    const ops = [{ op: "set", col: "reservas", id: cod, data: r, merge: false }, ...nochesDe(d.llegada, d.salida).map(f => ({ op: "set", col: "ocupacion", id: h.id + "_" + f, data: { hab: h.id, sede: h.sede, fecha: f, reserva: cod, estado: "reservada" }, merge: false })),
      movimiento({ sede: h.sede, concepto: `Reserva ${cod} · Hab. ${h.num} · ${d.nombre}`, monto: Math.min(d.monto, c.total), metodo: d.metodo, reserva: cod }), ...(await upsertCliente(r))];
    let pin = null; if (ci) { const k = await asegurarQR(h); pin = pin4(); ops.push({ op: "set", col: "pines", id: k, data: { pin, reserva: cod, nombre: r.nombre }, merge: false }, { op: "set", col: "habitaciones", id: h.id, data: { estado: "ocupada" } }); r.checkinHora = new Date().toISOString(); }
    await DB.batch(ops); toast(`Reserva ${cod} creada`);
    modal("Reserva creada", `<p><b>${esc(cod)}</b> · Hab. ${esc(h.num)} · ${fmtF(r.llegada)} → ${fmtF(r.salida)}</p><p>Total ${S(r.total)} · pagado ${S(r.pagado)} · saldo ${S(r.total - r.pagado)}</p>${pin ? `<p class="pin-big">PIN de la estadía: <b>${pin}</b></p>` : ""}
      <div class="acts-g"><button type="button" class="btn btn-pri" id="nrPdf">${ico("file")} Comprobante PDF</button><button type="button" class="btn btn-wa" id="nrWa">${ico("wa")} Enviar por WhatsApp</button></div>`, null);
    $("#nrPdf").onclick = () => pdfReserva(r);
    $("#nrWa").onclick = () => abrirWA(r.celular, pin ? msgBienvenida(r, habDe(h.id), pin) : `Hola ${String(r.nombre).split(" ")[0]} 👋 Tu reserva en *${s.nombre}* está confirmada.\n\n🧾 Código: *${cod}*\n🛏️ Habitación ${h.num}\n📅 ${fmtF(r.llegada)} → ${fmtF(r.salida)} (${r.noches} noche(s))\n💵 Total ${S(r.total)} · pagado ${S(r.pagado)}\n\nTu comprobante: ${linkReserva(cod)}`);
    refrescar(); return false;
  }, "Crear reserva", { wide: true, alAbrir: F => {
    const v = n => $(`[name=${n}]`, F);
    async function habs() {
      const a = v("llegada").value, b = v("salida").value, sel = $("#nrHab"), cur = sel.value || R.hab; if (b <= a) { sel.innerHTML = `<option value="">La salida debe ser después de la llegada</option>`; return cot(); }
      const oc = await ocupadas(a, b), tot = (+v("adultos").value || 1) + (+v("ninos").value || 0);
      const l = CAT.habs.filter(h => h.sede === v("sede").value && h.activa !== false && h.estado !== "mantenimiento");
      sel.innerHTML = `<option value="">— Elige —</option>` + l.map(h => { const ok = !oc.has(h.id) && h.cap >= tot; return `<option value="${esc(h.id)}" ${ok ? "" : "disabled"} ${ok && h.id === cur ? "selected" : ""}>${esc(h.num)} · ${esc(h.tipo)} · ${S(h.precio)}/noche · ${ok ? `hasta ${h.cap}` : oc.has(h.id) ? "OCUPADA" : `solo ${h.cap} pers.`}</option>`; }).join("");
      cot();
    }
    function cot() { const h = habDe($("#nrHab").value), a = v("llegada").value, b = v("salida").value; if (!h.id || b <= a) { $("#nrCot").innerHTML = ""; return; }
      const c = cotizar(h, a, b), t = v("pagoTipo").value; $("#nrCot").innerHTML = `<div class="cot"><span>${c.noches} noche(s) · Total <b>${S(c.total)}</b></span><span>Adelanto sugerido ${S(c.adelanto)}</span></div>`;
      if (t !== "otro") v("monto").value = t === "completo" ? c.total : c.adelanto; }
    ["sede", "llegada", "salida", "adultos", "ninos"].forEach(n => v(n)?.addEventListener("change", () => { if (n === "llegada") { if (v("salida").value <= v("llegada").value) v("salida").value = addD(v("llegada").value, 1); v("checkin").checked = v("llegada").value === HOY(); } habs(); }));
    $("#nrHab").addEventListener("change", cot); v("pagoTipo").addEventListener("change", cot);
    const buscar = async () => { const id = v("docNum").value.replace(/[^\w]/g, "").toUpperCase(); if (!id) return; const c = await DB.get("clientes", id);
      if (!c) { $("#nrCli").textContent = "Cliente nuevo"; return; } v("nombre").value = c.nombre || ""; v("celular").value = c.celular || ""; v("email").value = c.email || ""; v("nacionalidad").value = c.nacionalidad || ""; v("docTipo").value = c.docTipo || "DNI";
      $("#nrCli").innerHTML = `✓ Cliente frecuente · ${c.visitas || 1} visita(s)`; };
    $("#nrBus").addEventListener("click", buscar); v("docNum").addEventListener("change", buscar);
    habs();
  } });
}
async function asegurarQR(h) {
  if (h.qr) return h.qr; const k = llaveQR(), s = sedeDe(h.sede);
  await DB.batch([{ op: "set", col: "habitaciones", id: h.id, data: { qr: k } }, { op: "set", col: "qr", id: k, data: { sede: h.sede, hab: h.id, num: String(h.num), wifiNombre: s.wifiNombre || "", wifiClave: s.wifiClave || "" }, merge: false }]);
  h.qr = k; return k;
}

/* --- check-in y check-out --- */
async function checkIn(r) {
  if (!r) return; const h = habDe(r.hab), saldo = Math.max(r.total - (+r.pagado || 0), 0);
  const ocupante = (await DB.list("reservas", ["hab", "==", r.hab])).find(x => x.estado === "checkin" && x.id !== r.id);
  modal(`Check-in · Hab. ${r.habNum}`, `${r.estado === "por-validar" ? `<div class="alert warn">${ico("alert")} El pago web de esta reserva aún no se valida. Revísalo antes o cobra aquí.</div>` : ""}
    ${ocupante ? `<div class="alert bad">${ico("alert")} La habitación aún figura ocupada por ${esc(ocupante.nombre)}. Haz su check-out primero.</div>` : ""}${h.estado === "limpieza" ? `<div class="alert warn">${ico("broom")} La habitación figura «por limpiar».</div>` : ""}
    <p><b>${esc(r.nombre)}</b> · ${esc(r.docTipo)} ${esc(r.docNum)}<br><small class="muted">${fmtF(r.llegada)} → ${fmtF(r.salida)} · ${r.noches} noche(s)</small></p>
    <div class="g2">${fld("docNum", "Confirma el documento", r.docNum, { req: true })}${fld("celular", "Celular", r.celular, { type: "tel" })}
    ${saldo > 0 ? `${fld("cobro", `Cobrar saldo ahora (${S(saldo)})`, 0, { type: "number", extra: `min="0" max="${saldo}" step="0.1"`, help: "Déjalo en 0 si paga al salir." })}${fld("metodo", "Método", "Efectivo", { opts: METODOS })}` : `<p class="full ok-t">${ico("check")} Estadía pagada.</p>`}
    ${fld("enviar", "Enviar bienvenida con PIN por WhatsApp", true, { type: "checkbox", full: true })}</div>`, async d => {
    if (ocupante) { toast("Primero el check-out del huésped anterior", true); return false; }
    const k = await asegurarQR(h), pin = pin4(), cobro = Math.min(+d.cobro || 0, saldo);
    const ops = [{ op: "set", col: "reservas", id: r.id, data: { estado: "checkin", checkinHora: new Date().toISOString(), docNum: d.docNum, celular: d.celular || r.celular, pagado: r2((+r.pagado || 0) + cobro) } },
      { op: "set", col: "pines", id: k, data: { pin, reserva: r.codigo || r.id, nombre: r.nombre }, merge: false }, { op: "set", col: "habitaciones", id: h.id, data: { estado: "ocupada" } }, ...(await upsertCliente({ ...r, docNum: d.docNum }))];
    if (cobro > 0) ops.push(movimiento({ sede: r.sede, concepto: `Saldo en check-in · Hab. ${r.habNum} · ${r.nombre}`, monto: cobro, metodo: d.metodo, reserva: r.codigo || r.id }));
    if (r.estado === "por-validar") { const pw = await DB.get("pagos_web", r.id); if (pw && pw.estado === "por-validar") toast("Recuerda validar el pago web", true); }
    await DB.batch(ops); h.estado = "ocupada";
    toast(`Check-in listo · PIN ${pin}`); if (d.enviar) abrirWA(d.celular || r.celular, msgBienvenida(r, h, pin));
    modal("Check-in listo", `<p class="pin-big">PIN de la estadía<br><b>${pin}</b></p><p class="muted">Con este PIN el huésped puede cargar pedidos a su habitación desde el QR. Al hacer check-out se anula.</p>`, null);
    if (VISTA !== "tablero") refrescar(); else VIEWS.tablero();
    return false;
  }, "Hacer check-in");
}
async function consumosDe(r) {
  const h = habDe(r.hab); if (!h.qr) return [];
  return (await DB.list("pedidos", ["qr", "==", h.qr])).filter(p => p.pago === "habitacion" && p.estado !== "anulado" && !p.cobrado && (!r.checkinHora || p.creado >= r.checkinHora));
}
async function checkOut(r, soloVer) {
  if (!r) return; const h = habDe(r.hab), cons = await consumosDe(r), consT = cons.reduce((a, p) => a + (+p.total || 0), 0), totalG = r.total + consT, saldo = Math.max(totalG - (+r.pagado || 0), 0);
  const hoy = HOY(), temprano = r.salida > hoy;
  modal(`${soloVer ? "Cuenta" : "Check-out"} · Hab. ${r.habNum}`, `<p><b>${esc(r.nombre)}</b> · ${fmtF(r.llegada)} → ${fmtF(r.salida)}</p>
    <table class="tbl cuenta"><tr><td>Estadía (${r.noches} noche(s))</td><td>${S(r.total)}</td></tr>${cons.map(p => `<tr><td>${p.tipo === "tour" ? "Tour" : "Pedido"} ${fmtF(p.creado)} · ${esc(p.items ? p.items.map(i => i.cant + "× " + i.n).join(", ") : p.detalle || "")}</td><td>${S(p.total)}</td></tr>`).join("")}
      <tr class="t"><td>Total</td><td>${S(totalG)}</td></tr><tr><td>Pagado</td><td>${S(r.pagado)}</td></tr><tr class="t"><td>Saldo</td><td>${S(saldo)}</td></tr></table>
    ${soloVer ? "" : `${temprano ? `<div class="alert warn">${ico("alert")} Sale antes de lo reservado (${fmtF(r.salida)}). Se liberan las noches que no usará; ajusta el total si corresponde.</div>${fld("nuevoTotal", "Total de la estadía (S/)", r.total, { type: "number", extra: 'min="0" step="0.1"' })}` : ""}
      <div class="g2">${saldo > 0 ? `${fld("cobro", "Cobrar ahora (S/)", saldo, { type: "number", extra: 'min="0" step="0.1"' })}${fld("metodo", "Método", "Efectivo", { opts: METODOS })}` : `<p class="full ok-t">${ico("check")} Sin saldo pendiente.</p>`}
      ${fld("boleta", "N.° de boleta o factura (opcional)", r.boleta || "", { ph: "B001-000123" })}${fld("recibo", "Descargar recibo en PDF", true, { type: "checkbox" })}</div>`}`, soloVer ? null : async d => {
    const total = temprano && d.nuevoTotal !== "" ? +d.nuevoTotal : r.total, tg = total + consT, cobro = +d.cobro || 0, pag = r2((+r.pagado || 0) + cobro);
    if (pag + 0.01 < tg && !confirm(`Queda un saldo de ${S(tg - pag)}. ¿Hacer check-out igual?`)) return false;
    const ops = [{ op: "set", col: "reservas", id: r.id, data: { estado: "finalizada", checkoutHora: new Date().toISOString(), pagado: pag, total, consumos: consT, boleta: d.boleta || r.boleta || "", ...(temprano ? { salida: hoy, noches: Math.max(1, difD(r.llegada, hoy)) } : {}) } },
      { op: "set", col: "habitaciones", id: h.id, data: { estado: "limpieza" } }, ...cons.map(p => ({ op: "set", col: "pedidos", id: p.id, data: { cobrado: true } }))];
    if (h.qr) ops.push({ op: "del", col: "pines", id: h.qr });
    if (cobro > 0) ops.push(movimiento({ sede: r.sede, concepto: `Check-out · Hab. ${r.habNum} · ${r.nombre}`, monto: cobro, metodo: d.metodo, reserva: r.codigo || r.id }));
    if (temprano) (await DB.list("ocupacion", ["reserva", "==", r.id])).filter(o => o.fecha >= hoy).forEach(o => ops.push({ op: "del", col: "ocupacion", id: o.id }));
    await DB.batch(ops); h.estado = "limpieza"; toast("Check-out listo · la habitación pasó a «por limpiar»");
    if (d.recibo) pdfReserva({ ...r, total, estado: "finalizada", boleta: d.boleta || r.boleta }, { consumos: cons.map(p => ({ t: (p.items || []).map(i => i.cant + "× " + i.n).join(", ") || p.detalle || "Pedido", m: +p.total || 0 })), pagadoFinal: pag });
    refrescar();
  }, "Hacer check-out");
}

/* ================= PAGOS WEB ================= */
VIEWS.pagos = async () => {
  const [pws, peds] = await Promise.all([DB.list("pagos_web", ["estado", "==", "por-validar"]), DB.list("pedidos", ["estado", "==", "por-validar"])]);
  const l = [...pws.map(p => ({ ...p, _t: "reserva" })), ...peds.map(p => ({ ...p, _t: "tienda", detalle: (p.items || []).map(i => i.cant + "× " + i.n).join(", ") + (p.entrega === "habitacion" ? ` · a la hab. ${p.num}` : " · recojo") }))].filter(p => enSede(p.sede)).sort((a, b) => String(a.creado).localeCompare(String(b.creado)));
  const ops = {}; [...pws, ...peds].forEach(p => { if (p.operacion) ops[p.operacion] = (ops[p.operacion] || 0) + 1; });
  $("#view").innerHTML = topBar("Pagos web", "Reservas y compras pagadas con Yape, Plin o transferencia. Revisa tu app o banca y confirma.") + `
    <div class="alert warn">${ico("alert")} <span>La lectura automática ayuda, pero una captura se puede editar. <b>Antes de validar, confirma en tu app o banca que el dinero llegó.</b></span></div>
    <div class="pws">${l.map(p => { const al = [];
      if (p.montoLeido == null) al.push(["warn", "No se pudo leer el monto de la captura."]); else if (p.coincide === false) al.push(["bad", `La captura dice ${(p.montosLeidos || [p.montoLeido]).map(S).join(" / ")} y debía pagar ${S(p.monto)}.`]);
      if (p.fechaOk === false) al.push(["bad", "La fecha de la captura no es de hoy ni de ayer."]); if (p.operacion && ops[p.operacion] > 1) al.push(["bad", "Número de operación repetido en otro pago."]);
      return `<article class="card pw"><button class="pw-img" data-img="${esc(p.id)}">${p.captura ? `<img src="${esc(p.captura)}" alt="Captura">` : "Sin captura"}</button><div>
        <div class="pw-h"><span class="st ${p._t === "reserva" ? "pri" : "mute"}">${p._t === "reserva" ? "Reserva" : "Tienda"}</span><b>${S(p.monto)}</b><span class="st mute">${esc(p.metodo)}${p.banco ? " " + esc(p.banco) : ""}</span>${p.montoLeido != null ? `<span class="st ${p.coincide ? "ok" : "bad"}">Leído ${S(p.montoLeido)}</span>` : ""}</div>
        <p><b>${esc(p.nombre || "")}</b> · ${esc(p.celular || "")} · ${esc(sedeDe(p.sede).nombre || "")}</p><p class="muted">${esc(p.detalle || "")}${p.total && p.total !== p.monto ? ` · total ${S(p.total)}` : ""}</p>
        <p class="muted">Operación: <b>${esc(p.operacion || "—")}</b> · ${hace(p.creado)}${p.reserva ? ` · <span class="mono">${esc(p.reserva)}</span>` : ""}</p>
        ${al.map(([c, t]) => `<div class="alert ${c} sm">${ico("alert")} ${t}</div>`).join("")}
        <div class="acts-g"><button class="btn btn-pri btn-sm" data-ok="${esc(p.id)}">${ico("check")} Validar</button><button class="btn btn-light btn-sm" data-no="${esc(p.id)}">${ico("x")} Rechazar</button></div></div></article>`; }).join("") || vacio("No hay pagos por validar. 🎉")}</div>`;
  $("#view").onclick = async e => {
    const im = e.target.closest("[data-img]"), ok = e.target.closest("[data-ok]"), no = e.target.closest("[data-no]"), pid = im ? im.dataset.img : ok ? ok.dataset.ok : no ? no.dataset.no : null, p = l.find(x => x.id === pid);
    if (im && p) return modal("Captura", `<img class="zoom" src="${esc(p.captura)}" alt="Captura">`, null);
    if (ok && p) return modal("Validar pago", `<p>Confirma que llegaron <b>${S(p.monto)}</b> por ${esc(p.metodo)}${p.banco ? " " + esc(p.banco) : ""}${p.operacion ? ` (op. ${esc(p.operacion)})` : ""}.</p><div class="g2">${fld("monto", "Monto recibido (S/)", p.coincide === false && p.montoLeido ? p.montoLeido : p.monto, { type: "number", req: true, extra: 'min="0.1" step="0.1"' })}${fld("enviar", "Avisar por WhatsApp", true, { type: "checkbox" })}</div>`, async d => {
      const m = r2(d.monto), met = p.metodo === "Transferencia" ? "Transferencia" : p.metodo;
      if (p._t === "reserva") { const r = await DB.get("reservas", p.reserva || p.id); if (!r) { toast("La reserva ya no existe", true); await DB.set("pagos_web", p.id, { estado: "revisado" }); return refrescar(); }
        await DB.batch([{ op: "set", col: "reservas", id: r.id, data: { pagado: r2((+r.pagado || 0) + m), estado: r.estado === "por-validar" ? "confirmada" : r.estado } }, { op: "set", col: "pagos_web", id: p.id, data: { estado: "validado", montoValidado: m, validadoPor: YO().nombre, validado: new Date().toISOString(), captura: "" } },
          movimiento({ sede: r.sede, concepto: `Pago web reserva ${r.codigo || r.id} · Hab. ${r.habNum} · ${r.nombre}`, monto: m, metodo: met, reserva: r.codigo || r.id })]);
        if (d.enviar) abrirWA(r.celular, `Hola ${String(r.nombre).split(" ")[0]} 👋 ¡Tu reserva en *${sedeDe(r.sede).nombre}* está *confirmada*!\n\n🧾 Código: *${r.codigo || r.id}*\n🛏️ Habitación ${r.habNum}\n📅 ${fmtF(r.llegada)} → ${fmtF(r.salida)}\n💵 Recibimos ${S(m)}${r.total - (+r.pagado || 0) - m > 0 ? ` · saldo al llegar ${S(r.total - (+r.pagado || 0) - m)}` : " · estadía pagada"}\n\nTu comprobante: ${linkReserva(r.codigo || r.id)}\nCheck-in desde las ${CAT.aj.checkin}. ¡Te esperamos!`);
      } else { await DB.batch([{ op: "set", col: "pedidos", id: p.id, data: { estado: "nuevo", pagado: m, captura: "" } }, movimiento({ sede: p.sede, concepto: `Tienda web ${p.id} · ${p.nombre}`, monto: m, metodo: met })]);
        if (d.enviar) abrirWA(p.celular, `Hola ${String(p.nombre || "").split(" ")[0]} 👋 Recibimos tu pago de ${S(m)}. Tu pedido (${p.detalle}) ya se está preparando. ¡Gracias!`); }
      toast("Pago validado y registrado en caja"); refrescar(); vigilar(); }, "Validar");
    if (no && p) return modal("Rechazar pago", `${fld("motivo", "Motivo", "No llegó el pago", { full: true, opts: ["No llegó el pago", "El monto no coincide", "La captura no se lee", "La captura es de otro pago"] })}${fld("det", "Detalle (opcional)", "", { full: true })}${p._t === "reserva" ? `<p class="muted">Se cancela la reserva y se libera la habitación.</p>` : ""}${fld("enviar", "Avisar por WhatsApp", true, { type: "checkbox" })}`, async d => {
      const mot = d.motivo + (d.det ? ": " + d.det : "");
      if (p._t === "reserva") { const id = p.reserva || p.id, ocs = await DB.list("ocupacion", ["reserva", "==", id]);
        await DB.batch([{ op: "set", col: "reservas", id, data: { estado: "rechazada", motivo: mot } }, { op: "set", col: "pagos_web", id: p.id, data: { estado: "rechazado", motivo: mot, validadoPor: YO().nombre } }, ...ocs.map(o => ({ op: "del", col: "ocupacion", id: o.id }))]); }
      else await DB.set("pedidos", p.id, { estado: "anulado", motivo: mot });
      if (d.enviar) abrirWA(p.celular, `Hola ${String(p.nombre || "").split(" ")[0]}, revisamos tu pago de ${S(p.monto)} por ${p.metodo} pero no pudimos validarlo: ${mot}.\nEscríbenos por aquí para ayudarte a completarlo. ¡Gracias!`);
      toast("Pago rechazado"); refrescar(); vigilar(); }, "Rechazar");
  };
};

/* ================= PEDIDOS ================= */
let PED_T = "activos";
const SERV_ES = { limpieza: "Limpieza", toallas: "Toallas extra", almohada: "Almohada o manta", falla: "Falla reportada", lateCheckout: "Salida tarde", despertador: "Despertador", taxi: "Taxi" };
const txtPed = p => p.tipo === "servicio" && SERV_ES[p.servicio] ? [SERV_ES[p.servicio], ...String(p.detalle || "").split(" · ").slice(1)].join(" · ") + (p.lang === "en" ? " 🇬🇧" : "") : (p.detalle || p.servicio || "");
VIEWS.pedidos = async () => {
  const todos = (await DB.list("pedidos")).filter(p => enSede(p.sede) && p.tipo !== "encuesta" && p.estado !== "por-validar" && (!esLimp() || p.tipo === "servicio")).sort((a, b) => String(b.creado).localeCompare(String(a.creado)));
  const act = todos.filter(p => ["nuevo", "preparando"].includes(p.estado)), l = PED_T === "activos" ? act : todos.filter(p => !["nuevo", "preparando"].includes(p.estado)).slice(0, 60);
  const ICP = { tienda: "bag", servicio: "broom", tour: "compass" }, EST = { nuevo: ["Nuevo", "warn"], preparando: ["En camino", "pri"], entregado: ["Entregado", "ok"], anulado: ["Anulado", "bad"] };
  $("#view").innerHTML = topBar("Pedidos", "Lo que piden los huéspedes desde el QR de su habitación y la tienda web. Suena cuando llega uno nuevo.", `<div class="seg"><button class="${PED_T === "activos" ? "on" : ""}" data-pt="activos">Activos (${act.length})</button><button class="${PED_T === "hist" ? "on" : ""}" data-pt="hist">Historial</button></div>`) +
    `<div class="peds">${l.map(p => `<article class="card ped ${esc(p.estado)}"><div class="ped-i">${ico(ICP[p.tipo] || "bell")}</div><div class="ped-b">
      <div class="ped-h"><b>${p.origen === "web" ? "Tienda web" : `Hab. ${esc(p.num)}`}</b><span class="muted">${esc(sedeDe(p.sede).nombre || "")} · ${hace(p.creado)}</span><span class="st ${EST[p.estado]?.[1] || "mute"}">${EST[p.estado]?.[0] || esc(p.estado)}</span></div>
      <p>${p.items ? p.items.map(i => `${i.cant}× ${esc(i.n)}`).join(" · ") : esc(txtPed(p))}</p>${p.items && p.detalle ? `<p class="muted">${esc(p.detalle)}</p>` : ""}
      ${p.total ? `<p><b>${S(p.total)}</b> · ${p.pago === "habitacion" ? "Cargo a la habitación" : p.pago === "al-recibir" ? "Paga al recibir" : p.pago === "web" ? "Pagado en la web" : ""}${p.entrega === "habitacion" ? ` · llevar a la hab. ${esc(p.num)}` : p.origen === "web" ? " · recojo en recepción" : ""}${p.nombre ? ` · ${esc(p.nombre)}` : ""}</p>` : ""}
      ${p.foto ? `<img class="ped-f" src="${esc(p.foto)}" alt="Foto enviada" data-zoom>` : ""}
      ${["nuevo", "preparando"].includes(p.estado) ? `<div class="acts-g">${p.estado === "nuevo" ? `<button class="btn btn-light btn-sm" data-pe="preparando|${esc(p.id)}">En camino</button>` : ""}<button class="btn btn-pri btn-sm" data-pe="entregado|${esc(p.id)}">${ico("check")} ${p.tipo === "servicio" ? "Hecho" : "Entregado"}</button><button class="btn btn-light btn-sm" data-pe="anulado|${esc(p.id)}">Anular</button></div>` : ""}</div></article>`).join("") || vacio(PED_T === "activos" ? "No hay pedidos pendientes." : "Sin historial.")}</div>`;
  $("#view").onclick = async e => {
    const t = e.target.closest("[data-pt]"); if (t) { PED_T = t.dataset.pt; return VIEWS.pedidos(); }
    const z = e.target.closest("[data-zoom]"); if (z) return modal("Foto", `<img class="zoom" src="${esc(z.src)}" alt="">`, null);
    const b = e.target.closest("[data-pe]"); if (!b) return; const [est, id] = b.dataset.pe.split("|"), p = todos.find(x => x.id === id);
    const fin = async extra => { const ops = [{ op: "set", col: "pedidos", id, data: { estado: est, atendidoPor: YO().nombre, [est]: new Date().toISOString() } }, ...(extra || [])];
      if (est === "entregado" && p.tipo === "tienda") for (const i of p.items || []) { const pr = CAT.prods.find(x => x.id === i.id); if (pr && pr.stock != null) { pr.stock = Math.max(0, (+pr.stock || 0) - i.cant); ops.push({ op: "set", col: "productos", id: pr.id, data: { stock: pr.stock } }); } }
      await DB.batch(ops); toast("Pedido actualizado"); VIEWS.pedidos(); vigilar(); };
    if (est === "entregado" && p.pago === "al-recibir" && p.total) return modal(`Cobrar pedido · Hab. ${p.num}`, `<p>Total <b>${S(p.total)}</b></p>${fld("metodo", "¿Cómo pagó?", "Efectivo", { opts: METODOS })}`, async d => fin([movimiento({ sede: p.sede, concepto: `Pedido hab. ${p.num} · ${(p.items || []).map(i => i.cant + "× " + i.n).join(", ")}`, monto: p.total, metodo: d.metodo })]), "Entregado y cobrado");
    if (est === "anulado" && !confirm("¿Anular este pedido?")) return;
    fin();
  };
};

/* ================= LIMPIEZA ================= */
VIEWS.limpieza = async () => {
  const rs = await reservasDesde(addD(HOY(), -1)), habs = CAT.habs.filter(h => enSede(h.sede) && h.activa !== false).map(h => ({ h, e: estadoHab(h, rs) }));
  const servs = (await DB.list("pedidos", ["estado", "in", ["nuevo", "preparando"]])).filter(p => enSede(p.sede) && p.tipo === "servicio");
  const g = k => habs.filter(x => x.e.k === k);
  const col = (t, l, acc) => `<section class="card"><div class="card-h"><h2>${t} (${l.length})</h2></div><div class="rooms sm">${l.map(({ h, e }) => `<div class="room ${e.k}"><b>${esc(h.num)}</b><small>${esc(SEDE === "todas" ? sedeDe(h.sede).nombre : h.tipo)}</small>${acc(h, e)}</div>`).join("") || `<p class="muted">Nada aquí.</p>`}</div></section>`;
  $("#view").innerHTML = topBar("Limpieza", "Marca las habitaciones cuando estén listas. Así recepción sabe cuáles puede entregar.") +
    (servs.length ? `<div class="alert warn">${ico("bell")} <span>${servs.length} pedido(s) de servicio: ${servs.map(p => `Hab. ${esc(p.num)} · ${esc(txtPed(p))}`).join(" · ")}</span><button class="btn btn-sm btn-light" data-go="pedidos">Ver</button></div>` : "") +
    col("🧹 Por limpiar", g("limp"), h => `<button class="btn btn-pri btn-sm" data-l="libre|${esc(h.id)}">${ico("check")} Lista</button>`) +
    col("🚪 Salen hoy (limpiar después)", g("sale"), () => "") +
    col("🔧 Mantenimiento", g("mant"), h => `<button class="btn btn-light btn-sm" data-l="libre|${esc(h.id)}">Habilitar</button>`) +
    col("✅ Libres y listas", g("libre").concat(g("llega")), h => `<button class="btn btn-light btn-sm" data-l="mantenimiento|${esc(h.id)}">${ico("tool")}</button>`);
  $("#view").onclick = async e => { const b = e.target.closest("[data-l]"); if (!b) return; const [est, id] = b.dataset.l.split("|"); await DB.set("habitaciones", id, { estado: est, limpiadoPor: est === "libre" ? YO().nombre : "", limpiado: new Date().toISOString() }); habDe(id).estado = est; toast(est === "libre" ? "Habitación lista ✓" : "En mantenimiento"); VIEWS.limpieza(); };
};

/* ================= CAJA ================= */
let CAJA_F = null;
VIEWS.caja = async () => {
  CAJA_F = CAJA_F || HOY(); const l = (await DB.list("movimientos", ["fecha", "==", CAJA_F])).filter(m => enSede(m.sede)).sort((a, b) => String(a.hora).localeCompare(String(b.hora)));
  const tot = l.reduce((a, m) => a + m.monto, 0), por = {}; l.forEach(m => por[m.metodo] = (por[m.metodo] || 0) + m.monto);
  $("#view").innerHTML = topBar("Caja", "Todo lo cobrado: reservas, check-in/out, tienda y pedidos.", `<input type="date" id="cf" value="${CAJA_F}" class="q"><button class="btn btn-light btn-sm" id="mov">${ico("plus")} Ingreso / egreso</button><button class="btn btn-light btn-sm" id="csv">${ico("download")} Excel (CSV)</button>`) + `
    <div class="kpis"><div class="kpi"><span>Total del día</span><b>${S(tot)}</b><small>${l.length} movimiento(s)</small></div>${METODOS.map(k => `<div class="kpi sm"><span>${k}</span><b>${S(por[k] || 0)}</b></div>`).join("")}</div>
    <section class="card"><div class="tbl-w"><table class="tbl"><thead><tr><th>Hora</th><th>Concepto</th><th>Sede</th><th>Método</th><th>Usuario</th><th class="r">Monto</th></tr></thead><tbody>
      ${l.map(m => `<tr><td>${fmtH(m.hora)}</td><td>${esc(m.concepto)}</td><td>${esc(sedeDe(m.sede).nombre || "")}</td><td>${esc(m.metodo)}</td><td>${esc(m.usuario || "")}</td><td class="r ${m.monto < 0 ? "neg" : ""}">${S(m.monto)}</td></tr>`).join("") || `<tr><td colspan="6" class="muted">Sin movimientos este día.</td></tr>`}</tbody></table></div></section>`;
  $("#cf").addEventListener("change", e => { CAJA_F = e.target.value; VIEWS.caja(); });
  $("#csv").addEventListener("click", () => { const rows = [["Fecha", "Hora", "Sede", "Concepto", "Método", "Usuario", "Monto"], ...l.map(m => [m.fecha, fmtH(m.hora), sedeDe(m.sede).nombre || "", m.concepto, m.metodo, m.usuario || "", m.monto])];
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(";")).join("\n")], { type: "text/csv" })); a.download = `caja-${CAJA_F}.csv`; a.click(); });
  $("#mov").addEventListener("click", () => { const sedes = CAT.sedes.filter(s => misSedes().includes(s.id));
    modal("Ingreso o egreso", `<div class="g2">${fld("tipo", "Tipo", "egreso", { opts: [["ingreso", "Ingreso"], ["egreso", "Egreso (gasto)"]] })}${fld("monto", "Monto (S/)", "", { type: "number", req: true, extra: 'min="0.1" step="0.1"' })}
      ${fld("concepto", "Concepto", "", { req: true, full: true, ph: "Ej. compra de detergente" })}${fld("metodo", "Método", "Efectivo", { opts: METODOS })}${fld("sede", "Sede", SEDE !== "todas" ? SEDE : sedes[0]?.id, { opts: sedes.map(s => [s.id, s.nombre]) })}</div>`, async d => {
      await DB.batch([movimiento({ sede: d.sede, concepto: d.concepto, monto: d.tipo === "egreso" ? -d.monto : d.monto, metodo: d.metodo, fecha: CAJA_F })]); toast("Registrado"); VIEWS.caja(); }); });
};

/* ================= HUÉSPEDES ================= */
VIEWS.huespedes = async () => {
  const q = (CUR_Q || "").toLowerCase(), l = (await DB.list("clientes")).filter(c => !q || [c.nombre, c.docNum, c.celular, c.nacionalidad].join(" ").toLowerCase().includes(q)).filter(c => esAdm() || (c.sedes || []).some(enSede)).sort((a, b) => String(b.ultima).localeCompare(String(a.ultima)));
  $("#view").innerHTML = topBar("Huéspedes", "Clientes registrados en recepción o en el check-in. Búscalos por DNI para no volver a escribir sus datos.", `<input class="q" id="hq" placeholder="Buscar nombre, DNI o celular" value="${esc(CUR_Q)}">`) +
    `<section class="card"><div class="tbl-w"><table class="tbl"><thead><tr><th>Huésped</th><th>Documento</th><th>Nacionalidad</th><th>Celular</th><th>Visitas</th><th>Última</th><th></th></tr></thead><tbody>
    ${l.slice(0, 200).map(c => `<tr><td><b>${esc(c.nombre)}</b>${(c.visitas || 1) > 1 ? ` <span class="st ok">Frecuente</span>` : ""}</td><td>${esc(c.docTipo)} ${esc(c.docNum)}</td><td>${esc(c.nacionalidad || "")}</td><td>${esc(c.celular || "")}</td><td>${c.visitas || 1}</td><td>${fmtF(c.ultima)}<small>${(c.sedes || []).map(s => esc(sedeDe(s).nombre || s)).join(", ")}</small></td>
      <td>${c.celular ? `<button class="btn btn-wa btn-sm" data-wa="${esc(c.celular)}|${esc(c.nombre)}">${ico("wa")}</button>` : ""}</td></tr>`).join("") || `<tr><td colspan="7" class="muted">Aún no hay huéspedes registrados.</td></tr>`}</tbody></table></div></section>`;
  $("#hq").addEventListener("change", e => { CUR_Q = e.target.value; VIEWS.huespedes(); });
  $("#view").onclick = e => { const b = e.target.closest("[data-wa]"); if (b) { const [cel, n] = b.dataset.wa.split("|"); abrirWA(cel, `Hola ${n.split(" ")[0]} 👋 Te saluda *${CAT.aj.nombre}*. `); } };
};

/* ================= TIENDA (productos) ================= */
VIEWS.tienda = async () => {
  await cargarCatalogo(); const l = CAT.prods.slice().sort((a, b) => String(a.cat).localeCompare(b.cat) || a.n.localeCompare(b.n)), bajos = l.filter(p => p.activo !== false && p.stock != null && +p.stock <= 5);
  $("#view").innerHTML = topBar("Tienda", "Productos que se ven en la web y en el QR de cada habitación.", esAdm() || YO().rol === "Recepción" ? `<button class="btn btn-pri btn-sm" id="np">${ico("plus")} Producto</button>` : "") +
    (bajos.length ? `<div class="alert warn">${ico("alert")} <span>Stock bajo: ${bajos.map(p => `${esc(p.n)} (${p.stock})`).join(", ")}</span></div>` : "") +
    `<section class="card"><div class="tbl-w"><table class="tbl"><thead><tr><th></th><th>Producto</th><th>Categoría</th><th>Dónde</th><th class="r">Precio</th><th>Stock</th><th></th></tr></thead><tbody>
    ${l.map(p => `<tr class="${p.activo === false ? "off" : ""}"><td class="emo">${esc(p.e || "🛍️")}</td><td><b>${esc(p.n)}</b><small>${esc(p.n_en || "")}</small></td><td>${esc(p.cat)}</td><td>${p.sede && p.sede !== "todas" ? esc(sedeDe(p.sede).nombre) : "Todas"}${p.tipos ? `<small>Solo ${p.tipos.join(", ")}</small>` : ""}</td><td class="r">${S(p.precio)}</td>
      <td><div class="stk"><button class="btn btn-light btn-xs" data-st="-1|${esc(p.id)}" aria-label="Menos">${ico("minus")}</button><b class="${+p.stock <= 5 ? "neg" : ""}">${p.stock ?? "∞"}</b><button class="btn btn-light btn-xs" data-st="1|${esc(p.id)}" aria-label="Más">${ico("plus")}</button></div></td>
      <td><button class="btn btn-light btn-sm" data-ep="${esc(p.id)}">${ico("edit")}</button></td></tr>`).join("")}</tbody></table></div></section>`;
  const form = p => modal(p ? "Editar producto" : "Nuevo producto", `<div class="g2">${fld("e", "Emoji", p?.e || "🛍️", { extra: 'maxlength="4"' })}${fld("cat", "Categoría", p?.cat || "bebidas", { opts: ["bebidas", "snacks", "desayuno", "aseo", "souvenirs", "playa", "campo"] })}
    ${fld("n", "Nombre", p?.n || "", { req: true })}${fld("n_en", "Nombre en inglés", p?.n_en || "")}${fld("precio", "Precio (S/)", p?.precio ?? "", { type: "number", req: true, extra: 'min="0" step="0.1"' })}${fld("stock", "Stock", p?.stock ?? 20, { type: "number", extra: 'min="0"' })}
    ${fld("sede", "Disponible en", p?.sede || "todas", { opts: [["todas", "Todas las sedes"], ...CAT.sedes.map(s => [s.id, s.nombre])] })}${fld("tipos", "Solo en estilo (opcional)", (p?.tipos || []).join(","), { opts: [["", "Todos"], ["turistico", "Turístico"], ["playa", "Playa"], ["campo", "Campo"], ["ciudad", "Ciudad"], ["campo,playa", "Campo y playa"]] })}
    ${fld("activo", "Visible para los clientes", p ? p.activo !== false : true, { type: "checkbox", full: true })}</div>${p ? `<button type="button" class="btn btn-light danger btn-sm" id="delP">${ico("trash")} Eliminar</button>` : ""}`, async d => {
    const id = p?.id || "p-" + Date.now().toString(36); await DB.set("productos", id, { ...d, tipos: d.tipos ? d.tipos.split(",") : null, precio: +d.precio, stock: d.stock === "" ? null : +d.stock }, false); toast("Producto guardado"); VIEWS.tienda(); },
    "Guardar", { alAbrir: () => $("#delP")?.addEventListener("click", async () => { if (!confirm("¿Eliminar este producto?")) return; await DB.del("productos", p.id); cerrarModal(); VIEWS.tienda(); }) });
  $("#np")?.addEventListener("click", () => form());
  $("#view").onclick = async e => { const ep = e.target.closest("[data-ep]"), st = e.target.closest("[data-st]");
    if (ep) return form(CAT.prods.find(p => p.id === ep.dataset.ep));
    if (st) { const [d, id] = st.dataset.st.split("|"), p = CAT.prods.find(x => x.id === id); p.stock = Math.max(0, (+p.stock || 0) + +d); await DB.set("productos", id, { stock: p.stock }); st.parentElement.querySelector("b").textContent = p.stock; } };
};

/* ================= HABITACIONES y QR ================= */
const AMEN = ["wifi", "tv", "escritorio", "agua", "frigobar", "balcon", "tina", "calefaccion", "mate", "aire", "terraza", "hamaca", "ventilador", "chimenea", "cocina", "parrilla"];
VIEWS.habitaciones = async () => {
  await cargarCatalogo(); const l = CAT.habs.filter(h => enSede(h.sede));
  $("#view").innerHTML = topBar("Habitaciones y QR", "Cada habitación tiene su propio QR. Imprímelos y pégalos en el cuarto.", `<button class="btn btn-light btn-sm" id="qrAll">${ico("print")} Imprimir QR (${l.length})</button><button class="btn btn-pri btn-sm" id="nh">${ico("plus")} Habitación</button>`) +
    `<div class="habs-a">${l.map(h => `<article class="card hab-a ${h.activa === false ? "off" : ""}"><div class="hab-f" style="background-image:url('${esc(IMG((h.fotos || [])[0], 500))}')"></div><div class="hab-ab">
      <div class="hab-h"><b>N.° ${esc(h.num)}</b><span class="muted">${esc(sedeDe(h.sede).nombre || "")}</span></div><p>${esc(h.tipo)} · hasta ${h.cap} · ${S(h.precio)}/noche</p>
      <div class="acts-g"><button class="btn btn-light btn-sm" data-eh="${esc(h.id)}">${ico("edit")} Editar</button>${h.qr ? `<button class="btn btn-light btn-sm" data-vq="${esc(h.id)}">${ico("qr")} Ver QR</button>` : `<button class="btn btn-pri btn-sm" data-gq="${esc(h.id)}">${ico("qr")} Crear QR</button>`}</div></div></article>`).join("") || vacio("Aún no hay habitaciones.")}</div>`;
  const form = h => { const sedes = CAT.sedes.filter(s => misSedes().includes(s.id));
    modal(h ? `Habitación ${h.num}` : "Nueva habitación", `<div class="g2">${fld("sede", "Sede", h?.sede || (SEDE !== "todas" ? SEDE : sedes[0]?.id), { opts: sedes.map(s => [s.id, s.nombre]) })}${fld("num", "Número", h?.num || "", { req: true })}
      ${fld("tipo", "Tipo / nombre", h?.tipo || "", { req: true, ph: "Doble estándar" })}${fld("tipo_en", "Nombre en inglés", h?.tipo_en || "", { ph: "Standard double" })}
      ${fld("cap", "Capacidad (personas)", h?.cap || 2, { type: "number", extra: 'min="1" max="12"' })}${fld("precio", "Precio por noche (S/)", h?.precio ?? "", { type: "number", req: true, extra: 'min="1" step="1"' })}
      ${fld("camas", "Camas", h?.camas || "", { ph: "1 cama queen" })}${fld("camas_en", "Camas en inglés", h?.camas_en || "", { ph: "1 queen bed" })}
      <div class="full"><span class="lbl">Comodidades</span><div class="amen-g">${AMEN.map(a => `<label class="chk sm"><input type="checkbox" name="am_${a}" ${(h?.amen || []).includes(a) ? "checked" : ""}><span>${a}</span></label>`).join("")}</div></div>
      <div class="full"><span class="lbl">Foto</span><div class="foto-up"><span id="fPrev" style="background-image:url('${esc(IMG((h?.fotos || [])[0], 400))}')"></span><label class="btn btn-light btn-sm">${ico("camera")} Subir foto<input type="file" accept="image/*" id="fFile" hidden></label><input type="hidden" name="foto" value="${esc((h?.fotos || [])[0] || "")}"></div></div>
      ${fld("activa", "Visible en la web", h ? h.activa !== false : true, { type: "checkbox", full: true })}</div>${h ? `<button type="button" class="btn btn-light danger btn-sm" id="delH">${ico("trash")} Eliminar habitación</button>` : ""}`, async d => {
      const id = h?.id || (d.sede.slice(0, 3) + "-" + String(d.num).toLowerCase().replace(/\W/g, "")); if (!h && CAT.habs.find(x => x.id === id)) { toast("Ya existe esa habitación", true); return false; }
      const data = { sede: d.sede, num: String(d.num), tipo: d.tipo, tipo_en: d.tipo_en, cap: +d.cap || 1, precio: +d.precio, camas: d.camas, camas_en: d.camas_en, amen: AMEN.filter(a => d["am_" + a]), fotos: d.foto ? [d.foto] : [], activa: d.activa, estado: h?.estado || "libre" };
      await DB.set("habitaciones", id, data); const nh = { ...data, id, qr: h?.qr }; if (!h) await asegurarQR(nh); else if (h.qr && (h.num !== data.num || h.sede !== data.sede)) await DB.set("qr", h.qr, { num: data.num, sede: data.sede, hab: id });
      toast("Habitación guardada"); VIEWS.habitaciones(); }, "Guardar", { wide: true, alAbrir: F => {
      $("#fFile").addEventListener("change", async e => { const f = e.target.files[0]; if (!f) return; const u = await redimensionar(f, 1000, .72); $("[name=foto]", F).value = u; $("#fPrev").style.backgroundImage = `url('${u}')`; });
      $("#delH")?.addEventListener("click", async () => { if (!confirm(`¿Eliminar la habitación ${h.num}? Sus reservas pasadas se conservan.`)) return; await DB.batch([{ op: "del", col: "habitaciones", id: h.id }, ...(h.qr ? [{ op: "del", col: "qr", id: h.qr }, { op: "del", col: "pines", id: h.qr }] : [])]); cerrarModal(); VIEWS.habitaciones(); }); } }); };
  $("#nh").addEventListener("click", () => form()); $("#qrAll").addEventListener("click", async () => { for (const h of l) await asegurarQR(h); pdfQRs(l); });
  $("#view").onclick = async e => { const eh = e.target.closest("[data-eh]"), vq = e.target.closest("[data-vq]"), gq = e.target.closest("[data-gq]");
    if (eh) return form(habDe(eh.dataset.eh)); if (gq) { await asegurarQR(habDe(gq.dataset.gq)); toast("QR creado"); return VIEWS.habitaciones(); }
    if (vq) { const h = habDe(vq.dataset.vq), c = await qrCanvas(linkHab(h.qr), 320);
      modal(`QR · Habitación ${h.num}`, `<div class="qr-v"><img src="${c.toDataURL()}" alt="QR habitación ${esc(h.num)}"><p class="mono sm">${esc(linkHab(h.qr))}</p></div>
        <div class="acts-g"><a class="btn btn-light" target="_blank" rel="noopener" href="${linkHab(h.qr)}">Abrir página</a><button type="button" class="btn btn-pri" id="q1">${ico("print")} Imprimir tarjeta</button><button type="button" class="btn btn-light danger" id="qNew">Cambiar QR</button></div>
        <p class="muted sm">«Cambiar QR» invalida el código anterior (útil si alguien lo copió). Tendrás que imprimir la tarjeta otra vez.</p>`, null);
      $("#q1").onclick = () => pdfQRs([h]);
      $("#qNew").onclick = async () => { if (!confirm("¿Cambiar el QR? El anterior dejará de funcionar.")) return; const old = h.qr, pin = await DB.get("pines", old); h.qr = null;
        const k = await asegurarQR(h); const ops = [{ op: "del", col: "qr", id: old }]; if (pin) ops.push({ op: "del", col: "pines", id: old }, { op: "set", col: "pines", id: k, data: { pin: pin.pin, reserva: pin.reserva, nombre: pin.nombre }, merge: false }); await DB.batch(ops); cerrarModal(); toast("QR nuevo creado"); VIEWS.habitaciones(); }; }
  };
};

/* ================= SEDES ================= */
VIEWS.sedes = async () => {
  await cargarCatalogo();
  $("#view").innerHTML = topBar("Sedes", "Tus hospedajes. Cada uno con su estilo, WiFi, reglas, tours y lugares cercanos.", `<button class="btn btn-pri btn-sm" id="ns">${ico("plus")} Sede</button>`) +
    `<div class="habs-a">${CAT.sedes.map(s => `<article class="card hab-a"><div class="hab-f" style="background-image:url('${esc(IMG(s.foto, 600))}')"></div><div class="hab-ab"><div class="hab-h"><b>${esc(s.nombre)}</b><span class="st pri">${esc({ ciudad: "Ciudad", turistico: "Turístico", playa: "Playa", campo: "Campo" }[s.tipo] || s.tipo)}</span></div>
      <p class="muted">${esc(s.direccion)}, ${esc(s.ciudad)}</p><p class="sm">${CAT.habs.filter(h => h.sede === s.id).length} habitaciones · WiFi ${esc(s.wifiNombre || "—")}</p><button class="btn btn-light btn-sm" data-es="${esc(s.id)}">${ico("edit")} Editar</button></div></article>`).join("")}</div>`;
  const lineas = a => (a || []).join("\n"), cerca = a => (a || []).map(c => `${c.n} | ${c.d || ""}`).join("\n"), tours = a => (a || []).map(x => `${x.n} | ${x.precio} | ${x.d || ""}`).join("\n");
  const form = s => modal(s ? s.nombre : "Nueva sede", `<div class="g2">${fld("nombre", "Nombre", s?.nombre || "Killa ", { req: true })}${fld("tipo", "Estilo de la web", s?.tipo || "turistico", { opts: [["ciudad", "Ciudad"], ["turistico", "Turístico"], ["playa", "Playa"], ["campo", "Campo"]] })}
    ${fld("ciudad", "Ciudad", s?.ciudad || "", { req: true })}${fld("direccion", "Dirección", s?.direccion || "", { req: true })}${fld("telefono", "Teléfono", s?.telefono || "")}${fld("whatsapp", "WhatsApp de recepción", s?.whatsapp || "", { ph: "51987654321" })}
    ${fld("ruc", "RUC", s?.ruc || "")}${fld("razon", "Razón social", s?.razon || "")}${fld("wifiNombre", "Red WiFi", s?.wifiNombre || "")}${fld("wifiClave", "Clave WiFi", s?.wifiClave || "")}
    ${fld("desc", "Descripción", s?.desc || "", { type: "textarea", full: true, rows: 2 })}${fld("desc_en", "Descripción en inglés", s?.desc_en || "", { type: "textarea", full: true, rows: 2 })}
    ${fld("reglas", "Reglas e info útil (una por línea)", lineas(s?.reglas), { type: "textarea", full: true })}${fld("reglas_en", "Reglas en inglés (una por línea)", lineas(s?.reglas_en), { type: "textarea", full: true })}
    ${fld("cerca", "Lugares cercanos (nombre | distancia)", cerca(s?.cerca), { type: "textarea", full: true, ph: "Plaza de Armas | 5 min a pie" })}${fld("tours", "Tours (nombre | precio | detalle)", tours(s?.tours), { type: "textarea", full: true, ph: "Valle Sagrado | 120 | Día completo" })}
    ${fld("resena", "Enlace para reseñas de Google", s?.resena || "", { full: true, ph: "https://g.page/r/…" })}
    <div class="full"><span class="lbl">Foto principal</span><div class="foto-up"><span id="fPrev" style="background-image:url('${esc(IMG(s?.foto, 400))}')"></span><label class="btn btn-light btn-sm">${ico("camera")} Subir foto<input type="file" accept="image/*" id="fFile" hidden></label><input type="hidden" name="foto" value="${esc(s?.foto || "")}"></div></div></div>`, async d => {
    const id = s?.id || d.nombre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/^killa\s+/, "").replace(/\W+/g, "-").replace(/^-|-$/g, "") || "sede-" + Date.now().toString(36);
    const sp = t => t.split("\n").map(x => x.trim()).filter(Boolean), old = s ? (s.tours || []) : [];
    const data = { ...d, reglas: sp(d.reglas), reglas_en: sp(d.reglas_en), cerca: sp(d.cerca).map(x => { const [n, dd] = x.split("|").map(y => y.trim()); return { n, d: dd || "" }; }),
      tours: sp(d.tours).map((x, i) => { const [n, p, dd] = x.split("|").map(y => y.trim()); const o = old.find(t => t.n === n); return { id: o?.id || "t-" + id + "-" + i, n, n_en: o?.n_en || "", precio: +p || 0, d: dd || "" }; }), orden: s?.orden ?? CAT.sedes.length };
    const ops = [{ op: "set", col: "sedes", id, data }];
    if (s && (s.wifiNombre !== d.wifiNombre || s.wifiClave !== d.wifiClave)) CAT.habs.filter(h => h.sede === id && h.qr).forEach(h => ops.push({ op: "set", col: "qr", id: h.qr, data: { wifiNombre: d.wifiNombre, wifiClave: d.wifiClave } }));
    await DB.batch(ops); toast("Sede guardada"); VIEWS.sedes(); }, "Guardar", { wide: true, alAbrir: F => $("#fFile").addEventListener("change", async e => { const f = e.target.files[0]; if (!f) return; const u = await redimensionar(f, 1400, .7); $("[name=foto]", F).value = u; $("#fPrev").style.backgroundImage = `url('${u}')`; }) });
  $("#ns").addEventListener("click", () => form()); $("#view").onclick = e => { const b = e.target.closest("[data-es]"); if (b) form(sedeDe(b.dataset.es)); };
};

/* ================= REPORTES ================= */
VIEWS.reportes = async () => {
  const hoy = HOY(), d0 = addD(hoy, -29), sedes = CAT.sedes.filter(s => enSede(s.id));
  const [ocs, movs, rs, peds] = await Promise.all([DB.list("ocupacion", ["fecha", ">=", d0]), DB.list("movimientos", ["fecha", ">=", d0]), DB.list("reservas", ["salida", ">=", d0]), DB.list("pedidos")]);
  const filas = sedes.map(s => { const nh = CAT.habs.filter(h => h.sede === s.id && h.activa !== false).length, n = ocs.filter(o => o.sede === s.id && o.fecha <= hoy).length, ing = movs.filter(m => m.sede === s.id).reduce((a, m) => a + m.monto, 0), r = rs.filter(x => x.sede === s.id && !["cancelada", "rechazada"].includes(x.estado));
    return { s, occ: nh ? Math.round(n / (nh * 30) * 100) : 0, n, ing, web: r.filter(x => x.origen === "web").length, rec: r.filter(x => x.origen !== "web").length }; });
  const top = {}; peds.filter(p => enSede(p.sede) && p.estado === "entregado" && p.items).forEach(p => p.items.forEach(i => { top[i.n] = top[i.n] || { c: 0, m: 0 }; top[i.n].c += i.cant; top[i.n].m += i.cant * i.precio; }));
  const enc = peds.filter(p => p.tipo === "encuesta" && enSede(p.sede)).sort((a, b) => String(b.creado).localeCompare(String(a.creado))), prom = enc.length ? (enc.reduce((a, p) => a + (+p.estrellas || 0), 0) / enc.length).toFixed(1) : "—";
  const max = Math.max(1, ...filas.map(f => f.ing));
  $("#view").innerHTML = topBar("Reportes", "Últimos 30 días.") + `
    <div class="kpis"><div class="kpi"><span>Ingresos</span><b>${S(filas.reduce((a, f) => a + f.ing, 0))}</b></div><div class="kpi"><span>Noches vendidas</span><b>${filas.reduce((a, f) => a + f.n, 0)}</b></div>
      <div class="kpi"><span>Reservas web / recepción</span><b>${filas.reduce((a, f) => a + f.web, 0)} / ${filas.reduce((a, f) => a + f.rec, 0)}</b></div><div class="kpi"><span>Satisfacción</span><b>${prom} ★</b><small>${enc.length} opinión(es)</small></div></div>
    <section class="card"><div class="card-h"><h2>Por sede</h2></div><div class="bars">${filas.map(f => `<div class="bar-r"><span>${esc(f.s.nombre)}</span><div class="bar"><i style="width:${f.ing / max * 100}%"></i></div><b>${S(f.ing)}</b><small>Ocupación ${f.occ}% · ${f.n} noches</small></div>`).join("")}</div></section>
    <div class="two"><section class="card"><div class="card-h"><h2>Lo más vendido</h2></div><table class="tbl"><tbody>${Object.entries(top).sort((a, b) => b[1].m - a[1].m).slice(0, 10).map(([n, v]) => `<tr><td>${esc(n)}</td><td>${v.c} u.</td><td class="r">${S(v.m)}</td></tr>`).join("") || `<tr><td class="muted">Sin ventas entregadas aún.</td></tr>`}</tbody></table></section>
      <section class="card"><div class="card-h"><h2>Opiniones de huéspedes</h2></div><ul class="lst">${enc.slice(0, 12).map(p => `<li><div><b>${"★".repeat(+p.estrellas || 0)}${"☆".repeat(5 - (+p.estrellas || 0))}</b><small>Hab. ${esc(p.num)} · ${esc(sedeDe(p.sede).nombre || "")} · ${fmtF(p.creado)}</small>${p.detalle ? `<p>${esc(p.detalle)}</p>` : ""}</div></li>`).join("") || `<li class="muted">Aún no hay opiniones.</li>`}</ul></section></div>`;
};

/* ================= AJUSTES ================= */
VIEWS.ajustes = async () => {
  await cargarCatalogo(); const a = CAT.aj, sinDatos = !CAT.sedes.length;
  $("#view").innerHTML = topBar("Ajustes", "Datos generales, pagos y temporadas.") + `
    ${sinDatos || DEMO ? `<section class="card hi"><h2>${ico("download")} Cargar datos de ejemplo</h2><p>Crea las 4 sedes, sus habitaciones (con QR), los productos y los ajustes de ejemplo para empezar a editarlos. ${sinDatos ? "<b>Tu base de datos está vacía.</b>" : ""}</p><button class="btn btn-pri" id="seed">Cargar ejemplos</button></section>` : ""}
    <form class="card" id="ajF"><h2>General</h2><div class="g2">${fld("nombre", "Nombre de la marca", a.nombre)}${fld("whatsapp", "WhatsApp principal", a.whatsapp)}${fld("email", "Correo", a.email)}${fld("temaPrincipal", "Estilo de la portada (cuando hay varias sedes)", a.temaPrincipal, { opts: [["turistico", "Turístico"], ["ciudad", "Ciudad"], ["playa", "Playa"], ["campo", "Campo"]] })}
      ${fld("slogan", "Frase", a.slogan)}${fld("slogan_en", "Frase en inglés", a.slogan_en)}${fld("checkin", "Check-in desde", a.checkin, { type: "time" })}${fld("checkout", "Check-out hasta", a.checkout, { type: "time" })}
      ${fld("politicas", "Políticas (salen en el comprobante)", a.politicas, { type: "textarea", full: true })}${fld("politicas_en", "Políticas en inglés", a.politicas_en, { type: "textarea", full: true })}
      ${fld("temporadas", "Temporadas (nombre | desde MM-DD | hasta MM-DD | % extra)", (a.temporadas || []).map(t => `${t.n} | ${t.desde} | ${t.hasta} | ${t.pct}`).join("\n"), { type: "textarea", full: true, ph: "Verano | 01-01 | 03-15 | 25" })}</div>
      <h2>Pagos web</h2><div class="g2">${fld("adelantoTipo", "Adelanto", a.adelantoTipo, { opts: [["noche", "Primera noche"], ["porcentaje", "Porcentaje del total"], ["fijo", "Monto fijo"]] })}${fld("adelantoValor", "Valor (% o S/)", a.adelantoValor, { type: "number", extra: 'min="1"' })}
      ${["yape", "plin"].map(k => { const N = k[0].toUpperCase() + k.slice(1); return `${fld("pago" + N, `Aceptar ${N}`, a["pago" + N] !== false, { type: "checkbox" })}<div class="full qr-up"><span id="${k}Prev">${a[k + "QR"] ? `<img src="${esc(a[k + "QR"])}" alt="QR ${N}">` : ico("qr")}</span><label class="btn btn-light btn-sm">${ico("camera")} Subir QR de ${N}<input type="file" accept="image/*" data-qr="${k}" hidden></label><input type="hidden" name="${k}QR" value="${esc(a[k + "QR"] || "")}">
        ${fld(k + "Num", `Número ${N}`, a[k + "Num"] || "")}${fld(k + "Titular", "A nombre de", a[k + "Titular"] || "")}</div>`; }).join("")}
      ${fld("pagoTransf", "Aceptar transferencias", a.pagoTransf !== false, { type: "checkbox" })}${fld("pagoOCR", "Leer las capturas automáticamente", a.pagoOCR !== false, { type: "checkbox" })}
      ${fld("cuentas", "Cuentas bancarias (banco | número | CCI | titular)", (a.cuentas || []).map(c => `${c.banco} | ${c.num} | ${c.cci} | ${c.titular}`).join("\n"), { type: "textarea", full: true, ph: "BCP | 191-12345678-0-12 | 002-191-... | Killa Hospedaje SAC", help: "Bancos con su color: BCP, Interbank, BBVA, Scotiabank, BanBif, Pichincha." })}</div>
      <div class="f-end"><button class="btn btn-pri">${ico("check")} Guardar ajustes</button></div></form>`;
  const F = $("#ajF");
  $$("[data-qr]", F).forEach(i => i.addEventListener("change", async e => { const f = e.target.files[0], k = e.target.dataset.qr; if (!f) return; const u = await redimensionar(f, 600, .92, "image/png"); $(`[name=${k}QR]`, F).value = u; $(`#${k}Prev`).innerHTML = `<img src="${u}" alt="">`; }));
  F.addEventListener("submit", async e => { e.preventDefault(); const d = datosForm(F), sp = t => String(t || "").split("\n").map(x => x.trim()).filter(Boolean);
    const URL_B = { BCP: "https://www.viabcp.com", Interbank: "https://interbank.pe", BBVA: "https://www.bbva.pe", Scotiabank: "https://www.scotiabank.com.pe", BanBif: "https://www.banbif.com.pe", Pichincha: "https://www.pichincha.pe" };
    d.temporadas = sp(d.temporadas).map(x => { const [n, de, ha, p] = x.split("|").map(y => y.trim()); return { n, desde: de, hasta: ha, pct: +p || 0 }; }).filter(t => /^\d\d-\d\d$/.test(t.desde) && /^\d\d-\d\d$/.test(t.hasta));
    d.cuentas = sp(d.cuentas).map((x, i) => { const [banco, num, cci, titular] = x.split("|").map(y => (y || "").trim()); return { id: banco.toLowerCase().replace(/\W/g, "") + i, banco, tipo: "Ahorros", moneda: "Soles", num, cci, titular, url: URL_B[banco] || "", logo: "" }; });
    d.adelantoValor = +d.adelantoValor || 30;
    if (JSON.stringify(d).length > 900000) return toast("Las imágenes pesan demasiado", true);
    await DB.set("ajustes", "general", d); toast("Ajustes guardados · ya se ven en la web"); });
  $("#seed")?.addEventListener("click", async () => {
    if (!confirm(DEMO ? "En modo demo esto reinicia TODOS los datos de prueba. ¿Continuar?" : "Se crearán sedes, habitaciones, QR y productos de ejemplo. ¿Continuar?")) return;
    if (DEMO) { localStorage.removeItem("kh_db"); LDB.get(); toast("Datos demo reiniciados"); await cargarCatalogo(); return go("tablero"); }
    const D = window.KH_DATOS, ops = [{ op: "set", col: "ajustes", id: "general", data: D.ajustes }];
    D.sedes.forEach((s, i) => ops.push({ op: "set", col: "sedes", id: s.id, data: { ...s, orden: i, wifiNombre: s.nombre.replace(/\s+/g, "_"), wifiClave: "killa" + (2026 + i) } }));
    D.habitaciones.forEach(h => { const k = llaveQR(), s = D.sedes.find(x => x.id === h.sede); ops.push({ op: "set", col: "habitaciones", id: h.id, data: { ...h, estado: "libre", qr: k } }, { op: "set", col: "qr", id: k, data: { sede: h.sede, hab: h.id, num: h.num, wifiNombre: s.nombre.replace(/\s+/g, "_"), wifiClave: "killa" + (2026 + D.sedes.indexOf(s)) } }); });
    D.productos.forEach(p => ops.push({ op: "set", col: "productos", id: p.id, data: { ...p, activo: true } }));
    await DB.batch(ops); toast("Ejemplos cargados"); await cargarCatalogo(); go("sedes");
  });
};

arrancar();
