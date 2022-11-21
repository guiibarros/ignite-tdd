import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { CreateTransferStatementUseCase } from "../createTransferStatement/CreateTransferStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let createStatementUseCase: CreateStatementUseCase;
let createTransferStatementUseCase: CreateTransferStatementUseCase;
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

    createTransferStatementUseCase = new CreateTransferStatementUseCase(
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
      TRANSFER = 'transfer'
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

    // Transfer test as well
    const { id: receiver_id } = await createUserUseCase.execute({
      email: 'receiver@email.com',
      name: 'receiver',
      password: 'receiver',
    });

    await createTransferStatementUseCase.execute({
      sender_id: user_id,
      receiver_id: String(receiver_id),
      amount: 50,
      description: 'test',
    });

    const result = await getBalanceUseCase.execute({ user_id });

    expect(result.statement.length).toBe(3);
    expect(result.balance).toEqual(0);
  });

  it('should not be able to get an inexistent accout balance', async () => {
    await expect(async () => {
      await getBalanceUseCase.execute({
        user_id: 'invalidId'
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
