const fs = require('fs');
const csv = require('csv-parser');

const resultados = [];

// Algoritmo matemático real (Módulo 11) para validar RUCs en Perú
function validarRucSunat(ruc) {
    if (!ruc || typeof ruc !== 'string' || ruc.length !== 11) return false;
    
    // Verificar que solo sean números
    if (!/^\d+$/.test(ruc)) return false;

    const prefix = ruc.substring(0, 2);
    // Validar prefijos válidos en Perú (10: Persona Natural, 15/17: Otros, 20: Persona Jurídica)
    if (!['10', '15', '17', '20'].includes(prefix)) return false;

    // Factores de ponderación para Módulo 11
    const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;

    for (let i = 0; i < 10; i++) {
        suma += parseInt(ruc.charAt(i), 10) * factores[i];
    }

    const residuo = suma % 11;
    let digitoVerificador = 11 - residuo;

    if (digitoVerificador === 10) digitoVerificador = 0;
    else if (digitoVerificador === 11) digitoVerificador = 1;

    const ultimoDigito = parseInt(ruc.charAt(10), 10);

    return digitoVerificador === ultimoDigito;
}

fs.createReadStream('proveedores.csv')
    .pipe(csv())
    .on('data', (row) => {
        const esValido = validarRucSunat(row.ruc);
        resultados.push({
            ruc: row.ruc,
            razon_social: row.razon_social,
            estado_validacion: esValido ? 'RUC VÁLIDO (MATEMÁTICAMENTE)' : 'RUC INVÁLIDO O FALSO'
        });
    })
    .on('end', () => {
        console.log('--- REPORTE DE VALIDACIÓN AVANZADA ---');
        console.table(resultados);
        
        fs.writeFileSync('reporte_validacion.json', JSON.stringify(resultados, null, 2));
        console.log('Reporte actualizado en reporte_validacion.json');
    });