-- CreateEnum
CREATE TYPE "ServiceStatusEnum" AS ENUM ('COMPLETED', 'PENDING', 'CANCELLED', 'IN_PROGRESS');

-- CreateEnum
CREATE TYPE "UserRoleEnum" AS ENUM ('ADMIN', 'EMPLOYEE');

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceVisit" (
    "id" UUID NOT NULL,
    "vehicleId" UUID NOT NULL,
    "entryBy" UUID NOT NULL,
    "kilometersDriven" INTEGER NOT NULL,
    "serviceType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "serviceStatus" "ServiceStatusEnum" NOT NULL,
    "scheduledAt" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "completedAt" TIMESTAMPTZ,

    CONSTRAINT "ServiceVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "role" "UserRoleEnum" NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phoneNumber_key" ON "Customer"("phoneNumber");

-- CreateIndex
CREATE INDEX "ServiceVisit_vehicle_history_idx" ON "ServiceVisit"("vehicleId", "scheduledAt");

-- CreateIndex
CREATE INDEX "ServiceVisit_status_filter_idx" ON "ServiceVisit"("serviceStatus", "scheduledAt");

-- CreateIndex
CREATE INDEX "ServiceVisit_user_filter_idx" ON "ServiceVisit"("entryBy", "createdAt");

-- CreateIndex
CREATE INDEX "ServiceVisit_scheduledAt_idx" ON "ServiceVisit"("scheduledAt");

-- CreateIndex
CREATE INDEX "ServiceVisit_completedAt_idx" ON "ServiceVisit"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceVisit_vehicleId_scheduledAt_key" ON "ServiceVisit"("vehicleId", "scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vehicleNumber_key" ON "Vehicle"("vehicleNumber");

-- CreateIndex
CREATE INDEX "Vehicle_customer_idx" ON "Vehicle"("customerId");

-- AddForeignKey
ALTER TABLE "ServiceVisit" ADD CONSTRAINT "ServiceVisit_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ServiceVisit" ADD CONSTRAINT "ServiceVisit_entryBy_fkey" FOREIGN KEY ("entryBy") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
