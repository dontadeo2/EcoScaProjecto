// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyDCT390nRr7ouPBy5VPylsZOVvObF1zTQc",
    authDomain: "ecoscan-3b699.firebaseapp.com",
    databaseURL: "https://ecoscan-3b699-default-rtdb.firebaseio.com",
    projectId: "ecoscan-3b699",
    storageBucket: "ecoscan-3b699.firebasestorage.app",
    messagingSenderId: "549856830649",
    appId: "1:549856830649:web:f281bee35d990ad965a768",
    measurementId: "G-DYNLKV28MR"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let selectedRating = 5;

// Manejo de las Estrellas
const stars = document.querySelectorAll('.star-rating span');
stars.forEach(s => {
    s.onclick = () => {
        stars.forEach(st => st.classList.remove('active'));
        s.classList.add('active');
        selectedRating = s.getAttribute('data-v');
    }
});

// Guardar Comentario en la Nube
document.getElementById('comment-form').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('userName').value;
    const text = document.getElementById('userComment').value;
    const btn = e.target.querySelector('.btn-send');

    btn.innerText = "¡Enviado! Gracias 💚";
    btn.style.background = "#27ae60";

    database.ref('comments').push({
        name: name,
        text: text,
        rating: selectedRating,
        timestamp: Date.now()
    }).then(() => {
        setTimeout(() => {
            btn.innerText = "Publicar Comentario";
            btn.style.background = "var(--primary)";
        }, 3000);
    });

    document.getElementById('comment-form').reset();
    selectedRating = 5;
    stars.forEach(st => st.classList.remove('active'));
    stars[0].classList.add('active');
};

// Variables para controlar el sonido
let isFirstLoad = true;
let previousCount = 0;
const dingSound = document.getElementById('ding-sound');

// Escuchar cambios en tiempo real
database.ref('comments').on('value', (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById('comments-container');
    container.innerHTML = '';

    let total = 0;
    let sumRating = 0;

    for (let id in data) {
        total++;
        sumRating += parseInt(data[id].rating);

        const div = document.createElement('div');
        div.className = 'comment-card';
        div.innerHTML = `
            <strong>${data[id].name}</strong> - <span style="color:#f1c40f; font-size:1.2rem;">${'★'.repeat(data[id].rating)}</span>
            <p>${data[id].text}</p>
        `;
        container.prepend(div);
    }

    document.getElementById('total-comments').innerText = total;
    document.getElementById('avg-rating').innerText = total > 0 ? (sumRating / total).toFixed(1) : "5.0";

    if (!isFirstLoad && total > previousCount) {
        dingSound.play().catch(error => console.log("Clickea la pantalla primero para el sonido."));
    }

    previousCount = total;
    isFirstLoad = false;
});

// --- MAGIA DEL MODO OSCURO ---
const themeBtn = document.getElementById('theme-toggle');
const body = document.body;

// Revisamos si el usuario ya tenía el modo oscuro guardado
if (localStorage.getItem('ecoScanTheme') === 'dark') {
    body.classList.add('dark-mode');
    themeBtn.innerText = '☀️';
}

// Al darle clic al botón
themeBtn.onclick = () => {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        themeBtn.innerText = '☀️';
        localStorage.setItem('ecoScanTheme', 'dark'); // Lo guarda para que no se quite al recargar
    } else {
        themeBtn.innerText = '🌙';
        localStorage.setItem('ecoScanTheme', 'light');
    }
};

