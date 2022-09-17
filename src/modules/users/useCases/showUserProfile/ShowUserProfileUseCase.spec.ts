import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('List user profile', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to list an user profile', async () => {
    const { id } = await createUserUseCase.execute({
      email: 'test@email.com',
      name: 'test',
      password: 'test',
    });

    const user = await showUserProfileUseCase.execute(id!);

    expect(user).toHaveProperty('id');
  });

  it('should not be able to list an inexistent user', async () => {
    await expect(async () => {
      await showUserProfileUseCase.execute('invalidId');
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  })
});
