import { prisma } from '../db/database.js';
import { ApiError } from '../utils/api-error.js';
import {
    ServiceStatus,
    ServiceStatusEnum,
} from '../constants/serviceVisit.constants.js';

const createServiceLog = async (data) => {
    const {
        vehicleNumber,
        vehicleType,
        customerName,
        customerPhoneNumber,
        customerAddress,
        kilometersDriven,
        serviceType,
        serviceStatus,
        description,
        scheduledAt,
        entryBy,
    } = data;

    if (serviceStatus && !ServiceStatus.includes(serviceStatus)) {
        throw new ApiError(
            400,
            `Invalid service status. Allowed values are: ${ServiceStatus.join(', ')}`,
        );
    }

    const scheduledDate = new Date(scheduledAt);

    if (isNaN(scheduledDate.getTime())) {
        throw new ApiError(400, 'Invalid scheduled date.');
    }

    const now = new Date();

    const serviceLog = await prisma.$transaction(async (tx) => {
        let customer = await tx.customer.findUnique({
            where: {
                phoneNumber: customerPhoneNumber,
            },
        });

        if (!customer) {
            customer = await tx.customer.create({
                data: {
                    fullName: customerName,
                    phoneNumber: customerPhoneNumber,
                    address: customerAddress,
                    createdAt: now,
                    updatedAt: now,
                },
            });
        }

        let vehicle = await tx.vehicle.findUnique({
            where: {
                vehicleNumber,
            },
        });

        if (!vehicle) {
            vehicle = await tx.vehicle.create({
                data: {
                    vehicleNumber,
                    vehicleType,
                    customerId: customer.id,
                    createdAt: now,
                    updatedAt: now,
                },
            });
        } else if (vehicle.customerId !== customer.id) {
            throw new ApiError(
                400,
                'Vehicle number belongs to another customer.',
            );
        }

        const existingServiceLog = await tx.serviceVisit.findFirst({
            where: {
                vehicleId: vehicle.id,
                scheduledAt: scheduledDate,
            },
        });

        if (existingServiceLog) {
            throw new ApiError(
                400,
                'Service log already exists for this vehicle at the scheduled time.',
            );
        }

        const serviceVisit = await tx.serviceVisit.create({
            data: {
                vehicleId: vehicle.id,
                entryBy,
                kilometersDriven,
                serviceType,
                description,
                serviceStatus: serviceStatus ?? ServiceStatusEnum.PENDING,
                scheduledAt: scheduledDate,
                completedAt:
                    serviceStatus === ServiceStatusEnum.COMPLETED ? now : null,
                createdAt: now,
                updatedAt: now,
            },
            include: {
                vehicle: {
                    include: {
                        customer: true,
                    },
                },
                enteredBy: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        return serviceVisit;
    });

    return serviceLog;
};

const updateServiceLog = async (serviceId, data) => {
    const {
        kilometersDriven,
        serviceType,
        description,
        serviceStatus,
        scheduledAt,
    } = data;

    const serviceLog = await prisma.serviceVisit.findUnique({
        where: {
            id: serviceId,
        },
    });

    if (!serviceLog) {
        throw new ApiError(404, 'Service log not found.');
    }

    if (serviceStatus && !ServiceStatus.includes(serviceStatus)) {
        throw new ApiError(
            400,
            `Invalid service status. Allowed values are: ${ServiceStatus.join(', ')}`,
        );
    }

    const updateData = {
        updatedAt: new Date(),
    };

    if (kilometersDriven !== undefined) {
        updateData.kilometersDriven = kilometersDriven;
    }

    if (serviceType !== undefined) {
        updateData.serviceType = serviceType;
    }

    if (description !== undefined) {
        updateData.description = description;
    }

    if (scheduledAt !== undefined) {
        const scheduledDate = new Date(scheduledAt);

        if (isNaN(scheduledDate.getTime())) {
            throw new ApiError(400, 'Invalid scheduled date.');
        }

        const duplicate = await prisma.serviceVisit.findFirst({
            where: {
                id: {
                    not: serviceId,
                },
                vehicleId: serviceLog.vehicleId,
                scheduledAt: scheduledDate,
            },
        });

        if (duplicate) {
            throw new ApiError(
                400,
                'A service log already exists for this vehicle at that time.',
            );
        }

        updateData.scheduledAt = scheduledDate;
    }

    if (serviceStatus !== undefined) {
        updateData.serviceStatus = serviceStatus;

        if (
            serviceStatus === ServiceStatusEnum.COMPLETED &&
            !serviceLog.completedAt
        ) {
            updateData.completedAt = new Date();
        }

        if (serviceStatus !== ServiceStatusEnum.COMPLETED) {
            updateData.completedAt = null;
        }
    }

    const updatedServiceLog = await prisma.serviceVisit.update({
        where: {
            id: serviceId,
        },
        data: updateData,
        include: {
            vehicle: {
                include: {
                    customer: true,
                },
            },
            enteredBy: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
        },
    });

    return updatedServiceLog;
};

export { createServiceLog, updateServiceLog };
