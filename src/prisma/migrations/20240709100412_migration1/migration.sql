-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" SERIAL NOT NULL,
    "issueId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentVote" (
    "commentId" INTEGER NOT NULL,
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CommentVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueVote" (
    "id" SERIAL NOT NULL,
    "issueId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "IssueVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouncilMember" (
    "login" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profilePictureUrl" TEXT NOT NULL,

    CONSTRAINT "CouncilMember_pkey" PRIMARY KEY ("login")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommentVote_commentId_userId_key" ON "CommentVote"("commentId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "IssueVote_issueId_userId_key" ON "IssueVote"("issueId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CouncilMember_email_key" ON "CouncilMember"("email");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentVote" ADD CONSTRAINT "CommentVote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentVote" ADD CONSTRAINT "CommentVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueVote" ADD CONSTRAINT "IssueVote_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueVote" ADD CONSTRAINT "IssueVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
