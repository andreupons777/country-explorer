const http = require('http');
// Importar la función handleRequest desde controller.js
const { handleRequest } = require('./controller');

const PORT = 3000;

// Crear el servidor usando handleRequest como callback
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});