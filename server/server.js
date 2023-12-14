let server;
const app = require('../index');
let port = parseInt(process.env.PORT, 10) || 3000;

app
  .listen(port, () => {
    console.log(`Server is running on port ${server.address().port}`);
  })
  .on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is already in use. Trying another port...`);
      port += 1;

      server.close(() => {
        startServer(app);
      });
    } else {
      console.error(err);
    }
  });

process.on('uncaughtException', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('No available ports to use.');
    process.exit(1);
  }
});

process.on('SIGINT', () => {
  console.log('Received SIGINT signal. Closing server...');
  closeServer();
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal. Closing server...');
  closeServer();
});

process.on('exit', () => {
  console.log('Exiting process. Closing server...');
  closeServer();
});

function closeServer() {
  if (server) {
    server.close((err) => {
      if (err) {
        console.error('Error closing server:', err);
      } else {
        console.log('Server closed.');
      }

      process.exit(0);
    });
  } else {
    console.log('Server not started or already closed.');
    process.exit(0);
  }
}
