import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";

export type ICreateTransferStatementDTO = Omit<ICreateStatementDTO, 'user_id' | 'type'> & {
  sender_id: string;
  receiver_id: string;
};
