const express = require("express");
const app = express();
const port = 3000;
const ldap = require("ldapjs");
const routes = require("./routes");

app.use(routes);

app.listen(port, () => {
  console.log("Server started on port 3000");
});

