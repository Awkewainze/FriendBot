-- CreateEnum
CREATE TYPE "PermissionName" AS ENUM ('UseCommands', 'ModifySelf', 'ModifyOtherTemporary', 'ModifyOther', 'PlaySound', 'CringeCash', 'CringeCashAdmin', 'ModifyPermissions');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('functional', 'error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly');

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "progress" INTEGER,
    "goal" INTEGER,
    "grantedOn" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "grant" BOOLEAN NOT NULL,
    "permission" "PermissionName" NOT NULL,
    "target" JSONB,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "meta" JSONB NOT NULL,
    "severity" "Severity" NOT NULL,
    "userId" TEXT,
    "guildId" TEXT,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "key_value_store" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "key_value_store_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "timed_events" (
    "id" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "executeAt" TIMESTAMP(3) NOT NULL,
    "cancelExecuteAfter" TIMESTAMP(3),
    "executedAt" TIMESTAMP(3),
    "userId" TEXT,
    "guildId" TEXT,
    "meta" JSONB,

    CONSTRAINT "timed_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "achievements_id_key" ON "achievements"("id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_id_key" ON "permissions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "events_id_key" ON "events"("id");

-- CreateIndex
CREATE UNIQUE INDEX "key_value_store_key_key" ON "key_value_store"("key");

-- CreateIndex
CREATE UNIQUE INDEX "timed_events_id_key" ON "timed_events"("id");
