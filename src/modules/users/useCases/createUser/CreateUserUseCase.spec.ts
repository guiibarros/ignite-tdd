import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create a new user', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it('should be able to create a new user', async () => {
    const user = await createUserUseCase.execute({
      email: 'test@email.com',
      name: 'test',
      password: 'test',
    });

    expect(user).toHaveProperty('id');
  });

  it('should not be able to create an user that already exists', async () => {
    await expect(async () => {
      const user: ICreateUserDTO = {
        email: 'test@email.com',
        name: 'test',
        password: 'test',
      };

      await createUserUseCase.execute(user);
      await createUserUseCase.execute(user);
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
