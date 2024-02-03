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
const port = 3000;

// Middleware to parse incoming JSON requests
app.use(express.static('public'));

// Route definition
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

