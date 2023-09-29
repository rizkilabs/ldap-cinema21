const express = require("express");
const app = express();
const port = 4000;
const ldap = require("ldapjs");
const routes = require("./routes");
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

