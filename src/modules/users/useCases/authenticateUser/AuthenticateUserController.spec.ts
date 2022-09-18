import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

const baseUrl = '/api/v1';

describe('Authenticate user controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to authenticate an user', async () => {
    const user = {
      email: 'test@email.com',
      name: 'test',
      password: 'test',
    };

    await request(app).post(`${baseUrl}/users`).send(user);

    const response = await request(app).post(`${baseUrl}/sessions`).send({
      email: user.email,
      password: user.password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should not be able to authenticate a non-existent user', async () => {
    const response = await request(app).post(`${baseUrl}/sessions`).send({
      email: 'invalidUserEmail',
      password: 'test',
    });

    expect(response.status).toBe(401);
  });

  it('should not be able to authenticate an user with incorrect password', async () => {
    const response = await request(app).post(`${baseUrl}/sessions`).send({
      email: 'test@email.com',
      password: 'incorrectUserPassword',
    });

    expect(response.status).toBe(401);
  });
});
