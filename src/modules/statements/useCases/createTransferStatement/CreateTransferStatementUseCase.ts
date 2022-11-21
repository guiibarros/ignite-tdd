import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "../createStatement/CreateStatementError";
import { ICreateTransferStatementDTO } from "./ICreateTransferStatementDTO";

enum OperationType {
  TRANSFER = 'transfer',
  DEPOSIT = 'deposit',
}

@injectable()
export class CreateTransferStatementUseCase {
  public constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository,
  ) {}

  public async execute({
    amount,
    description,
    receiver_id,
    sender_id
  }: ICreateTransferStatementDTO): Promise<Statement> {
    const senderUser = await this.usersRepository.findById(sender_id);

    if (!senderUser) {
      throw new CreateStatementError.UserNotFound();
    }

    const receiverUser = await this.usersRepository.findById(receiver_id);

    if (!receiverUser) {
      throw new CreateStatementError.UserNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({ user_id: sender_id });

    if (amount > balance) {
      throw new CreateStatementError.InsufficientFunds();
    }

    const transferStatement = await this.statementsRepository.create({
      amount,
      description,
      user_id: sender_id,
      type: OperationType.TRANSFER,
    });

    await this.statementsRepository.create({
      amount,
      description: `Received transfer from ${senderUser.name} - ${senderUser.email}. Transfer description: ${description}`,
      user_id: receiver_id,
      type: OperationType.DEPOSIT,
    });

    return transferStatement;
  }
}
