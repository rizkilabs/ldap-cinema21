const { getAllUsers } = require('../models');
const ldap = require('ldapjs');
const ad = require('../configs');
const { ldapJsConfig } = require('../configs');
const { encodePassword } = require('../configs');
let { adPassword } = require('../configs');
const jwt = require('jsonwebtoken');
const data = require("../data/data.json")

class AdController {
  static async getUsers(req, res) {
    try {
      var groupName = 'Administrators';
      await ad.getUsersForGroup(groupName, function(err, users) {

      if (!users) {
        res.status(404).json({
          message: `Group: ${groupName} not found.`
        })
      } else {
        res.status(200).json(data);
      }
   })

  } catch (err) {
    console.log(err)
      res.status(500).json(err);
    }
  } 

  static async login(req, res) {
    try {
      const { username, password } = req.body;
      
      let usernameValue = username;
      let usernameWithDomain = usernameValue + '@' + 'dev.cinema21.co.id';
      console.log(username)
      console.log("sampai sini")
      await ad.authenticate(usernameWithDomain, password, function(err, auth) {
        if (err) {
          console.log(err, "error 1")
          res.status(500).json(err);
        } else {
          const access_token = jwt.sign({username: username}, "secret_key");
          res.status(200).json({access_token});
        }
      })
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
  
  static async updatePassword(req, res) {
    try {

      const { username, password } = req.body;
      let usernameData = username;
      let finalUsername = usernameData.replace(/\./g, ' ').toLowerCase().split(' ');
      console.log(finalUsername, "this splitStr");
      for(let i = 0; i < finalUsername.length; i++){
        finalUsername[i] = finalUsername[i].charAt(0).toUpperCase() + finalUsername[i].substring(1);     
      }

      let usernameValue = finalUsername.join(' ');

      console.log(usernameValue, "this is username value")
      
      const change = new ldap.Change({
        operation: 'replace',
        modification: {
          unicodePwd: encodePassword(req.body.password)
        }
      });

      ldapJsConfig.modify(`CN=${usernameValue},OU=Headoffice,DC=dev,DC=cinema21,DC=co,DC=id`, change, (err) => {
        if(err) {
          console.log(err)
        } else {
          adPassword = password;
          res.status(200).json({message: "Password has been changed"}) ;

        }
      })
    } catch(err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
}

module.exports = { AdController };