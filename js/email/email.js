// 1. INICIALIZACIÓN CON TU CLAVE REAL
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