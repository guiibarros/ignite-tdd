import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "../createStatement/CreateStatementError";
import { CreateTransferStatementUseCase } from "./CreateTransferStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

let createTransferStatementUseCase: CreateTransferStatementUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
}

describe('Create a new transfer statement', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createTransferStatementUseCase = new CreateTransferStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    )
  });

  it('should be able to create a new transfer statement', async () => {
    const { id: sender_id } = await inMemoryUsersRepository.create({
      email: 'sender@email.com',
      name: 'sender user',
      password: 'abc123'
    });

    const { id: receiver_id } = await inMemoryUsersRepository.create({
      email: 'receiver@email.com',
      name: 'receiver user',
      password: 'abc123'
    });

    await inMemoryStatementsRepository.create({
      user_id: String(sender_id),
      amount: 100,
      description: 'Deposit test',
      type: OperationType.DEPOSIT,
    });

    const transferStatement = await createTransferStatementUseCase.execute({
      amount: 50,
      description: 'Aluguel da casa',
      sender_id: String(sender_id),
      receiver_id: String(receiver_id),
    });

    expect(transferStatement).toHaveProperty('id');
    expect(transferStatement.type).toEqual('transfer');
  });

  it('should not be able to create a new transfer statement with insufficient funds', async () => {
    const { id: sender_id } = await inMemoryUsersRepository.create({
      email: 'sender@email.com',
      name: 'sender user',
      password: 'abc123'
    });

    const { id: receiver_id } = await inMemoryUsersRepository.create({
      email: 'receiver@email.com',
      name: 'receiver user',
      password: 'abc123'
    });

    await expect(
      createTransferStatementUseCase.execute({
        amount: 50,
        description: 'Aluguel da casa',
        sender_id: String(sender_id),
        receiver_id: String(receiver_id),
      })
    ).rejects.toEqual(new CreateStatementError.InsufficientFunds());
  });

  it('should not be able to create a new transfer statement for an inexistent sender user', async () => {
    const { id: receiver_id } = await inMemoryUsersRepository.create({
      email: 'receiver@email.com',
      name: 'receiver user',
      password: 'abc123'
    });

    await expect(
      createTransferStatementUseCase.execute({
        amount: 50,
        description: 'Aluguel da casa',
        sender_id: 'invalidSenderId',
        receiver_id: String(receiver_id),
      })
    ).rejects.toEqual(new CreateStatementError.UserNotFound());
  });

  it('should not be able to create a new transfer statement for an inexistent receiver user', async () => {
    const { id: sender_id } = await inMemoryUsersRepository.create({
      email: 'sender@email.com',
      name: 'sender user',
      password: 'abc123'
    });

    await expect(
      createTransferStatementUseCase.execute({
        amount: 50,
        description: 'Aluguel da casa',
        sender_id: String(sender_id),
        receiver_id: 'invalidReceiverId',
      })
    ).rejects.toEqual(new CreateStatementError.UserNotFound());
  });
});
