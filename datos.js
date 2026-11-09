/* =========================================================
   KILLA HOSPEDAJE — Datos de ejemplo
   Se usan en MODO DEMO y como contenido inicial. Cuando conectes
   Firebase, todo esto se edita desde el panel (Ajustes, Sedes,
   Habitaciones y Tienda) y la web lee lo que guardes allí.
   Los textos con _en son la versión en inglés (opcional).
   ========================================================= */
window.KH_DATOS = {
  ajustes: {
    nombre: "Killa Hospedaje",
    slogan: "Descansa bajo nuestra luna", slogan_en: "Rest under our moon",
    whatsapp: "51987654321", email: "reservas@killahospedaje.pe",
    temaPrincipal: "turistico",          // estilo de la portada cuando hay varias sedes
    checkin: "14:00", checkout: "12:00",
    // Pagos (el cliente elige adelanto o pago completo)
    pagoYape: true, yapeQR: "", yapeNum: "987 654 321", yapeTitular: "Killa Hospedaje SAC",
    pagoPlin: true, plinQR: "", plinNum: "987 654 321", plinTitular: "Killa Hospedaje SAC",
    pagoTransf: true, cuentas: [
      { id: "bcp", banco: "BCP", tipo: "Ahorros", moneda: "Soles", num: "191-23456789-0-11", cci: "002-191-123456789011-52", titular: "Killa Hospedaje SAC", url: "https://www.viabcp.com", logo: "" },
      { id: "interbank", banco: "Interbank", tipo: "Ahorros", moneda: "Soles", num: "200-3045678912", cci: "003-200-013045678912-48", titular: "Killa Hospedaje SAC", url: "https://interbank.pe", logo: "" },
      { id: "bbva", banco: "BBVA", tipo: "Ahorros", moneda: "Soles", num: "0011-0234-0201987654", cci: "011-234-000201987654-77", titular: "Killa Hospedaje SAC", url: "https://www.bbva.pe", logo: "" }],
    adelantoTipo: "noche",                // "noche" = primera noche · "porcentaje" · "fijo"
    adelantoValor: 30,                    // usado si es porcentaje (%) o fijo (S/)
    pagoOCR: true,
    temporadas: [ { n: "Fiestas de fin de año", desde: "12-20", hasta: "01-05", pct: 20 }, { n: "Fiestas Patrias", desde: "07-25", hasta: "07-31", pct: 15 } ],
    politicas: "Check-in desde las 14:00 y check-out hasta las 12:00. Presenta tu DNI o pasaporte al llegar. Cancelación gratuita hasta 48 horas antes; después se retiene el adelanto. No se permite fumar dentro de las habitaciones.",
    politicas_en: "Check-in from 2:00 pm and check-out until 12:00 pm. Show your ID or passport on arrival. Free cancellation up to 48 hours before; after that the deposit is kept. No smoking inside the rooms."
  },

  sedes: [
    { id: "miraflores", nombre: "Killa Miraflores", tipo: "ciudad", ciudad: "Lima", direccion: "Calle Berlín 245, Miraflores", telefono: "01 445 1200", whatsapp: "51987654321",
      ruc: "20612345671", razon: "Killa Hospedaje SAC", foto: "1566073771259-6a8506099945", resena: "https://www.google.com/maps",
      desc: "A dos cuadras del Parque Kennedy, ideal para viajes de trabajo y escapadas de fin de semana.", desc_en: "Two blocks from Kennedy Park, ideal for business trips and weekend getaways.",
      reglas: ["Silencio desde las 22:00", "Desayuno de 7:00 a 10:00 en el primer piso", "Estacionamiento con reserva previa"],
      reglas_en: ["Quiet hours from 10 pm", "Breakfast 7–10 am on the first floor", "Parking upon request"],
      cerca: [ { n: "Parque Kennedy", d: "2 min a pie" }, { n: "Malecón de Miraflores", d: "8 min a pie" }, { n: "Larcomar", d: "12 min a pie" }, { n: "Farmacia 24 h", d: "1 cuadra" }, { n: "Cajero BCP", d: "Esquina" } ],
      tours: [ { id: "t-centro", n: "Centro histórico de Lima", n_en: "Lima historic center", precio: 60, d: "4 h · con guía" }, { id: "t-aero", n: "Traslado al aeropuerto", n_en: "Airport transfer", precio: 70, d: "Auto privado" } ] },
    { id: "cusco", nombre: "Killa Cusco", tipo: "turistico", ciudad: "Cusco", direccion: "Cuesta San Blas 512, San Blas", telefono: "084 23 4567", whatsapp: "51987654322",
      ruc: "20612345671", razon: "Killa Hospedaje SAC", foto: "1526392060635-9d6019884377", resena: "https://www.google.com/maps",
      desc: "Casona restaurada en el barrio artesanal de San Blas, a 5 minutos de la Plaza de Armas.", desc_en: "Restored colonial house in the artisan district of San Blas, 5 minutes from the main square.",
      reglas: ["Mate de coca de cortesía todo el día", "Guarda equipaje gratis el día de salida", "Desayuno desde las 5:30 para tours tempranos"],
      reglas_en: ["Free coca tea all day", "Free luggage storage on departure day", "Breakfast from 5:30 am for early tours"],
      cerca: [ { n: "Plaza de Armas", d: "5 min a pie" }, { n: "Mercado de San Pedro", d: "15 min a pie" }, { n: "Qorikancha", d: "12 min a pie" }, { n: "Centro de salud", d: "10 min en taxi" } ],
      tours: [ { id: "t-mapi", n: "Machu Picchu full day", n_en: "Machu Picchu full day", precio: 690, d: "Tren + bus + guía" }, { id: "t-valle", n: "Valle Sagrado", n_en: "Sacred Valley", precio: 120, d: "Día completo con almuerzo" }, { id: "t-arco", n: "Montaña de Colores", n_en: "Rainbow Mountain", precio: 110, d: "Salida 4:00" }, { id: "t-aeroc", n: "Traslado al aeropuerto", n_en: "Airport transfer", precio: 35, d: "Auto privado" } ] },
    { id: "mancora", nombre: "Killa Máncora", tipo: "playa", ciudad: "Máncora", direccion: "Antigua Panamericana Norte km 1164", telefono: "073 25 8899", whatsapp: "51987654323",
      ruc: "20612345671", razon: "Killa Hospedaje SAC", foto: "1507525428034-b723cf961d3e", resena: "https://www.google.com/maps",
      desc: "Frente al mar, con piscina, sombrillas y los mejores atardeceres del norte.", desc_en: "Beachfront, with pool, umbrellas and the best sunsets in northern Peru.",
      reglas: ["Piscina de 8:00 a 20:00", "Toallas de playa en recepción", "Devuelve las sombrillas al atardecer"],
      reglas_en: ["Pool open 8 am–8 pm", "Beach towels at the front desk", "Please return umbrellas at sunset"],
      cerca: [ { n: "Playa principal", d: "Al frente" }, { n: "Centro de Máncora", d: "5 min en mototaxi" }, { n: "Las Pocitas", d: "10 min en mototaxi" }, { n: "Botica", d: "3 cuadras" } ],
      tours: [ { id: "t-ballenas", n: "Avistamiento de ballenas", n_en: "Whale watching", precio: 90, d: "Jul–Oct · 3 h" }, { id: "t-tortugas", n: "Nado con tortugas", n_en: "Swim with turtles", precio: 60, d: "El Ñuro · 2 h" }, { id: "t-tabla", n: "Clase de surf", n_en: "Surf lesson", precio: 80, d: "1.5 h con tabla" } ] },
    { id: "oxapampa", nombre: "Killa Oxapampa", tipo: "campo", ciudad: "Oxapampa", direccion: "Carretera a Chontabamba km 3", telefono: "063 46 2211", whatsapp: "51987654324",
      ruc: "20612345671", razon: "Killa Hospedaje SAC", foto: "1449158743715-0a90ebb6d2d8", resena: "https://www.google.com/maps",
      desc: "Bungalows de madera entre bosque y río, con fogata, parrilla y caminatas.", desc_en: "Wooden bungalows between forest and river, with bonfire, grill and hikes.",
      reglas: ["Fogata los viernes y sábados a las 19:00", "Zona de parrilla con reserva", "Mascotas bienvenidas con aviso previo"],
      reglas_en: ["Bonfire Fridays and Saturdays at 7 pm", "Grill area upon booking", "Pets welcome with prior notice"],
      cerca: [ { n: "Plaza de Oxapampa", d: "8 min en auto" }, { n: "Catarata Río Tigre", d: "20 min" }, { n: "Parque Yanachaga", d: "40 min" }, { n: "Grifo y bodega", d: "5 min" } ],
      tours: [ { id: "t-cab", n: "Paseo a caballo", n_en: "Horseback ride", precio: 50, d: "1.5 h" }, { id: "t-cata", n: "Caminata a la catarata", n_en: "Waterfall hike", precio: 40, d: "Con guía local" }, { id: "t-pozuzo", n: "Pozuzo full day", n_en: "Pozuzo day trip", precio: 95, d: "Pueblo austro-alemán" } ] }
  ],

  habitaciones: [
    { id: "mir-101", sede: "miraflores", num: "101", tipo: "Simple ejecutiva", tipo_en: "Executive single", cap: 1, camas: "1 cama plaza y media", camas_en: "1 full bed", precio: 140, fotos: ["1631049307264-da0ec9d70304"], amen: ["wifi", "tv", "escritorio", "agua"] },
    { id: "mir-204", sede: "miraflores", num: "204", tipo: "Doble estándar", tipo_en: "Standard double", cap: 2, camas: "1 cama queen", camas_en: "1 queen bed", precio: 190, fotos: ["1611892440504-42a792e24d32"], amen: ["wifi", "tv", "escritorio", "frigobar", "agua"] },
    { id: "mir-305", sede: "miraflores", num: "305", tipo: "Suite con balcón", tipo_en: "Balcony suite", cap: 3, camas: "1 king + 1 sofá cama", camas_en: "1 king + sofa bed", precio: 290, fotos: ["1590490360182-c33d57733427"], amen: ["wifi", "tv", "escritorio", "frigobar", "balcon", "tina"] },
    { id: "cus-01", sede: "cusco", num: "01", tipo: "Matrimonial colonial", tipo_en: "Colonial double", cap: 2, camas: "1 cama queen", camas_en: "1 queen bed", precio: 170, fotos: ["1618773928121-c32242e63f39"], amen: ["wifi", "calefaccion", "agua", "mate"] },
    { id: "cus-02", sede: "cusco", num: "02", tipo: "Triple familiar", tipo_en: "Family triple", cap: 3, camas: "1 queen + 1 individual", camas_en: "1 queen + 1 single", precio: 220, fotos: ["1566665797739-1674de7a421a"], amen: ["wifi", "calefaccion", "tv", "mate"] },
    { id: "cus-03", sede: "cusco", num: "03", tipo: "Suite vista a San Blas", tipo_en: "San Blas view suite", cap: 2, camas: "1 cama king", camas_en: "1 king bed", precio: 280, fotos: ["1582719478250-c89cae4dc85b"], amen: ["wifi", "calefaccion", "tv", "balcon", "tina", "mate"] },
    { id: "cus-04", sede: "cusco", num: "04", tipo: "Doble twin", tipo_en: "Twin room", cap: 2, camas: "2 camas individuales", camas_en: "2 single beds", precio: 160, fotos: ["1595576508898-0ad5c879a061"], amen: ["wifi", "calefaccion", "agua"] },
    { id: "man-11", sede: "mancora", num: "11", tipo: "Bungalow vista al mar", tipo_en: "Ocean view bungalow", cap: 2, camas: "1 cama king", camas_en: "1 king bed", precio: 320, fotos: ["1499793983690-e29da59ef1c2"], amen: ["wifi", "aire", "terraza", "hamaca", "frigobar"] },
    { id: "man-12", sede: "mancora", num: "12", tipo: "Familiar junto a la piscina", tipo_en: "Family poolside", cap: 4, camas: "1 queen + 2 individuales", camas_en: "1 queen + 2 singles", precio: 380, fotos: ["1571896349842-33c89424de2d"], amen: ["wifi", "aire", "terraza", "frigobar", "tv"] },
    { id: "man-13", sede: "mancora", num: "13", tipo: "Doble jardín", tipo_en: "Garden double", cap: 2, camas: "1 cama queen", camas_en: "1 queen bed", precio: 210, fotos: ["1520250497591-112f2f40a3f4"], amen: ["wifi", "ventilador", "hamaca"] },
    { id: "oxa-a", sede: "oxapampa", num: "A", tipo: "Bungalow del río", tipo_en: "River bungalow", cap: 2, camas: "1 cama queen", camas_en: "1 queen bed", precio: 200, fotos: ["1510798831971-661eb04b3739"], amen: ["wifi", "chimenea", "terraza", "hamaca"] },
    { id: "oxa-b", sede: "oxapampa", num: "B", tipo: "Cabaña familiar", tipo_en: "Family cabin", cap: 5, camas: "1 queen + camarote + 1 individual", camas_en: "1 queen + bunk + 1 single", precio: 320, fotos: ["1449158743715-0a90ebb6d2d8"], amen: ["wifi", "chimenea", "cocina", "terraza", "parrilla"] },
    { id: "oxa-c", sede: "oxapampa", num: "C", tipo: "Doble del bosque", tipo_en: "Forest double", cap: 2, camas: "2 camas individuales", camas_en: "2 single beds", precio: 160, fotos: ["1587061949409-02df41d5e562"], amen: ["wifi", "terraza"] }
  ],

  // sede: "todas" o el id de una sede · tipos: limita a ciertos estilos de hospedaje
  productos: [
    { id: "p-agua", n: "Agua mineral 625 ml", n_en: "Mineral water 625 ml", precio: 4, cat: "bebidas", e: "💧", sede: "todas", stock: 60 },
    { id: "p-gaseosa", n: "Inca Kola 500 ml", n_en: "Inca Kola 500 ml", precio: 5, cat: "bebidas", e: "🥤", sede: "todas", stock: 40 },
    { id: "p-cerveza", n: "Cerveza Cusqueña", n_en: "Cusqueña beer", precio: 9, cat: "bebidas", e: "🍺", sede: "todas", stock: 36 },
    { id: "p-cafe", n: "Café pasado de Chanchamayo", n_en: "Chanchamayo drip coffee", precio: 8, cat: "bebidas", e: "☕", sede: "todas", stock: 50 },
    { id: "p-papas", n: "Papas nativas", n_en: "Native potato chips", precio: 6, cat: "snacks", e: "🥔", sede: "todas", stock: 30 },
    { id: "p-chocolate", n: "Chocolate al 70 %", n_en: "70% chocolate bar", precio: 10, cat: "snacks", e: "🍫", sede: "todas", stock: 25 },
    { id: "p-desayuno", n: "Desayuno a la habitación", n_en: "Breakfast in room", precio: 25, cat: "desayuno", e: "🍳", sede: "todas", stock: 99 },
    { id: "p-cepillo", n: "Kit de cepillo y pasta", n_en: "Toothbrush kit", precio: 6, cat: "aseo", e: "🪥", sede: "todas", stock: 40 },
    { id: "p-cargador", n: "Cargador USB-C", n_en: "USB-C charger", precio: 25, cat: "aseo", e: "🔌", sede: "todas", stock: 10 },
    { id: "p-mate", n: "Mate de coca (caja)", n_en: "Coca tea (box)", precio: 12, cat: "souvenirs", e: "🍵", sede: "todas", tipos: ["turistico"], stock: 30 },
    { id: "p-chullo", n: "Chullo de alpaca", n_en: "Alpaca chullo hat", precio: 45, cat: "souvenirs", e: "🧶", sede: "todas", tipos: ["turistico"], stock: 15 },
    { id: "p-oxigeno", n: "Oxígeno portátil", n_en: "Portable oxygen", precio: 35, cat: "aseo", e: "🫁", sede: "todas", tipos: ["turistico"], stock: 12 },
    { id: "p-bloqueador", n: "Bloqueador solar FPS 50", n_en: "Sunscreen SPF 50", precio: 38, cat: "playa", e: "🧴", sede: "todas", tipos: ["playa"], stock: 20 },
    { id: "p-sombrilla", n: "Alquiler de sombrilla (día)", n_en: "Umbrella rental (day)", precio: 20, cat: "playa", e: "⛱️", sede: "todas", tipos: ["playa"], stock: 15 },
    { id: "p-chilcano", n: "Chilcano de pisco", n_en: "Pisco chilcano", precio: 18, cat: "bebidas", e: "🍹", sede: "todas", tipos: ["playa"], stock: 50 },
    { id: "p-lena", n: "Atado de leña", n_en: "Firewood bundle", precio: 15, cat: "campo", e: "🪵", sede: "todas", tipos: ["campo"], stock: 20 },
    { id: "p-carbon", n: "Carbón para parrilla 3 kg", n_en: "Charcoal 3 kg", precio: 18, cat: "campo", e: "🔥", sede: "todas", tipos: ["campo"], stock: 15 },
    { id: "p-repelente", n: "Repelente de insectos", n_en: "Insect repellent", precio: 16, cat: "campo", e: "🦟", sede: "todas", tipos: ["campo", "playa"], stock: 20 },
    { id: "p-miel", n: "Miel de Oxapampa", n_en: "Oxapampa honey", precio: 22, cat: "souvenirs", e: "🍯", sede: "todas", tipos: ["campo"], stock: 12 },
    { id: "p-taza", n: "Taza Killa", n_en: "Killa mug", precio: 28, cat: "souvenirs", e: "🌙", sede: "todas", stock: 20 }
  ]
};
