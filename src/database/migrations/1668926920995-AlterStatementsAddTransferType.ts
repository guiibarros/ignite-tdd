import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterStatementsAddTransferType1668926920995 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableColumn = new TableColumn({
      name: 'type',
      type: 'enum',
      enum: ['deposit', 'withdraw', 'transfer']
    })

    await queryRunner.changeColumn('statements', 'type', tableColumn);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableColumn = new TableColumn({
      name: 'type',
      type: 'enum',
      enum: ['deposit', 'withdraw']
    })

    await queryRunner.addColumn('statements', tableColumn);
  }
}
