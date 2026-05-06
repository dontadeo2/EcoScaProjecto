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

    Promise.all([
        database.ref('comments').once('value'),
        database.ref('encuestas').once('value')
    ]).then(([commentsSnap, encuestasSnap]) => {

        const comments = commentsSnap.val();
        const encuestas = encuestasSnap.val();

        let total = 0;
        let suma = 0;

        // =====================
        // 📊 PROCESAR COMENTARIOS
        // =====================
        let contenido = `===== REPORTE ECOSCAN =====\n\n`;

        if (comments) {
            for (let id in comments) {
                total++;
                suma += parseInt(comments[id].rating);
            }
        }

        let promedio = total > 0 ? (suma / total).toFixed(2) : 0;

        contenido += `Total de opiniones: ${total}\n`;
        contenido += `Calificación promedio: ${promedio}\n\n`;

        contenido += `===== COMENTARIOS =====\n\n`;

        if (comments) {
            for (let id in comments) {
                contenido += `Nombre: ${comments[id].name}\n`;
                contenido += `Calificación: ${comments[id].rating} estrellas\n`;
                contenido += `Comentario: ${comments[id].text}\n`;
                contenido += `-------------------------\n`;
            }
        } else {
            contenido += "No hay comentarios registrados.\n";
        }

        // =====================
        // 📊 PROCESAR ENCUESTAS
        // =====================

        contenido += `\n===== RESULTADOS ENCUESTA =====\n\n`;

        let si = 0, no = 0, otros = 0;

        if (encuestas) {
            for (let id in encuestas) {
                if (encuestas[id].p1 === "Si") si++;
                else if (encuestas[id].p1 === "No") no++;
                else otros++;
            }

            contenido += `Pregunta 1 (Mala experiencia):\n`;
            contenido += `Sí: ${si}\nNo: ${no}\nNo recuerda: ${otros}\n\n`;

            contenido += `Total encuestas: ${Object.keys(encuestas).length}\n`;
        } else {
            contenido += "No hay encuestas registradas.\n";
        }

        // =====================
        // 📥 DESCARGA
        // =====================

        let blob = new Blob(["\uFEFF" + contenido], { type: "text/plain;charset=utf-8;" });

        let enlace = document.createElement("a");
        enlace.href = URL.createObjectURL(blob);
        enlace.download = "reporte_ecoscan.txt";
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
        }
    });

});