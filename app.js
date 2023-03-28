const express = require("express");
const app = express();
const port = 4000;
const ldap = require("ldapjs");
const routes = require("./routes");
const cors = require("cors");

/*
1. It first uses the cors middleware to allow cross-origin requests.
2. It then uses the express.json() middleware to parse JSON requests.
3. It then uses the express.urlencoded() middleware to parse URL-encoded requests.
4. Finally, it uses the routes middleware to handle requests to the /api/v1/todos route.
*/
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

