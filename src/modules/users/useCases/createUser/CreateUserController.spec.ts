import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;
const baseUrl = '/api/v1/users';

describe('Create user controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a new user', async () => {
    const response = await request(app).post(baseUrl).send({
      email: 'test@email.com',
      name: 'test',
      password: 'test',
    });

    expect(response.status).toBe(201);
  });

  it('should be able to create a new user that already exists', async () => {
    const response = await request(app).post(baseUrl).send({
      email: 'test@email.com',
      name: 'test',
      password: 'test',
    });

    expect(response.status).toBe(400);
  });
});
