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