/*
  Warnings:

  - You are about to drop the column `updated_at` on the `files` table. All the data in the column will be lost.
  - Added the required column `mimeType` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "files" DROP COLUMN "updated_at",
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "size" TEXT NOT NULL;