// --- GENERAR REPORTE EN PDF ---
function generarReporte() {
    const pass = prompt("Introduce tu clave de acceso:");
    
    // Configuración de accesos
    const accesos = {
        "admin123": "TODOS",          // Tú ves todo
        "tic2026": "Bar TIC",         // Dueño del Bar TIC
        "cafe99": "Cafetería Central", // Dueño de Cafetería
        "facu77": "Bar de la Facultad" // Dueño de Facultad
    };

    const permiso = accesos[pass];

    if (!permiso) {
        alert("Clave incorrecta. Acceso denegado.");
        return;
    }

    database.ref('opiniones_por_local').once('value', (snapshot) => {
        const locales = snapshot.val();
        if (!locales) { alert("No hay datos aún."); return; }

        let contenido = `===== REPORTE DE FEEDBACK - ECOSCAN =====\n`;
        contenido += `Acceso: ${permiso}\n\n`;

        if (permiso === "TODOS") {
            // Reporte para ti (Super Admin)
            for (let local in locales) {
                contenido += `📍 LOCAL: ${local}\n`;
                for (let id in locales[local]) {
                    contenido += `   - ${locales[local][id].comentario} (${locales[local][id].fecha})\n`;
                }
                contenido += `----------------------------------\n`;
            }
        } else {
            // Reporte filtrado para el dueño específico
            const datosLocal = locales[permiso];
            if (datosLocal) {
                contenido += `📍 LOCAL: ${permiso}\n`;
                for (let id in datosLocal) {
                    contenido += `   - ${datosLocal[id].comentario} (${datosLocal[id].fecha})\n`;
                }
            } else {
                contenido += "No hay opiniones registradas para este local.";
            }
        }

        // Descarga del archivo
        const blob = new Blob(["\uFEFF" + contenido], { type: "text/plain;charset=utf-8;" });
        const enlace = document.createElement("a");
        enlace.href = URL.createObjectURL(blob);
        enlace.download = `Reporte_${permiso.replace(" ", "_")}.txt`;
        enlace.click();
    });

}

document.getElementById("form-encuesta").onsubmit = function (e) {
    e.preventDefault();

    let selects = document.querySelectorAll("#form-encuesta select");
    let numero = document.querySelector("#form-encuesta input");

    database.ref("encuestas").push({
        p1: selects[0].value,
        p2: selects[1].value,
        p3: selects[2].value,
        p4: selects[3].value,
        p5: selects[4].value,
        p6: selects[5].value,
        p7: selects[6].value,
        p8: numero.value
    });

    alert("Encuesta enviada correctamente");
    this.reset();
};

let chart; // evitar duplicados

