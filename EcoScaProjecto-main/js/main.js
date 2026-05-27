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

// --- FUNCIÓN UNIFICADA: SUBE FOTO A IMGBB, GUARDA EN FIREBASE Y LLAMA AL CORREO SEPARADO ---
async function enviarOpinionFinal() {
    const localSelect = document.getElementById('local-seleccionado');
    const opinionText = document.getElementById('comentario-detallado');
    const nombreInput = document.getElementById('nombre-estudiante-detallado');
    const inputFoto = document.getElementById("foto-evidencia-detallada");

    // Tu llave API de ImgBB operativa
    const IMGBB_API_KEY = "3169fe5579492c8b6866ae9e35e8db7a";

    const local = localSelect.value;
    const opinion = opinionText.value.trim();
    const nombreReal = nombreInput.value.trim() || "Anónimo";

    // Validaciones básicas de los campos en el stand
    if (!local || !opinion) {
        alert("Por favor selecciona un local y escribe tu opinión.");
        return;
    }

    // Bloquear controles visuales durante la carga
    document.getElementById("btn-enviar-detallado").disabled = true;
    document.getElementById("loading-upload").style.display = "block";

    let urlFotoFinal = ""; // Queda vacío de forma predeterminada si el usuario no pone foto

    try {
        // 1. Subir la foto a ImgBB si el estudiante seleccionó una
        if (inputFoto.files.length > 0) {
            const archivo = inputFoto.files[0];
            const formData = new FormData();
            formData.append("image", archivo);

            const respuesta = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: "POST",
                body: formData
            });

            const resultadoJson = await respuesta.json();

            if (resultadoJson.success) {
                urlFotoFinal = resultadoJson.data.url; 
                console.log("¡Foto subida a ImgBB con éxito! -> ", urlFotoFinal);
            } else {
                throw new Error("ImgBB rechazó la imagen");
            }
        }

        // 2. Guardamos en Firebase respetando la ruta de tus otros módulos
        const datosFirebase = {
            usuario: nombreReal,      // Guarda el nombre en Firebase para el Admin de la UTLVTE
            comentario: opinion,
            fotoUrl: urlFotoFinal,     // Guardamos el link de la foto en la base de datos
            fecha: new Date().toLocaleString()
        };

        // Guardamos exactamente en la ruta que interactúa con tu Firebase actual
        await database.ref('opiniones_por_local/' + local).push(datosFirebase);

        // 3. ENVIAR EMAIL AUTOMÁTICO AL DUEÑO (Pasamos opinión y URL de la foto de forma independiente)
        try {
            // Llamamos a la función que está en email.js pasándole los parámetros limpios
            enviarNotificacionEmail(local, opinion, urlFotoFinal);
        } catch (e) {
            console.log("⚠️ El correo no pudo despacharse, pero los datos ya están seguros en Firebase.");
        }

        // Sonido de éxito en el stand (si cuentas con él)
        const sonido = document.getElementById("ding-sound");
        if(sonido) sonido.play();

        alert("✅ ¡Opinión y evidencia enviadas con éxito en tiempo real!");

        // LIMPIEZA DE CAMPOS PARA EL SIGUIENTE ESTUDIANTE
        opinionText.value = "";
        nombreInput.value = "";
        inputFoto.value = "";
        if (document.getElementById("wrapper-preview")) {
            document.getElementById("wrapper-preview").style.display = "none";
        }
        localSelect.selectedIndex = 0;

        // Regresar automáticamente a la interfaz principal
        irAInicio();

    } catch (error) {
        console.error("Error en el circuito de EcoScan:", error);
        alert("Hubo un inconveniente al procesar los datos. Inténtalo de nuevo.");
    } finally {
        // Reactivar controles del formulario
        document.getElementById("btn-enviar-detallado").disabled = false;
        document.getElementById("loading-upload").style.display = "none";
    }
}