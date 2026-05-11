// Variables sonido
let isFirstLoad = true;
let previousCount = 0;

const dingSound =
    document.getElementById('ding-sound');

// Guardar comentario
document.getElementById('comment-form').onsubmit = async (e) => {
    console.log('🚀 Iniciando envío de comentario');
    e.preventDefault();

    const name =
        document.getElementById('userName').value.trim();

    const text =
        document.getElementById('userComment').value.trim();

    console.log('📝 Nombre:', name, 'Texto:', text);

    const evidenciaInput =
        document.getElementById('evidencia');

    const archivo =
        evidenciaInput.files[0];

    console.log('🖼️ Archivo:', archivo ? archivo.name : 'Sin archivo');

    // Validar imagen
    if (archivo) {

        const tiposPermitidos = [
            "image/png",
            "image/jpeg",
            "image/jpg"
        ];

        if (!tiposPermitidos.includes(archivo.type)) {

            alert("Solo se permiten imágenes PNG o JPG.");
            return;
        }

        // 3MB
        if (archivo.size > 3 * 1024 * 1024) {

            alert("La imagen no puede superar los 3MB.");
            return;
        }
    }

    if (!text) {

        alert('Por favor escribe un comentario');
        console.log('❌ Texto vacío, cancelando envío');
        return;
    }

    // Censurar
    const comentarioFiltrado =
        censurarComentario(text);

    console.log('🔥 Texto censurado:', comentarioFiltrado);

    const btn =
        e.target.querySelector('.btn-send');

    const originalText =
        btn.innerText;

    btn.innerText = "Enviando...";
    btn.disabled = true;

    console.log('📤 Enviando a Firebase...');

    // Usar async para manejar Storage
    (async () => {
        try {
            let imagenData = null;

            // Si hay imagen, subirla a Storage primero
            if (archivo) {
                console.log('📸 Subiendo imagen a Storage...');
                imagenData = await window.subirImagenAStorage(archivo);
                console.log('✅ Imagen subida:', imagenData);
            }

            const commentData = {

                name: name || 'Anónimo',

                text: comentarioFiltrado,

                rating: window.selectedRating,

                timestamp: Date.now(),

                // Guardar URL de Storage en lugar de Base64
                imagenUrl: imagenData ? imagenData.url : null,

                // Guardar referencia para poder eliminar después
                nombreArchivo: imagenData ? imagenData.nombreArchivo : null
            };

            database.ref('comments')
                .push(commentData)

                .then(() => {
                    console.log('✅ Comentario enviado exitosamente');

                    btn.innerText =
                        "¡Enviado! 💚";

                    btn.style.background =
                        "#27ae60";

                    document
                        .getElementById('comment-form')
                        .reset();

                    window.selectedRating = 5;

                    stars.forEach(st =>
                        st.classList.remove('active')
                    );

                    stars[0].classList.add('active');

                    setTimeout(() => {

                        btn.innerText =
                            originalText;

                        btn.style.background =
                            "var(--primary)";

                        btn.disabled = false;

                    }, 3000);

                })

                .catch((error) => {
                    console.error('❌ Error al enviar comentario:', error);

                    alert('Error al enviar comentario.');

                    btn.innerText =
                        originalText;

                    btn.disabled = false;
                });
        } catch (error) {
            console.error('❌ Error al procesar imagen:', error);
            alert('Error al procesar la imagen: ' + error.message);
            btn.innerText = originalText;
            btn.disabled = false;
        }
    })();

};

// Escuchar comentarios
database.ref('comments').on('value', (snapshot) => {
    console.log('📡 Listener activado - snapshot recibido');
    const data = snapshot.val();
    console.log('📦 Datos recibidos:', data);

    const container =
        document.getElementById('comments-container');

    if (!container) return;

    container.innerHTML = '';

    let total = 0;
    let sumRating = 0;

    if (data) {

        const commentsArray =
            Object.entries(data)

            .map(([id, comment]) => ({
                id,
                ...comment
            }))

            .sort((a, b) =>
                (b.timestamp || 0)
                - (a.timestamp || 0)
            );

        commentsArray.forEach(comment => {

            total++;

            sumRating +=
                parseInt(comment.rating) || 0;

            const div =
                document.createElement('div');

            div.className = 'comment-card';

            div.innerHTML = `
                <strong>${comment.name || 'Anónimo'}</strong>

                <span class="stars">
                    ${'★'.repeat(comment.rating || 5)}
                </span>

                <p>${comment.text || 'Sin comentario'}</p>

                ${comment.imagenUrl ? `
                    <img src="${comment.imagenUrl}" class="evidencia-img" loading="lazy">
                ` : ''}

                ${comment.timestamp ? `
                    <small>
                        ${new Date(comment.timestamp).toLocaleString()}
                    </small>
                ` : ''}
            `;

            container.appendChild(div);

        });

    }

    // Estadísticas
    const totalCommentsEl =
        document.getElementById('total-comments');

    const avgRatingEl =
        document.getElementById('avg-rating');

    if (totalCommentsEl)
        totalCommentsEl.innerText = total;

    if (avgRatingEl)
        avgRatingEl.innerText =
            total > 0
                ? (sumRating / total).toFixed(1)
                : "5.0";

    // Sin comentarios
    if (total === 0) {

        container.innerHTML = `
            <div class="loading-text">
                No hay comentarios aún.
            </div>
        `;
    }

    // Sonido
    if (!isFirstLoad && total > previousCount) {

        dingSound.play()
            .catch(() =>
                console.log("Activa el audio primero.")
            );
    }

    previousCount = total;

    isFirstLoad = false;

});

// Función para censurar comentarios
function censurarComentario(texto) {
    let comentarioFiltrado = texto;
    if (window.palabrasProhibidas) {
        window.palabrasProhibidas.forEach(palabra => {
            const regex = new RegExp(palabra, 'gi');
            comentarioFiltrado = comentarioFiltrado.replace(regex, '****');
        });
    }
    return comentarioFiltrado;
}