// ==========================================
// 📸 FIREBASE STORAGE - GESTIÓN DE IMÁGENES
// ==========================================

// Función para subir imagen a Firebase Storage
function subirImagenAStorage(archivo) {
    return new Promise((resolve, reject) => {
        if (!archivo) {
            resolve(null);
            return;
        }

        // Validaciones
        const tiposPermitidos = ["image/png", "image/jpeg", "image/jpg"];
        if (!tiposPermitidos.includes(archivo.type)) {
            reject(new Error("Solo se permiten imágenes PNG o JPG"));
            return;
        }

        if (archivo.size > 3 * 1024 * 1024) {
            reject(new Error("La imagen no puede superar los 3MB"));
            return;
        }

        // Crear nombre único para la imagen
        const timestamp = Date.now();
        const nombreArchivo = `comentarios/${timestamp}_${archivo.name}`;

        console.log(`📸 Iniciando subida de imagen: ${nombreArchivo}`);

        // Referencia a Firebase Storage
        const refStorage = firebase.storage().ref(nombreArchivo);

        // Subir archivo
        const tarea = refStorage.put(archivo);

        // Monitorear progreso
        tarea.on('state_changed',
            (snapshot) => {
                const progreso = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Progreso de subida: ${progreso.toFixed(2)}%`);
            },
            (error) => {
                console.error("❌ Error al subir imagen:", error);
                reject(error);
            },
            async () => {
                // Obtener URL pública de descarga
                try {
                    const url = await tarea.snapshot.ref.getDownloadURL();
                    console.log(`✅ Imagen subida exitosamente: ${url}`);
                    resolve({
                        url: url,
                        nombreArchivo: nombreArchivo,
                        timestamp: timestamp
                    });
                } catch (error) {
                    console.error("❌ Error al obtener URL:", error);
                    reject(error);
                }
            }
        );
    });
}

// Función para eliminar imagen de Firebase Storage
function eliminarImagenDeStorage(nombreArchivo) {
    return new Promise((resolve, reject) => {
        if (!nombreArchivo) {
            resolve();
            return;
        }

        const refStorage = firebase.storage().ref(nombreArchivo);
        
        refStorage.delete()
            .then(() => {
                console.log(`✅ Imagen eliminada: ${nombreArchivo}`);
                resolve();
            })
            .catch((error) => {
                console.error("❌ Error al eliminar imagen:", error);
                reject(error);
            });
    });
}

// Hacer funciones disponibles globalmente
window.subirImagenAStorage = subirImagenAStorage;
window.eliminarImagenDeStorage = eliminarImagenDeStorage;
