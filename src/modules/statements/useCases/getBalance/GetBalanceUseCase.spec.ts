import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe('Get account balance', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );

    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository,
    );
  });

  it('should be able to get an accout balance', async () => {
    const { id } = await createUserUseCase.execute({
      email: 'test@email.com',
      name: 'test',
      password: 'test',
    });

    const user_id = id as string;

    enum OperationType {
      DEPOSIT = 'deposit',
      WITHDRAW = 'withdraw',
    };

    await createStatementUseCase.execute({
      user_id,
      amount: 100,
      description: 'test',
      type: OperationType.DEPOSIT,
    });

    await createStatementUseCase.execute({
      user_id,
      amount: 50,
      description: 'test',
      type: OperationType.WITHDRAW,
    });

    const result = await getBalanceUseCase.execute({ user_id });

    expect(result.statement.length).toBe(2);
    expect(result.balance).toEqual(50);
  });

  it('should not be able to get an inexistent accout balance', async () => {
    await expect(async () => {
      await getBalanceUseCase.execute({
        user_id: 'invalidId'
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
