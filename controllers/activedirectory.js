const { getAllUsers } = require('../models');
const ad = require('../configs');

class AdController {
  static async getUsers(req, res) {
    try {
      var groupName = 'Administrators';
      await ad.getUsersForGroup(groupName, function(err, users) {
      if (err) {
        console.log('ERROR: ' +JSON.stringify(err));
        return;
      }

      if (! users) console.log('Group: ' + groupName + ' not found.');
      else {
        res.status(200).json(users);
      }
   })
  } catch (err) {
      res.status(500).json(err);
    }
  } 
}

module.exports = { AdController };