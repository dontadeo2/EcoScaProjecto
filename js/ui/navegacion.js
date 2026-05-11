function irAPanelOpiniones() {
    document.getElementById('interfaz-inicio').style.display = 'none';
    document.getElementById('interfaz-detallada').style.display = 'block';
    // Quitamos el scrollTo para que no te mande arriba
}

function irAInicio() {
    document.getElementById('interfaz-detallada').style.display = 'none';
    document.getElementById('interfaz-inicio').style.display = 'block';
}