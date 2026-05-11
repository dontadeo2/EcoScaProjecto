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

console.log('✅ Firebase inicializado correctamente');

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