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