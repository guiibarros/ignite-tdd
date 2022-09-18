import { Connection } from "typeorm";
import request from 'supertest';

import createConnection from '../../../../database';
import { app } from "../../../../app";

let connection: Connection;

const baseUrl = '/api/v1';

describe('Show user profile controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to show an user profile', async () => {
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

    const response = await request(app).get(`${baseUrl}/profile`).set({
      authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });

  it('should not be able to list an user with invalid token', async () => {
    const response = await request(app).get(`${baseUrl}/profile`).set({
      authorization: 'Bearer 1234Invalid1234Token1234',
    });

    expect(response.status).toBe(401);
  });
});
