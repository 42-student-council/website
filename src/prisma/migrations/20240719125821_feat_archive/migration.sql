-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false;
