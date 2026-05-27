// 1. INICIALIZACIÓN CON TU CLAVE REAL DE EMAILJS
emailjs.init("8N-lpxos049EJBCNn");

// --- FUNCIÓN COMPLEMENTARIA: DISPARA EL EMAILJS CON LA FOTO SEPARADA ---
function enviarNotificacionEmail(local, mensaje, urlFoto) {
    const serviceID = 'service_z00x1o9';
    const templateID = 'template_9nc3ks4'; 

    const parametros = {
        establecimiento: local,    // Llena {{establecimiento}} en tu plantilla
        mensaje: mensaje,          // Llena {{mensaje}} con el texto de la opinión
        fotoUrl: urlFoto,          // 🌟 ¡Esta es la clave! Llena {{fotoUrl}} en tu plantilla para el <img src="{{fotoUrl}}">
        nombre: "Anónimo",
        email_dueno: obtenerEmailDelDueño(local) // Busca el correo automático del dueño correspondiente
    };

    emailjs.send(serviceID, templateID, parametros)
        .then(() => console.log("✉️ ¡Correo enviado al dueño con la foto lista!"))
        .catch(err => console.error("❌ Error en los servidores de EmailJS:", err));
}

// --- DICCIONARIO DE CORREOS DE LOS DUEÑOS ---
function obtenerEmailDelDueño(local) {
    const correos = {
        "Cafetería Central": "jenniffersq11@gmail.com",
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