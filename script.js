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
    const btn = document.querySelector('.btn-send');

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