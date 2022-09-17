import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Authenticate an user', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to authenticate an user', async () => {
    const user: ICreateUserDTO = {
      email: 'test@email.com',
      name: 'test',
      password: 'test',
    };

    await createUserUseCase.execute(user);

    const authData = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(authData).toHaveProperty('token');
  });

  it('should not be able to authenticate an user with invalid email or password', async () => {
    await expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'invalid@email.com',
        password: 'invalid'
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  });
});
