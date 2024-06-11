-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "IssueComment" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" SERIAL NOT NULL,
    "issueId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "IssueComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "status" "IssueStatus" NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IssueComment" ADD CONSTRAINT "IssueComment_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
