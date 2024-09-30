const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');
async function createAdminUser() {
  
  let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
  user.name = Math.random().toString(36).substring(2, 12);
  user.email = user.name + '@admin.com';

  const registerRes = await request(app).post('/api/auth').send(user);
  return [user, registerRes.body.token];
}

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
let testUserAuthToken;

beforeAll(async () => {
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = registerRes.body.token;
});

test('login', async () => {
  const loginRes = await request(app).put('/api/auth').send(testUser);
  expect(loginRes.status).toBe(200);
  expect(loginRes.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);

  const { password, ...user } = { ...testUser, roles: [{ role: 'diner' }] };
  expect(loginRes.body.user).toMatchObject(user);
  expect(password).toBeTruthy();
});

test('invalid login rejected', async () => {
  const loginRes1 = await request(app).put('/api/auth').send({name: 'dude', email: 'man@test.com', password: 'a' });
  expect(loginRes1.status).toBe(404);
})

test('register a new user', async () => {
  const registerRes = await request(app).post('/api/auth').send(testUser);
  expect(registerRes.status).toBe(200);
  expect(registerRes.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);

  const { password, ...user } = { ...testUser, roles: [{ role: 'diner' }] };
  expect(registerRes.body.user).toMatchObject(user);
  expect(password).toBeTruthy();
})

test('register an invalid user', async () => {
  testUser.name = null;
  const registerRes1 = await request(app).post('/api/auth').send(testUser);
  expect(registerRes1.status).toBe(400);

  testUser.name = 'john';
  testUser.email = null;
  const registerRes2 = await request(app).post('/api/auth').send(testUser);
  expect(registerRes2.status).toBe(400);

  testUser.email = 'test@test.com';
  testUser.password = null;
  const registerRes3 = await request(app).post('/api/auth').send(testUser);
  expect(registerRes3.status).toBe(400);
})

test('update user unauthorized', async () => {
  const updateRes = await request(app).put('/api/auth/1').set('Authorization', `Bearer ${testUserAuthToken}`).send({email:"a@jwt.com", password:"admin"});
  expect(updateRes.status).toBe(403);
})

test('update user', async () => {
  const ret = await createAdminUser();
  const admin = ret[0];
  const adminToken = ret[1];

  const adminID = (await DB.getUser(admin.email, admin.password)).id;
  const newLoginInfo = {email: 'hello@test.com', password: 'hello'};
  
  const updateRes = await request(app).put(`/api/auth/${adminID}`).set('Authorization', `Bearer ${adminToken}`).send(newLoginInfo);

  expect(updateRes.status).toBe(200);
  expect((await request(app).put('/api/auth').send(newLoginInfo)).status).toBe(200);
})

test('delete', async () => {
  const deleteRes = await request(app).delete('/api/auth').set('Authorization', `Bearer ${testUserAuthToken}`);
  expect(deleteRes.status).toBe(200);
  
  expect(await DB.isLoggedIn(testUserAuthToken)).toBeFalsy();
})