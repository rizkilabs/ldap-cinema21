const ActiveDirectory = require("activedirectory");
const ldap = require("ldapjs");
const userPassword = require("../data/user.json");

let adPassword = "";

const config = {
  url: "ldaps://pmdomainap01d.dev.cinema21.co.id:636",
  baseDN: "DC=dev,DC=cinema21,DC=co,DC=id",
  username: "Rizki Testing",
  password: adPassword === "" ? userPassword.password : adPassword,
  tlsOptions: {
    rejectUnauthorized: false,
  },
};

console.log(config.password, "this is adPassw0rd");
let ldapJsConfig = ldap.createClient({
  url: config.url,
  tlsOptions: config.tlsOptions,
});

ldapJsConfig.bind(
  "rizki.testing@dev.cinema21.co.id",
  config.password,
  function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected");
    }
  }
);

function encodePassword(password) {
  return Buffer.from('"' + password + '"', "utf16le").toString();
}

let ad = new ActiveDirectory(config);

module.exports = { ad, ldapJsConfig, adPassword, encodePassword };
