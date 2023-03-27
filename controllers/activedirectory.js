const { getAllUsers } = require("../models");
const ldap = require("ldapjs");
const { ad, setPassword } = require("../configs");
const { ldapJsConfig } = require("../configs");
const { encodePassword } = require("../configs");
let { adPassword } = require("../configs");
const jwt = require("jsonwebtoken");
const data = require("../data/data.json");
const userPassword = require("../data/user.json");
const fs = require("fs");
const path = require("path");

class AdController {

  constructor(username, password) {
    this.username = username;
    this.password = password;
  }

  static async getUsers(req, res) {
    try {
      var groupName = "Administrators";
      await ad.getUsersForGroup(groupName, function (err, users) {
        if (!users) {
          res.status(404).json({
            message: `Group: ${groupName} not found.`,
          });
        } else {
          res.status(200).json(users);
        }
      });
    } catch (err) {
      console.log(err.message);
      res.status(500).json(err);
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;


      if(userPassword.log === 1 && userPassword.username === username) {
        if(password !== userPassword.password) {
          res.status(401).json({
            message: "Username or password is wrong",
          });
          return;
        }
      }

      if(userPassword.log === 0 && userPassword.username === username) {
        const filePath = path.join(__dirname, '..', 'data', 'user.json');
        const data = fs.readFileSync(filePath, 'utf8');
        const user = JSON.parse(data);
        user.log = 1;
        const newLog = fs.writeFileSync(filePath, JSON.stringify(user));
      }

      

      if(userPassword.username !== username) {
        // change log to 0
        const filePath = path.join(__dirname, '..', 'data', 'user.json');
        const data = fs.readFileSync(filePath, 'utf8');
        const user = JSON.parse(data);
        user.username = username;
        user.log = 0;
        const newLog = fs.writeFileSync(filePath, JSON.stringify(user));
        
      }
        
      let usernameValue = username;
      let usernameWithDomain = usernameValue + "@" + "dev.cinema21.co.id";
      await ad.authenticate(usernameWithDomain, password, function (err, auth) {
        if (err) {
          console.log(err.message);
          res.status(401).json({
            message: "Username or password is wrong",
          });
        } else {
          const access_token = jwt.sign({ username: username }, "secret_key");
          res.status(200).json({ access_token });
        }
      });
    } catch (err) {
      console.log(err.message);
      res.status(500).json(err);
    }
  }

  static async updatePassword(req, res) {
    try {
      const { username, password } = req.body;
      const userClass = new AdController();
      userClass.username = username;
      userClass.password = password;


      const filePath = path.join(__dirname, '..', 'data', 'user.json');

      let data = fs.readFileSync(filePath, 'utf8');      
      const user = JSON.parse(data);
      
      const newPassword = password;

      user.password = newPassword;
      // user.log = 0;
      fs.writeFileSync(filePath, JSON.stringify(user));

      let usernameData = username;
      let finalUsername = usernameData
        .replace(/\./g, " ")
        .toLowerCase()
        .split(" ");
      for (let i = 0; i < finalUsername.length; i++) {
        finalUsername[i] =
          finalUsername[i].charAt(0).toUpperCase() +
          finalUsername[i].substring(1);
      }

      let usernameValue = finalUsername.join(" ");

      let change;
      for (let i = 0; i <= 2; i++) {
        change = new ldap.Change({
          operation: "replace",
          modification: {
            unicodePwd: encodePassword(password),
          },
        });
      }

      ldapJsConfig.modify(
        `CN=${usernameValue},OU=Headoffice,DC=dev,DC=cinema21,DC=co,DC=id`,
        change,
        (err) => {
          if (err) {
            console.log(err.message);
          } else {
            adPassword = password;
            res.status(200).json({ message: "Password has been changed" });
            // restart server
          }
        }
      )

      // setPassword(usernameValue, password);
      // res.status(200).json({ message: "Password has been changed" });
    } catch (err) {
      console.log(err.message);
      res.status(500).json(err);
    }
  }

}

module.exports = { AdController };
