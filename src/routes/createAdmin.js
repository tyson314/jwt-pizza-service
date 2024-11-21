const { Role, DB } = require('../database/database.js');

export async function createAdminUser() {
  let user = { password: 'a', roles: [{ role: Role.Admin }] };
  user.name = 'dude';
  user.email = user.name + '@admin.com';

  user = await DB.addUser(user);
  return { ...user, password: 'toomanysecrets' };
}

createAdminUser()

async function createStore() {

}