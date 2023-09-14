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

      
      const filePath = path.join(__dirname, '..', 'data', 'user.json');
      const data = fs.readFileSync(filePath, 'utf8');
      const user = JSON.parse(data);
      user.password = password;
      const newLog = fs.writeFileSync(filePath, JSON.stringify(user));

      if(userPassword.username !== username) {
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
          res.status(401).json({
            message: "Username or password is wrong",
          });
        } else {
          // let opts = {
          //   filter: "(sAMAccountName=" + username + ")",
          //   scope: "sub",
          // };

          // ad.getGroupMembershipForUser(opts, "rizki.testing", function (err, groups) {
          //   if (err) {
          //     console.log(err);
          //   } else {
          //     console.log("this is users" + JSON.stringify(groups));
          //   }
          // })

          let testUsername = "rizki.testing";
          let splitTestUsername = testUsername.split(".");
          let capitalizeUsername = splitTestUsername.map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          })
          let resultUsername = capitalizeUsername.join(" ");

          ldapJsConfig.search(`CN=${resultUsername},OU=HeadOffice,DC=dev,DC=cinema21,DC=co,DC=id`, function (err, res) {
            if (err) {
              console.log(err);
            } else {
              // res.on("searchRequest", function (req) {
              //   console.log("tes");
              // });
              res.on("searchEntry", function (entry) {
                console.log(entry.object);
              });
              
              ldapJsConfig.on("error", (err) => {
                console.log("LDAP Connection failed, but fear not, it will reconnect OK", err);
              })
            } 
          })

          const filePath = path.join(__dirname, '..', 'data', 'user.json');
          const data = fs.readFileSync(filePath, 'utf8');
          const user = JSON.parse(data);
          user.currentPassword = password;
          const newCurrentPassword = fs.writeFileSync(filePath, JSON.stringify(user));
          const access_token = jwt.sign({ username: username }, "secret_key");
          res.status(200).json({ access_token });
        }
      });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  static async updatePassword(req, res) {
    try {
      const { username, password, currentPassword } = req.body;
      const userClass = new AdController();
      userClass.username = username;
      userClass.password = password;

      const filePath = path.join(__dirname, '..', 'data', 'user.json');
      let data = fs.readFileSync(filePath, 'utf8');      
        const user = JSON.parse(data);

      

      if(user.currentPassword !== currentPassword) {
        res.status(401).json({
          message: "Current password is wrong",
        });
        return;
      } else {
        let data = fs.readFileSync(filePath, 'utf8');      
        const user = JSON.parse(data);
        const newPassword = password;
        user.password = newPassword;
        user.currentPassword = newPassword;
        fs.writeFileSync(filePath, JSON.stringify(user));
      }

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
          }
        }
      )
    } catch (err) {
      console.log(err.message);
      res.status(500).json(err);
    }
  }

}

module.exports = { AdController };
