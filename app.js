/*
THE ENTRY POINT or main application file for a Node.js project.

In a Node.js application, app.js typically includes the following responsibilities:

1.Server Setup: Creating an HTTP server using the built-in http or express module to handle incoming requests and send responses.
2.Routing: Defining routes to handle different HTTP methods (GET, POST, etc.) and specifying the corresponding logic to execute when those routes are accessed.
3.Middleware Configuration: Applying middleware functions to handle tasks such as request parsing, authentication, logging, etc. Middleware functions are executed before the final request handler.
4.Database Connections: Establishing connections to databases or other external services that the application interacts with.
5.Configuration: Setting up and configuring the application, including environment variables, constants, and other settings.
*/

const express = require('express');
const app = express();
const path = require('path');

/*wrapping express inside a http server 
so we can use the express functionality*/
const http = require('http')
const server = http.createServer(app)
/*socket.io set up */
const { Server } = require('socket.io')
const io = new Server(server) 
const port = 3000;

// Middleware to parse incoming JSON requests
app.use(express.static('src'));

// Route definition
app.get('/', (req, res) => {
  res.sendFile('/Users/mac/Desktop/hopperhack/all-couped-up/src/frontend/mainMenu.html');
});

//receive connection from frontend 
io.on('connection', (socket) => {
    console.log('a user has connected')
})

// Start the server
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

console.log('server is loaded')
