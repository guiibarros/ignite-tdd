import { AppError } from "../../../../shared/errors/AppError";

export class CreateTransferStatementError extends AppError {
  public constructor() {
    super('Receiver user should not be the same as sender user');
  }
}
