const ad = require('../configs')

let getAllUsers = async () => {
  var groupName = 'Administrators';
  let thisUses;
  const allUsers = await ad.getUsersForGroup(groupName, function(err, users) {
    if (err) {
      console.log('ERROR: ' +JSON.stringify(err));
      return;
    }

    
    
    if (! users) console.log('Group: ' + groupName + ' not found.');
    else {
      if(users) {
        thisUses = users;
      } else {
        console.log('No members in group: ' + groupName);
      }
    }
  })
}

module.exports = { getAllUsers };



