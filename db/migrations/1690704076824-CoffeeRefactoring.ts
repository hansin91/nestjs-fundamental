import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class CoffeeRefactoring1690704076824 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'coffee',
      new TableColumn({
        name: 'description',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('coffee', 'description');
  }
}
