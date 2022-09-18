import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';

import createConnection from '../../../../database';

let connection: Connection;

const baseUrl = '/api/v1';

describe('Create a statement controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a new deposit statement', async () => {
    const user = {
      email: 'test@email.com',
      name: 'test',
      password: 'test',
    };

    await request(app).post(`${baseUrl}/users`).send(user);

    const authResponse = await request(app).post(`${baseUrl}/sessions`).send({
      email: user.email,
      password: user.password,
    });

    const { token } = authResponse.body;

    const response = await request(app).post(`${baseUrl}/statements/deposit`).send({
      amount: 100,
      description: 'test deposit'
    }).set({
      authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.description).toBe('test deposit');
  });

  it('should be able to create a new withdraw statement', async () => {
    const authResponse = await request(app).post(`${baseUrl}/sessions`).send({
      email: 'test@email.com',
      password: 'test',
    });

    const { token } = authResponse.body;

    const response = await request(app).post(`${baseUrl}/statements/withdraw`).send({
      amount: 50,
      description: 'test withdraw'
    }).set({
      authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.description).toBe('test withdraw');
  });

  it('should not be able to create a new statement with invalid token', async () => {
    const response = await request(app).post(`${baseUrl}/statements/deposit`).send({
      amount: 150,
      description: 'test deposit'
    }).set({
      authorization: 'Bearer 1234Invalid1234Token1234'
    });

    expect(response.status).toBe(401);
  });

  it('should not be able to create a new withdraw statement with insufficient funds', async () => {
    const authResponse = await request(app).post(`${baseUrl}/sessions`).send({
      email: 'test@email.com',
      password: 'test',
    });

    const { token } = authResponse.body;

    const response = await request(app).post(`${baseUrl}/statements/withdraw`).send({
      amount: 200,
      description: 'test withdraw'
    }).set({
      authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Insufficient funds')
  });
});
