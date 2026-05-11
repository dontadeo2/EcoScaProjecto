window.palabrasProhibidas = [
    "puta",
    "mierda",
    "idiota",
    "imbecil",
    "porno",
    "sexo",
    "estupido",
    "gilipollas",
    "pendejo",
    "cabrón",
    "zorra",
    "maricón",
    "coño",
    "maldito",
    "hijo de puta",
    "polla",
    "culero",
    "verga",
    "chinga",
    "chingada",
    "chingar",
    "pendeja",
    "puto",
    "puta madre",
    "hijo de la gran puta",
    "Rosa melano",
    "ayer singe",
    "caca",
    "culo",
    "pene",
    "vagina",
    "teta",
    "tetas",
    "pija",
    "pene",
    "coger",
    "follar",
    "joder",
    "jodido",
    "jodida",
    "cojones",
    "hostia",
    "hostias",
    "carajo",
    "malparido",
    "malparida",


];

// Función para detectar palabras prohibidas
function contienePalabrasProhibidas(texto) {
    texto = texto.toLowerCase();

    return palabrasProhibidas.some(palabra =>
        texto.includes(palabra)
    );
}


// 🔥 Censurar palabras automáticamente
    let comentarioFiltrado = text;

    palabrasProhibidas.forEach(palabra => {
        const regex = new RegExp(palabra, 'gi');
        comentarioFiltrado = comentarioFiltrado.replace(regex, '****');
    });


    return comentarioFiltrado;
