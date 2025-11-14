import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveRoleIdColumns1763093620636 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "session_role_question_categories" DROP COLUMN IF EXISTS "roleId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_session_progress" DROP COLUMN IF EXISTS "roleId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_usage" DROP COLUMN IF EXISTS "roleId"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "session_role_question_categories" ADD "roleId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_session_progress" ADD "roleId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_usage" ADD "roleId" integer`,
    );
  }
}
