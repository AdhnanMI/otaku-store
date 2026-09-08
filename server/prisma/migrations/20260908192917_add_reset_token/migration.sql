/*
  Warnings:

  - A unique constraint covering the columns `[resetToken]` on the table `PasswordResetOtp` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PasswordResetOtp" ADD COLUMN     "resetToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetOtp_resetToken_key" ON "PasswordResetOtp"("resetToken");
