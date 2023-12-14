const express = require('express');
const router = require('./routers');
const dotenv = require('dotenv');

const app = express();

dotenv.config();

let port = process.env.PORT || 3000;

function startServer() {
  const server = app
    .listen(port, () => {
      console.log(`Server is running on port ${server.address().port}`);
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is already in use. Trying another port...`);
        port += 1; // Menggunakan port berikutnya

        // Periksa apakah port melebihi batas maksimum
        if (port > 65535) {
          console.error('No available ports to use.');
          process.exit(1);
        }

        // Tutup server saat ini dan coba lagi dengan port baru
        server.close(() => {
          startServer();
        });
      } else {
        console.error(err);
      }
    });
}

startServer();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(router);

module.exports = app;
