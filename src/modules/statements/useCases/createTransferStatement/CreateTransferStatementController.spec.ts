import request from 'supertest';
import { Connection } from "typeorm";
import { app } from '../../../../app';

import createConnection from '../../../../database';

let connection: Connection;

const baseUrl = '/api/v1'

let receiver_id: string;
let token: string;

describe('Create a transfer statement controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    // Create sender and receiver users
    await request(app).post(`${baseUrl}/users`)
      .send({
        email: 'sender@email.com',
        name: 'sender',
        password: 'sender',
      });

    const { body: receiver } = await request(app).post(`${baseUrl}/users`)
      .send({
        email: 'receiver@email.com',
        name: 'receiver',
        password: 'receiver',
      });

    receiver_id = receiver.id;

    // Authenticate sender user
    const { body: authBody } = await request(app).post(`${baseUrl}/sessions`).send({
      email: 'sender@email.com',
      password: 'sender',
    });

    token = authBody.token;
  });

  it('should be able to create a new transfer statement', async () => {
    // Create deposit transaction on sender user to be able to make transfer
    await request(app).post(`${baseUrl}/statements/deposit`).send({
      amount: 100,
      description: 'deposit test',
    }).set({
      authorization: `Bearer ${token}`
    })

    // Make transfer transaction
    const response = await request(app)
      .post(`${baseUrl}/statements/transfer/${receiver_id}`)
      .send({
        amount: 50,
        description: 'transfer test',
      }).set({
        authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.description).toEqual('transfer test');
  });

  it('should not be able to create a new transfer statement with invalid token', async () => {
    const response = await request(app)
      .post(`${baseUrl}/statements/transfer/${receiver_id}`)
      .send({
        amount: 50,
        description: 'transfer test'
      }).set({
        authorization: 'Bearer 1234Invalid1234Token1234'
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('JWT invalid token!');
  });

  it('should not be able to create a new transfer statement with insufficient funds', async () => {
    const response = await request(app)
      .post(`${baseUrl}/statements/transfer/${receiver_id}`)
      .send({
        amount: 200,
        description: 'transfer test'
      }).set({
        authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Insufficient funds')
  });

  it('should not be able to create a new transfer statement to an inexistent receiver user', async () => {
    const response = await request(app)
      .post(`${baseUrl}/statements/transfer/a5509d23-2bbf-4183-91d4-27367c714247`)
      .send({
        amount: 50,
        description: 'transfer test'
      }).set({
        authorization: `Bearer ${token}`
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
});
