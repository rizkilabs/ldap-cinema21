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

  console.log(allUsers, "this is all users")
}


// class ActiveDirectory {
//   static async getUsers() {
//     try {
//       var groupName = 'Administrators';
//       const users = await ad.getUsersForGroup(groupName, function(err, users) {
//         if (err) {
//           console.log('ERROR: ' +JSON.stringify(err));
//           return;
//         }
       
//         if (! users) console.log('Group: ' + groupName + ' not found.');
//         else {
//           console.log(users, "test")
//         }
//       });
//       return users;
//     } catch (err) {
//       return err;
//     }
//   }
// }

module.exports = { getAllUsers };



