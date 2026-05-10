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

console.log('Firebase inicializado correctamente');

// Verificar conexión a Firebase
database.ref('.info/connected').on('value', (snap) => {
    if (snap.val() === true) {
        console.log('Conectado a Firebase');
    } else {
        console.log('Desconectado de Firebase');
    }
});

// Verificar conexión a Firebase
database.ref('.info/connected').on('value', (snap) => {
    const indicator = document.getElementById('connection-indicator');
    const statusText = document.getElementById('status-text');

    if (snap.val() === true) {
        console.log('✅ Conectado a Firebase');
        if (indicator) indicator.classList.add('connected');
        if (statusText) statusText.innerText = 'Conectado - Tiempo Real';
    } else {
        console.log('❌ Desconectado de Firebase');
        if (indicator) indicator.classList.remove('connected');
        if (statusText) statusText.innerText = 'Desconectado';
    }
});

let selectedRating = 5;

const palabrasProhibidas = [
    "puta",
    "mierda",
    "idiota",
    "imbecil",
    "porno",
    "sexo",
    "estupido",
    "gilipollas",
    "pendejo",
    "cabrón",
    "zorra",
    "maricón",
    "coño",
    "maldito",
    "hijo de puta",
    "polla",
    "culero",
    "verga",
    "chinga",
    "chingada",
    "chingar",
    "pendeja",
    "puto",
    "puta madre",
    "hijo de la gran puta",
    "Rosa melano",
    "ayer singe",
    "caca",
    "culo",
    "pene",
    "vagina",
    "teta",
    "tetas",
    "pija",
    "pene",
    "coger",
    "follar",
    "joder",
    "jodido",
    "jodida",
    "cojones",
    "hostia",
    "hostias",
    "carajo",
    "malparido",
    "malparida",


];

// Función para detectar palabras prohibidas
function contienePalabrasProhibidas(texto) {
    texto = texto.toLowerCase();

    return palabrasProhibidas.some(palabra =>
        texto.includes(palabra)
    );
}

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
    const name = document.getElementById('userName').value.trim();
    const text = document.getElementById('userComment').value.trim();

    const evidenciaInput = document.getElementById('evidencia');
    const archivo = evidenciaInput.files[0];

    // ✅ VALIDAR IMAGEN
    if (archivo) {

        // Limitar formatos
        const tiposPermitidos = ["image/png", "image/jpeg", "image/jpg"];

        if (!tiposPermitidos.includes(archivo.type)) {
            alert("Solo se permiten imágenes PNG o JPG.");
            return;
        }

        // Limitar tamaño a 5MB
        if (archivo.size > 3 * 1024 * 1024) {
            alert("La imagen no puede superar los 3MB.");
            return;
        }
    }

    // 🔥 Censurar palabras automáticamente
    let comentarioFiltrado = text;

    palabrasProhibidas.forEach(palabra => {
        const regex = new RegExp(palabra, 'gi');
        comentarioFiltrado = comentarioFiltrado.replace(regex, '****');
    });



    if (!text) {
        alert('Por favor escribe un comentario');
        return;
    }

    const btn = e.target.querySelector('.btn-send');
    const originalText = btn.innerText;

    btn.innerText = "Enviando...";
    btn.disabled = true;

    const reader = new FileReader();

    reader.onload = function () {

        const commentData = {
            name: name || 'Anónimo',
            text: comentarioFiltrado,
            rating: selectedRating,
            timestamp: Date.now(),
            imagen: archivo ? reader.result : null
        };

        console.log('Enviando comentario:', commentData);

        database.ref('comments').push(commentData)
            .then((ref) => {
                console.log('Comentario enviado exitosamente, ID:', ref.key);

                btn.innerText = "¡Enviado! Gracias 💚";
                btn.style.background = "#27ae60";

                document.getElementById('comment-form').reset();

                selectedRating = 5;

                stars.forEach(st => st.classList.remove('active'));
                stars[0].classList.add('active');

                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.background = "var(--primary)";
                    btn.disabled = false;
                }, 3000);
            })
            .catch((error) => {
                console.error('Error al enviar comentario:', error);
                alert('Error al enviar comentario.');

                btn.innerText = originalText;
                btn.disabled = false;
            });
    };

    if (archivo) {
        reader.readAsDataURL(archivo);
    } else {
        reader.onload();
    }
};

