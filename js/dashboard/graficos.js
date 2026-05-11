let chart; // evitar duplicados

database.ref("encuestas").on("value", snapshot => {
    let data = snapshot.val();

    if (!data) return;

    let si = 0;
    let no = 0;
    let otros = 0;

    for (let id in data) {
        if (data[id].p1 === "Si") si++;
        else if (data[id].p1 === "No") no++;
        else otros++;
    }

    const ctx = document.getElementById("grafico");

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Sí", "No", "No recuerda"],
            datasets: [{
                label: "Experiencias negativas",
                data: [si, no, otros]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
});

let chart2;
let chart3;

database.ref("encuestas").on("value", snapshot => {
    let data = snapshot.val();
    if (!data) return;

    // =====================
    // 📊 PREGUNTA 3
    // =====================
    let encanta = 0, util = 0, indiferente = 0;

    // =====================
    // 📊 PREGUNTA 8
    // =====================
    let valores = [0, 0, 0, 0, 0];

    for (let id in data) {

        // P3
        if (data[id].p3 === "Me encantaría") encanta++;
        else if (data[id].p3 === "Sería útil") util++;
        else indiferente++;

        // P8
        let v = parseInt(data[id].p8);
        if (v >= 1 && v <= 5) valores[v - 1]++;
    }

    // =====================
    // 📊 GRÁFICO 2
    // =====================
    const ctx2 = document.getElementById("grafico2");
    if (chart2) chart2.destroy();

    chart2 = new Chart(ctx2, {
        type: "bar",
        data: {
            labels: ["Me encantaría", "Sería útil", "Indiferente"],
            datasets: [{
                label: "Actitud ante QR",
                data: [encanta, util, indiferente],
                backgroundColor: [
                    "rgba(54, 162, 235, 0.7)",
                    "rgba(75, 192, 192, 0.7)",
                    "rgba(255, 205, 86, 0.7)"
                ],
                borderColor: [
                    "rgba(54, 162, 235, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(255, 205, 86, 1)"
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    // =====================
    // 📊 GRÁFICO 3
    // =====================
    const ctx3 = document.getElementById("grafico3");
    if (chart3) chart3.destroy();

    chart3 = new Chart(ctx3, {
        type: "bar",
        data: {
            labels: ["1", "2", "3", "4", "5"],
            datasets: [{
                label: "Importancia",
                data: valores
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

});