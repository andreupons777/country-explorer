const fs = require('fs');
const path = require('path');
const countriesService = require('./countries-services');

// 1. Función para manejar las solicitudes de rutas
async function handleRequest(req, res) {
    // Ruta de la API: devuelve los países en formato JSON
    if (req.url === "/countries") {
        try {
            const countries = await countriesService.getAllCountries();
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(countries));
        } catch (error) {
            console.error("Error fetching countries:", error.message);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to fetch countries" }));
        }
        return;
    }

    let filePath = "." + req.url;

    if (filePath === "./") {
        filePath = "./index.html";
    } else if (filePath.startsWith("./detail.html")) {
        filePath = "./detail.html";
    }

    let extname = path.extname(filePath);

    if (extname) {
        readAndServe(filePath, extname, res);
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
}

// 2. Función getContentType basada en la tabla del curso
function getContentType(extname) {
    let contentType = "";

    switch (extname) {
        case ".html":
            contentType = "text/html";
            break;
        case ".js":
            contentType = "text/javascript";
            break;
        case ".css":
            contentType = "text/css";
            break;
        case ".png":
            contentType = "image/png";
            break;
        case ".svg":
            contentType = "image/svg+xml";
            break;
        case ".json":
            contentType = "application/json";
            break;
        default:
            contentType = "text/html";
            break;
    }

    return contentType;
}

// 3. Función readAndServe con decodificación y verificación de existencia
function readAndServe(filePath, extname, res) {
    // Decodifica la ruta para manejar nombres con espacios
    filePath = decodeURIComponent(filePath);

    // Si el archivo no existe, responde con un 404
    if (!fs.existsSync(filePath)) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("File not found");
        return;
    }

    // Lee el contenido del archivo de forma asíncrona
    fs.readFile(filePath, function (error, content) {
        if (error) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Server error: " + error.code);
        } else {
            let contentType = getContentType(extname);
            res.writeHead(200, { "Content-Type": contentType });
            res.end(content);
        }
    });
}

// 4. Exportar la función handleRequest para que server.js pueda usarla
module.exports = { handleRequest };