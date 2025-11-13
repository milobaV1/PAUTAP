import { MigrationInterface, QueryRunner } from 'typeorm';

export class Baseline1763001144282 implements MigrationInterface {
  name = 'Baseline1763001144282';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_0ae1c71d8a6cf7fd49961bd21f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session_role_question_categories" DROP CONSTRAINT IF EXISTS "UQ_a899cfd8eca5beb951f469701e9"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "level"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_level_enum"`);
    await queryRunner.query(
      `ALTER TABLE "session_role_question_categories" ADD "roleId" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_session_progress" ADD "roleId" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_usage" ADD "roleId" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_usage" DROP CONSTRAINT IF EXISTS "FK_c996fbdf9155b3d4a6285528e6e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_usage" DROP CONSTRAINT IF EXISTS "UQ_c996fbdf9155b3d4a6285528e6e"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_55814112faea998edc60452bfc" ON "session_role_question_categories" ("sessionId", "roleId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "session_role_question_categories" ADD CONSTRAINT "UQ_25d4de0d282e8e8db1b303bd555" UNIQUE ("sessionId", "roleId", "crispCategory")`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_usage" ADD CONSTRAINT "UQ_496727e19bb8dc89f7ff3401921" UNIQUE ("questionId", "roleId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "session_role_question_categories" ADD CONSTRAINT "FK_f9e2ab8fc0cf3d8f4719979c9a9" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_session_progress" ADD CONSTRAINT "FK_342aac4a892b985823967b6dbe1" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_usage" ADD CONSTRAINT "FK_c996fbdf9155b3d4a6285528e6e" FOREIGN KEY ("questionId") REFERENCES "question_bank"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_usage" ADD CONSTRAINT "FK_aadfdfc17fc8562818c3d6ef70f" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "question_usage" DROP CONSTRAINT "FK_aadfdfc17fc8562818c3d6ef70f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_usage" DROP CONSTRAINT "FK_c996fbdf9155b3d4a6285528e6e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_session_progress" DROP CONSTRAINT "FK_342aac4a892b985823967b6dbe1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session_role_question_categories" DROP CONSTRAINT "FK_f9e2ab8fc0cf3d8f4719979c9a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_usage" DROP CONSTRAINT "UQ_496727e19bb8dc89f7ff3401921"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session_role_question_categories" DROP CONSTRAINT "UQ_25d4de0d282e8e8db1b303bd555"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_55814112faea998edc60452bfc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_usage" ADD CONSTRAINT "UQ_c996fbdf9155b3d4a6285528e6e" UNIQUE ("questionId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_usage" ADD CONSTRAINT "FK_c996fbdf9155b3d4a6285528e6e" FOREIGN KEY ("questionId") REFERENCES "question_bank"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question_usage" DROP COLUMN "roleId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_session_progress" DROP COLUMN "roleId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session_role_question_categories" DROP COLUMN "roleId"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_level_enum" AS ENUM('head_of_dept', 'normal')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "level" "public"."user_level_enum" NOT NULL DEFAULT 'normal'`,
    );
    await queryRunner.query(
      `ALTER TABLE "session_role_question_categories" ADD CONSTRAINT "UQ_a899cfd8eca5beb951f469701e9" UNIQUE ("sessionId", "crispCategory")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0ae1c71d8a6cf7fd49961bd21f" ON "session_role_question_categories" ("sessionId") `,
    );
  }
}
