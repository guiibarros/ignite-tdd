import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe('Get account statement operation', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
  });

  it('should be able to get a statement operation from an account', async () => {
    const user = await createUserUseCase.execute({
      email: 'test@email.com',
      name: 'test',
      password: 'test',
    });

    enum OperationType {
      DEPOSIT = 'deposit',
      WITHDRAW = 'withdraw',
    };

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 100,
      description: 'test',
      type: OperationType.DEPOSIT,
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      statement_id: statement.id as string,
      user_id: user.id as string,
    });

    expect(statementOperation).toHaveProperty('id');
  });

  it('should not be able to get a statement operation from an inexistent account', async () => {
    await expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: 'invalidUserId',
        statement_id: 'invalidStatementId',
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it('should not be able to get an inexistent statement operation form an account', async () => {
    await expect(async () => {
      const { id } = await createUserUseCase.execute({
        email: 'test@email.com',
        name: 'test',
        password: 'test',
      });

      const user_id = id as string;

      await getStatementOperationUseCase.execute({
        user_id,
        statement_id: 'invalidStatementId',
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
