import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferStatementUseCase } from "./CreateTransferStatementUseCase";

export class CreateTransferStatementController {
  public async execute(request: Request, response: Response): Promise<Response> {
    const { amount, description } = request.body;
    const { receiver_id } = request.params;
    const { id: sender_id } = request.user;

    const createTransferStatementUseCase = container.resolve(CreateTransferStatementUseCase);

    const transferStatement = await createTransferStatementUseCase.execute({
      amount,
      description,
      sender_id,
      receiver_id,
    });

    return response.status(201).json(transferStatement);
  }
}
