const mariadb = require('mariadb');
const db = mariadb.createPool({
  host: "svc.sel5.cloudtype.app",
  user: "root",
  password: "123456789@@",
  database: "shop",
  port: 30044,
});

module.exports = db;
