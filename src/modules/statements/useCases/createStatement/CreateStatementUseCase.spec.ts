import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

describe('Create a new statement', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
  });

  it('should able to create a new deposit statement', async () => {
    const { id } = await createUserUseCase.execute({
      email: 'test@email.com',
      name: 'test',
      password: 'test',
    });

    const user_id = id as string;

    enum OperationType {
      DEPOSIT = 'deposit',
      WITHDRAW = 'withdraw',
    }

    const depositStatement = await createStatementUseCase.execute({
      user_id,
      amount: 100,
      description: 'test',
      type: OperationType.DEPOSIT,
    });

    expect(depositStatement).toHaveProperty('id');
    expect(depositStatement.type).toBe('deposit');
  });

  it('should able to create a new withdraw statement', async () => {
    const { id } = await createUserUseCase.execute({
      email: 'test@email.com',
      name: 'test',
      password: 'test',
    });

    const user_id = id as string;

    enum OperationType {
      DEPOSIT = 'deposit',
      WITHDRAW = 'withdraw',
    }

    await createStatementUseCase.execute({
      user_id,
      amount: 100,
      description: 'deposit test',
      type: OperationType.DEPOSIT,
    });

    const withdrawStatement = await createStatementUseCase.execute({
      user_id,
      amount: 50,
      description: 'withdraw test',
      type: OperationType.WITHDRAW,
    });

    expect(withdrawStatement).toHaveProperty('id');
    expect(withdrawStatement.type).toBe('withdraw');
  });

  it('should not able to create a new withdraw statement with insufficient funds', async () => {
    await expect(async () => {
      const { id } = await createUserUseCase.execute({
        email: 'test@email.com',
        name: 'test',
        password: 'test',
      });

      const user_id = id as string;

      enum OperationType {
        DEPOSIT = 'deposit',
        WITHDRAW = 'withdraw',
      }

      await createStatementUseCase.execute({
        user_id,
        amount: 50,
        description: 'withdraw test',
        type: OperationType.WITHDRAW,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it('should not be able to create a new statement for an inexistent user', async () => {
    await expect(async () => {
      enum OperationType {
        DEPOSIT = 'deposit',
        WITHDRAW = 'withdraw',
      }

      await createStatementUseCase.execute({
        user_id: 'invalidUserId',
        amount: 100,
        description: 'test',
        type: OperationType.DEPOSIT,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
