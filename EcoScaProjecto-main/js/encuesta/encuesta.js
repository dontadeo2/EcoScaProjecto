document.getElementById("form-encuesta").onsubmit = function (e) {
    e.preventDefault();

    let selects = document.querySelectorAll("#form-encuesta select");
    let numero = document.querySelector("#form-encuesta input");

    database.ref("encuestas").push({
        p1: selects[0].value,
        p2: selects[1].value,
        p3: selects[2].value,
        p4: selects[3].value,
        p5: selects[4].value,
        p6: selects[5].value,
        p7: selects[6].value,
        p8: numero.value
    });

    alert("Encuesta enviada correctamente");
    this.reset();
};