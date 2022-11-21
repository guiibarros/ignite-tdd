import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

const baseUrl = '/api/v1';

describe('Get account balance controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to get an accout balance', async () => {
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

    await request(app).post(`${baseUrl}/statements/deposit`).send({
      amount: 200,
      description: 'test deposit',
    }).set({
      authorization: `Bearer ${token}`,
    })

    await request(app).post(`${baseUrl}/statements/withdraw`).send({
      amount: 50,
      description: 'test withdraw',
    }).set({
      authorization: `Bearer ${token}`,
    })

    // Create receiver user
    const receiverResponse = await request(app).post(`${baseUrl}/users`).send({
      email: 'receiver@email.com',
      name: 'receiver',
      password: 'receiver',
    });

    const receiver_id = receiverResponse.body.id

    await request(app).post(`${baseUrl}/statements/transfer/${receiver_id}`).send({
      amount: 50,
      description: 'test withdraw',
    }).set({
      authorization: `Bearer ${token}`,
    })

    const response = await request(app).get(`${baseUrl}/statements/balance`).set({
      authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(200);
    expect(response.body.statement.length).toBe(3);
    expect(response.body.balance).toEqual(100);
  });

  it('should not be able to get an accout balance with invalid token', async () => {
    const response = await request(app).get(`{baseUrl}/statements/balance`).set({
      authorization: `Bearer 1234Invalid1234Token1234`
    });

    expect(response.status).toBe(400);
  });
});