// Variables para controlar el sonido
let isFirstLoad = true;
let previousCount = 0;
const dingSound = document.getElementById('ding-sound');

// Escuchar cambios en tiempo real
console.log('Configurando listener de comentarios...');

database.ref('comments').on('value', (snapshot) => {
    console.log('Listener activado - snapshot recibido');
    const data = snapshot.val();
    console.log('Datos recibidos:', data);
    const container = document.getElementById('comments-container');

    if (!container) {
        console.error('Contenedor de comentarios no encontrado');
        return;
    }

    // Limpiar contenedor
    container.innerHTML = '';

    let total = 0;
    let sumRating = 0;

    if (data) {
        console.log('Procesando comentarios...');
        // Convertir a array para ordenar por timestamp (más recientes primero)
        const commentsArray = Object.entries(data).map(([id, comment]) => ({
            id,
            ...comment
        })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        console.log('Comentarios ordenados:', commentsArray.length);

        commentsArray.forEach((comment, index) => {
            total++;
            sumRating += parseInt(comment.rating) || 0;

            const div = document.createElement('div');
            div.className = 'comment-card';
            div.innerHTML = `
                <strong>${comment.name || 'Anónimo'}</strong>
                <span class="stars">${'★'.repeat(comment.rating || 5)}</span>
                <p>${comment.text || 'Sin comentario'}</p>

                ${comment.imagen ? `
    <img src="${comment.imagen}" class="evidencia-img">
` : ''}

                ${comment.timestamp ? `<small>${new Date(comment.timestamp).toLocaleString()}</small>` : ''}
            `;
            container.appendChild(div);
            console.log(`Comentario ${index + 1} agregado al DOM`);
        });
    } else {
        console.log('No hay datos de comentarios');
    }

    // Actualizar estadísticas
    const totalCommentsEl = document.getElementById('total-comments');
    const avgRatingEl = document.getElementById('avg-rating');

    if (totalCommentsEl) {
        totalCommentsEl.innerText = total;
        console.log('Estadísticas actualizadas - Total:', total);
    }
    if (avgRatingEl) {
        avgRatingEl.innerText = total > 0 ? (sumRating / total).toFixed(1) : "5.0";
        console.log('Estadísticas actualizadas - Promedio:', total > 0 ? (sumRating / total).toFixed(1) : "5.0");
    }

    // Mostrar mensaje si no hay comentarios
    if (total === 0) {
        container.innerHTML = '<div class="loading-text">No hay comentarios aún. ¡Sé el primero en opinar!</div>';
        console.log('Mostrando mensaje de no comentarios');
    }

    // Reproducir sonido para nuevos comentarios
    if (!isFirstLoad && total > previousCount) {
        console.log('Nuevo comentario detectado, reproduciendo sonido'); dingSound.play().catch(error => console.log("Clickea la pantalla primero para el sonido."));
    }

    previousCount = total;
    isFirstLoad = false;
}, (error) => {
    console.error('Error al cargar comentarios:', error);
    const container = document.getElementById('comments-container');
    if (container) {
        container.innerHTML = '<div class="loading-text" style="color: #e74c3c;">Error al cargar comentarios. Verifica tu conexión.</div>';
    }
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
        "admin123": "TODOS",          // Tú (Super Admin)
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
        if (!locales) {
            alert("No hay datos aún.");
            return;
        }

        let contenido = `===== REPORTE DE FEEDBACK - ECOSCAN =====\n`;
        contenido += `Acceso: ${permiso}\n`;
        contenido += `Fecha de generación: ${new Date().toLocaleString()}\n\n`;

        if (permiso === "TODOS") {
            // --- REPORTE PARA TI (Super Admin): Muestra nombres reales ---
            for (let local in locales) {
                contenido += `📍 LOCAL: ${local}\n`;
                for (let id in locales[local]) {
                    const dato = locales[local][id];
                    // Aquí usamos dato.usuario para ver el nombre real
                    contenido += `   - [${dato.usuario}]: "${dato.comentario}" (${dato.fecha})\n`;
                }
                contenido += `----------------------------------\n`;
            }
        } else {
            // --- REPORTE PARA DUEÑOS: Oculta nombres reales (Anónimo) ---
            const datosLocal = locales[permiso];
            if (datosLocal) {
                contenido += `📍 LOCAL: ${permiso}\n`;
                for (let id in datosLocal) {
                    const dato = datosLocal[id];
                    // Aquí forzamos "Anónimo" para que el dueño no vea el nombre
                    contenido += `   - [Anónimo]: "${dato.comentario}" (${dato.fecha})\n`;
                }
            } else {
                contenido += `No hay opiniones registradas para el local: ${permiso}`;
            }
        }

        // Descarga del archivo TXT
        const blob = new Blob(["\uFEFF" + contenido], { type: "text/plain;charset=utf-8;" });
        const enlace = document.createElement("a");
        enlace.href = URL.createObjectURL(blob);
        enlace.download = `Reporte_${permiso.replace(/ /g, "_")}.txt`;
        enlace.click();

        alert("📊 Reporte generado con éxito.");
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
    const nombreInput = document.getElementById('nombre-estudiante-detallado'); // CAPTURA EL NUEVO CAMPO

    const local = localSelect.value;
    const opinion = opinionText.value;
    // Si deja vacío el nombre, ponemos "Anónimo"
    const nombreReal = nombreInput.value.trim() || "Anónimo";

    if (!local || !opinion.trim()) {
        alert("Por favor selecciona un local y escribe tu opinión.");
        return;
    }

    // Guardamos el NOMBRE REAL en Firebase para ti (Super Admin)
    const datosFirebase = {
        usuario: nombreReal,
        comentario: opinion,
        fecha: new Date().toLocaleString()
    };

    database.ref('opiniones_por_local/' + local).push(datosFirebase)
        .then(() => {
            // ENVIAR EMAIL AL DUEÑO: Aquí forzamos "Estudiante Anónimo" para proteger la identidad
            try {
                enviarNotificacionEmail(local, "Estudiante Anónimo", opinion);
            } catch (e) {
                console.log("Email no enviado, pero datos guardados en nube.");
            }

            alert("✅ ¡Opinión enviada con éxito!");

            // LIMPIEZA DE CAMPOS
            opinionText.value = "";
            nombreInput.value = "";
            localSelect.selectedIndex = 0;

            irAInicio();
        })
        .catch((error) => {
            alert("Error al conectar con la base de datos.");
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
        "Cafetería Central": "jenniffersq11@gmail.com", // Cambia por los reales
        "Bar de la Facultad": "angel.ballestero.villegas@utelvt.edu.ec",
        "Bar TIC": "jenniffer.quinonez.clavijo@utelvt.edu.ec"
    };
    return correos[local] || "jenniffer.quinonez.clavijo@utelvt.edu.ec";
}

// Función de prueba para verificar funcionamiento en tiempo real
function testComment() {
    const testData = {
        name: 'Usuario de Prueba',
        text: 'Este es un comentario de prueba para verificar el funcionamiento en tiempo real.',
        rating: 4,
        timestamp: Date.now()
    };

    console.log('Enviando comentario de prueba...');
    database.ref('comments').push(testData)
        .then(() => console.log('✅ Comentario de prueba enviado'))
        .catch(error => console.error('❌ Error en comentario de prueba:', error));
}

// Hacer la función disponible globalmente para pruebas
window.testComment = testComment;