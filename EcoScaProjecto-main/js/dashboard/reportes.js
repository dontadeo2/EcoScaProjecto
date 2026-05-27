// --- GENERAR REPORTE EN PDF ---
function generarReporte() {
    const pass = prompt("Introduce tu clave de acceso:");

    // Configuración de accesos
    const accesos = {
        "admin123": "TODOS",          // Tú (Super Admin)
        "tic2026": "Bar TIC",         // Dueño del Bar TIC
        "cafe99": "Cafetería Central", // Dueño de Cafetería
        "facu77": "Bar de la Facultad" // Dueño de Facultad
    };

    const permiso = accesos[pass];

    if (!permiso) {
        alert("Clave incorrecta. Acceso denegado.");
        return;
    }

    database.ref('opiniones_por_local').once('value', (snapshot) => {
        const locales = snapshot.val();
        if (!locales) {
            alert("No hay datos aún.");
            return;
        }

        let contenido = `===== REPORTE DE FEEDBACK - ECOSCAN =====\n`;
        contenido += `Acceso: ${permiso}\n`;
        contenido += `Fecha de generación: ${new Date().toLocaleString()}\n\n`;

        if (permiso === "TODOS") {
            // --- REPORTE PARA TI (Super Admin): Muestra nombres reales ---
            for (let local in locales) {
                contenido += `📍 LOCAL: ${local}\n`;
                for (let id in locales[local]) {
                    const dato = locales[local][id];
                    // Aquí usamos dato.usuario para ver el nombre real
                    contenido += `   - [${dato.usuario}]: "${dato.comentario}" (${dato.fecha})\n`;
                }
                contenido += `----------------------------------\n`;
            }
        } else {
            // --- REPORTE PARA DUEÑOS: Oculta nombres reales (Anónimo) ---
            const datosLocal = locales[permiso];
            if (datosLocal) {
                contenido += `📍 LOCAL: ${permiso}\n`;
                for (let id in datosLocal) {
                    const dato = datosLocal[id];
                    // Aquí forzamos "Anónimo" para que el dueño no vea el nombre
                    contenido += `   - [Anónimo]: "${dato.comentario}" (${dato.fecha})\n`;
                }
            } else {
                contenido += `No hay opiniones registradas para el local: ${permiso}`;
            }
        }

        // Descarga del archivo TXT
        const blob = new Blob(["\uFEFF" + contenido], { type: "text/plain;charset=utf-8;" });
        const enlace = document.createElement("a");
        enlace.href = URL.createObjectURL(blob);
        enlace.download = `Reporte_${permiso.replace(/ /g, "_")}.txt`;
        enlace.click();

        alert("📊 Reporte generado con éxito.");
    });
}