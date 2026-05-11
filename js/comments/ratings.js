window.selectedRating = 5;

// Manejo de las Estrellas
const stars = document.querySelectorAll('.star-rating span');
stars.forEach(s => {
    s.onclick = () => {
        stars.forEach(st => st.classList.remove('active'));
        s.classList.add('active');
        window.selectedRating = s.getAttribute('data-v');
    }
});