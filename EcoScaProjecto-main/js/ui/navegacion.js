function irAPanelOpiniones() {
    document.getElementById('interfaz-inicio').style.display = 'none';
    document.getElementById('interfaz-detallada').style.display = 'block';
}

function irAInicio() {
    document.getElementById('interfaz-detallada').style.display = 'none';
    document.getElementById('interfaz-inicio').style.display = 'block';
}

// Muestra la miniatura de la foto en la interfaz detallada antes de subirla
function previsualizarImagen(event) {
    const reader = new FileReader();
    reader.onload = function(){
        const output = document.getElementById('img-preview');
        output.src = reader.result;
        document.getElementById('wrapper-preview').style.display = 'block';
    };
    if(event.target.files[0]) {
        reader.readAsDataURL(event.target.files[0]);
    }
}