database.ref("encuestas").on("value", snapshot => {
    let data = snapshot.val();

    if (!data) return;

    let si = 0;
    let no = 0;
    let otros = 0;

    for (let id in data) {
        if (data[id].p1 === "Si") si++;
        else if (data[id].p1 === "No") no++;
        else otros++;
    }

    const ctx = document.getElementById("grafico");

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Sí", "No", "No recuerda"],
            datasets: [{
                label: "Experiencias negativas",
                data: [si, no, otros]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
});
let chart2;
let chart3;

database.ref("encuestas").on("value", snapshot => {
    let data = snapshot.val();
    if (!data) return;

    // =====================
    // 📊 PREGUNTA 3
    // =====================
    let encanta = 0, util = 0, indiferente = 0;

    // =====================
    // 📊 PREGUNTA 8
    // =====================
    let valores = [0, 0, 0, 0, 0];

    for (let id in data) {

        // P3
        if (data[id].p3 === "Me encantaría") encanta++;
        else if (data[id].p3 === "Sería útil") util++;
        else indiferente++;

        // P8
        let v = parseInt(data[id].p8);
        if (v >= 1 && v <= 5) valores[v - 1]++;
    }

    // =====================
    // 📊 GRÁFICO 2
    // =====================
    const ctx2 = document.getElementById("grafico2");
    if (chart2) chart2.destroy();

    chart2 = new Chart(ctx2, {
        type: "bar",
        data: {
            labels: ["Me encantaría", "Sería útil", "Indiferente"],
            datasets: [{
                label: "Actitud ante QR",
                data: [encanta, util, indiferente],
                backgroundColor: [
                    "rgba(54, 162, 235, 0.7)",
                    "rgba(75, 192, 192, 0.7)",
                    "rgba(255, 205, 86, 0.7)"
                ],
                borderColor: [
                    "rgba(54, 162, 235, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(255, 205, 86, 1)"
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    // =====================
    // 📊 GRÁFICO 3
    // =====================
    const ctx3 = document.getElementById("grafico3");
    if (chart3) chart3.destroy();

    chart3 = new Chart(ctx3, {
        type: "bar",
        data: {
            labels: ["1", "2", "3", "4", "5"],
            datasets: [{
                label: "Importancia",
                data: valores
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

});

function irAPanelOpiniones() {
    document.getElementById('interfaz-inicio').style.display = 'none';
    document.getElementById('interfaz-detallada').style.display = 'block';
    // Quitamos el scrollTo para que no te mande arriba
}

function irAInicio() {
    document.getElementById('interfaz-detallada').style.display = 'none';
    document.getElementById('interfaz-inicio').style.display = 'block';
}

// 1. INICIALIZACIÓN (PON TU PUBLIC KEY AQUÍ)
emailjs.init("8N-lpxos049EJBCNn"); 

function enviarOpinionFinal() {
    const localSelect = document.getElementById('local-seleccionado');
    const opinionText = document.getElementById('comentario-detallado');
    
    const local = localSelect.value;
    const opinion = opinionText.value;

    // Quitamos la búsqueda del nombre porque no existe ese campo en tu Interfaz 2
    if (!local || !opinion.trim()) {
        alert("Por favor selecciona un local y escribe tu opinión.");
        return;
    }

    const datosFirebase = {
        usuario: "Estudiante Anónimo", // Siempre anónimo
        comentario: opinion,
        fecha: new Date().toLocaleString()
    };

    // 2. GUARDAR EN FIREBASE
    database.ref('opiniones_por_local/' + local).push(datosFirebase)
    .then(() => {
        // 3. ENVIAR EMAIL (Dentro de un try-catch para que si falla el mail, igual se limpie la pantalla)
        try {
            enviarNotificacionEmail(local, "Estudiante Anónimo", opinion);
        } catch(e) {
            console.log("Error al disparar EmailJS:", e);
        }
        
        // 4. ÉXITO Y LIMPIEZA
        alert("✅ ¡Opinión enviada con éxito!");
        
        opinionText.value = ""; 
        localSelect.selectedIndex = 0; 
        
        irAInicio(); 
    })
    .catch((error) => {
        alert("Error de conexión.");
        console.error(error);
    });
}

// 1. INICIALIZACIÓN CON TU CLAVE REAL (Sacada de tu foto)
emailjs.init("8N-lpxos049EJBCNn"); 

function enviarNotificacionEmail(local, nombre, mensaje) {
    const serviceID = 'service_z00x1o9';
    const templateID = 'template_9nc3ks4'; // El que empieza por template_

    // COMPROBACIÓN DE LLAVES:
    // Aquí es donde "mensaje" y "establecimiento" deben llamarse igual que en EmailJS
    const parametros = {
        establecimiento: local,    // <--- ESTO LLENA EL {{establecimiento}}
        mensaje: mensaje,          // <--- ESTO LLENA EL {{mensaje}}
        nombre: "Anónimo",         
        email_dueno: obtenerEmailDelDueño(local) // Esto asegura que le llegue al dueño correcto
    };

    emailjs.send(serviceID, templateID, parametros)
        .then(() => console.log("¡Correo enviado con éxito!"))
        .catch(err => console.error("Error al enviar correo:", err));
}

// Asegúrate de que esta función también esté para que el correo sepa a dónde ir
function obtenerEmailDelDueño(local) {
    const correos = {
        "Cafetería Central": "tu_correo@gmail.com", // Cambia por los reales
        "Bar de la Facultad": "otro_correo@gmail.com",
        "Bar TIC": "jenniffer.quinonez.clavijo@utelvt.edu.ec" 
    };
    return correos[local] || "jenniffer.quinonez.clavijo@utelvt.edu.ec";
}