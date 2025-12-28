/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `clerkUserId` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_createdBy_fkey";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "createdBy",
ADD COLUMN     "clerkUserId" TEXT NOT NULL;

-- DropTable
DROP TABLE "User";
