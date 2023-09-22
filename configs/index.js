const ActiveDirectory = require("activedirectory");
const ldap = require("ldapjs");
const userPassword = require("../data/user.json");

let adPassword = "";

const config = {
  url: "ldaps://pmdomainap01d.dev.cinema21.co.id:636",
  baseDN: "DC=dev,DC=cinema21,DC=co,DC=id",
  username: "Rio Testing",
  //password: adPassword === "" ? userPassword.password : adPassword,
  password: "TestP@ssw0rd",
  tlsOptions: {
    rejectUnauthorized: false,
  },
};

let ldapJsConfig = ldap.createClient({
  url: config.url,
  tlsOptions: config.tlsOptions,
  reconnect: true,
});

ldapJsConfig.on("error", (err) => {
  console.log("LDAP Connection failed, but fear not, it will reconnect OK", err);
})

ldapJsConfig.bind(
  "rio.testing@dev.cinema21.co.id",
  config.password,
  function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected");
    }
  }
);

ldapJsConfig.on("error", (err) => {
  console.log("LDAP Connection failed, but fear not, it will reconnect OK", err);
})

function encodePassword(password) {
  return Buffer.from('"' + password + '"', "utf16le").toString();
}

let ad = new ActiveDirectory(config);

function bufferToHex(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), (x) => ('00' + x.toString(16)).slice(-2)).join('');
}

module.exports = { ad, ldapJsConfig, adPassword, encodePassword, bufferToHex };
