const {
  port, env,
} = require('./config');

const server = require('./server');
const database = require('./database');

database.connect();

server.listen(port, () => {
  console.info(`Server started on port ${port} (${env})`);
});

const src = server;

module.exports = src;
