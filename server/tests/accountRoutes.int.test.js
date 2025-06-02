// const request = require('supertest');
// const app = require('../index'); // или путь к вашему express app
// const { sequelize, Account, Role } = require('../models/models');
// const jwt = require('jsonwebtoken');

// let adminToken;
// let userToken;
// let adminId;
// let userId;

// beforeAll(async () => {
//   await sequelize.sync({ force: true });

//   const adminRole = await Role.create({ id: 1, name: 'ADMIN' });
//   const userRole = await Role.create({ id: 2, name: 'USER' });

//   const admin = await Account.create({
//     first_name: 'Admin',
//     last_name: 'Test',
//     login: 'admin',
//     password: 'admin123',
//     role_id: adminRole.id
//   });
//   adminId = admin.id;

//   const user = await Account.create({
//     first_name: 'User',
//     last_name: 'Test',
//     login: 'user',
//     password: 'user123',
//     role_id: userRole.id
//   });
//   userId = user.id;

//   adminToken = jwt.sign({ id: admin.id, role: 'ADMIN' }, process.env.JWT_ACCESS_SECRET);
//   userToken = jwt.sign({ id: user.id, role: 'USER' }, process.env.JWT_ACCESS_SECRET);
// });

// describe('Account routes', () => {
//   test('GET /api/accounts - only ADMIN', async () => {
//     const res = await request(app)
//       .get('/api/accounts')
//       .set('Authorization', `Bearer ${adminToken}`);
    
//     expect(res.statusCode).toBe(200);
//     expect(Array.isArray(res.body)).toBe(true);
//   });

//   test('GET /api/accounts - USER should be forbidden', async () => {
//     const res = await request(app)
//       .get('/api/accounts')
//       .set('Authorization', `Bearer ${userToken}`);
    
//     expect(res.statusCode).toBe(403);
//   });

//   test('GET /api/accounts/:id - user can get own account', async () => {
//     const res = await request(app)
//       .get(`/api/accounts/${userId}`)
//       .set('Authorization', `Bearer ${userToken}`);
    
//     expect(res.statusCode).toBe(200);
//     expect(res.body.id).toBe(userId);
//   });

//   test('POST /api/accounts - admin can create account', async () => {
//     const res = await request(app)
//       .post('/api/accounts')
//       .set('Authorization', `Bearer ${adminToken}`)
//       .send({
//         first_name: 'New',
//         last_name: 'User',
//         login: 'newuser',
//         password: 'password123',
//         role_id: 2
//       });
    
//     expect(res.statusCode).toBe(201);
//     expect(res.body.login).toBe('newuser');
//   });

//   test('PUT /api/accounts/:id - user can update self', async () => {
//     const res = await request(app)
//       .put(`/api/accounts/${userId}`)
//       .set('Authorization', `Bearer ${userToken}`)
//       .send({ first_name: 'Updated' });
    
//     expect(res.statusCode).toBe(200);
//     expect(res.body.first_name).toBe('Updated');
//   });

//   test('DELETE /api/accounts/:id - admin can delete', async () => {
//     const res = await request(app)
//       .delete(`/api/accounts/${userId}`)
//       .set('Authorization', `Bearer ${adminToken}`);
    
//     expect(res.statusCode).toBe(200);
//     expect(res.body.message).toMatch(/success/i);
//   });
// });

// afterAll(async () => {
//   await sequelize.close();
// });
