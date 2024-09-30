const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');

async function createAdminUser() {
  let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
  user.name = Math.random().toString(36).substring(2, 12);
  user.email = user.name + '@admin.com';

  await DB.addUser(user);
  user.password = 'toomanysecrets';
  const loginRes = await request(app).put('/api/auth').send(user);
  return [user, loginRes.body.token];
}

let franchiseName;
let admin;
let adminID;
let adminToken;
let testUser;
let testUserAuthToken;
let franchiseID;

beforeAll(async () => {
  testUser = {name: 'dude', password: 'ahdfasf'};
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = registerRes.body.token;
});

beforeEach(async () => {
  franchiseName = Math.random().toString(36).substring(2, 12);
  const ret = await createAdminUser();
  admin = ret[0];
  adminToken = ret[1];
  adminID = (await DB.getUser(admin.email, admin.password)).id;

  franchiseID = (await request(app).post('/api/franchise')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({name: Math.random().toString(36).substring(2, 12), admins: [{email: admin.email}]})).body.id;
});

test('create franchise', async () => {
  const createRes = await request(app).post('/api/franchise')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({name: franchiseName, admins: [{email: admin.email}]})
  
  expect(createRes.status).toBe(200);
})

test('create franchise unauthorized', async () => {
  const createRes = await request(app).post('/api/franchise')
    .set('Authorization', `Bearer ${testUserAuthToken}`)
    .send({name: franchiseName, admins: [{email: testUser.email}]})
  
  expect(createRes.status).toBe(403);
})

test('get franchises', async () => {
  let getRes = await request(app).get('/api/franchise');
  expect(getRes.status).toBe(200);
  expect(getRes.body.length).toBeGreaterThan(0);
})

test('get user franchises', async () => {
  const getRes = await request(app).get(`/api/franchise/${adminID}`).set('Authorization', `Bearer ${adminToken}`);

  expect(getRes.status).toBe(200);
  expect(getRes.body.length).toBe(1)
})

test('delete franchise', async () => {
  const deleteRes = await request(app).delete(`/api/franchise/${franchiseID}`).set('Authorization', `Bearer ${adminToken}`);

  expect(deleteRes.status).toBe(200);
  const getRes = await request(app).get(`/api/franchise/${adminID}`).set('Authorization', `Bearer ${adminToken}`);
  expect(getRes.body.length).toBe(0);
})

test('delete franchise unauthorized', async () => {
  const deleteRes = await request(app).delete('/api/franchise/3')
    .set('Authorization', `Bearer ${testUserAuthToken}`);

  expect(deleteRes.status).toBe(403);
})

test('create store', async () => {
  const createRes = await request(app).post(`/api/franchise/${franchiseID}/store`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({franchiseID: franchiseID, name: 'pizza store'});

  expect(createRes.status).toBe(200);

  expect((await request(app).get(`/api/franchise/${adminID}`)
    .set('Authorization', `Bearer ${adminToken}`))
    .body[0].stores.length).toBe(1);
})

test('create store unauthorized', async () => {
  const createRes = await request(app).post(`/api/franchise/${franchiseID}/store`)
    .set('Authorization', `Bearer ${testUserAuthToken}`)
    .send({franchiseID: franchiseID, name: 'pizza store'});;

  expect(createRes.status).toBe(403);
})