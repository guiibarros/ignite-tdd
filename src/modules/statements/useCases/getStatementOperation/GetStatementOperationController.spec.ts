import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

const baseUrl = '/api/v1';

let connection: Connection;

describe('Get account statement operation controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able to get a statement operation from an account', async () => {
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

    const statementResponse = await request(app).post(`${baseUrl}/statements/deposit`).send({
      amount: 100,
      description: 'test deposit'
    }).set({
      authorization: `Bearer ${token}`
    });

    const { id } = statementResponse.body;

    const response = await request(app).get(`${baseUrl}/statements/${id}`).set({
      authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });

  it('should not be able to get a statement operation from an account with invalid token', async () => {
    const authResponse = await request(app).post(`${baseUrl}/sessions`).send({
      email: 'test@email.com',
      password: 'test',
    });

    const { token } = authResponse.body;

    const statementResponse = await request(app).post(`${baseUrl}/statements/deposit`).send({
      amount: 100,
      description: 'test deposit'
    }).set({
      authorization: `Bearer ${token}`
    });

    const { id } = statementResponse.body;

    const response = await request(app).get(`${baseUrl}/statements/${id}`).set({
      authorization: 'Bearer 1234Invalid1234Token1234',
    });

    expect(response.status).toBe(401);
  });

  it('should not be able to get an inexistent statement operation form an account', async () => {
    const authResponse = await request(app).post(`${baseUrl}/sessions`).send({
      email: 'test@email.com',
      password: 'test',
    });

    const { token } = authResponse.body;

    const response = await request(app).get(`${baseUrl}/statements/854cf4a5-71a5-44fb-b94b-05a7b798b70e`).set({
      authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(404);
  });
});
