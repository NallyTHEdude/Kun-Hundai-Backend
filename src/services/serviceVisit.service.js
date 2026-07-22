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
        vehicleModel,
        customerName,
        customerNumber,
        kilometersDriven,
        description,
        scheduledAt,
    } = data;

    const scheduledDate = new Date(scheduledAt);

    if (isNaN(scheduledDate.getTime())) {
        throw new ApiError(400, 'Invalid scheduled date.');
    }

    const now = new Date();

    const serviceCount = await prisma.serviceVisit.count();
    

    if(serviceCount >= 1000) {
        await deleteOldestServiceLog();
    }

    const serviceLog = await prisma.$transaction(async (tx) => {
        let customer = await tx.customer.findUnique({
            where: {
                phoneNumber: customerNumber,
            },
        });

        if (!customer) {
            customer = await tx.customer.create({
                data: {
                    fullName: customerName,
                    phoneNumber: customerNumber,
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
                    vehicleModel,
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
        } else if (
            vehicle.vehicleType !== vehicleType ||
            vehicle.vehicleModel !== vehicleModel
        ) {
            throw new ApiError(
                400,
                'Vehicle details do not match the existing vehicle record.',
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
                kilometersDriven,
                description,
                serviceStatus: ServiceStatusEnum.PENDING,
                scheduledAt: scheduledDate,
                completedAt: null,
                createdAt: now,
                updatedAt: now,
            },
            include: {
                vehicle: {
                    include: {
                        customer: true,
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

    if (serviceLog.serviceStatus === ServiceStatusEnum.COMPLETED) {
        throw new ApiError(400, 'Completed service logs cannot be edited.');
    }

    const updateData = {
        updatedAt: new Date(),
    };

    if (kilometersDriven !== undefined) {
        updateData.kilometersDriven = kilometersDriven;
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
        } else if (serviceStatus !== ServiceStatusEnum.COMPLETED) {
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
        },
    });

    return updatedServiceLog;
};

const filterServiceLog = async (filters) => {
    const {
        vehicleNumber,
        vehicleType,
        customerNumber,
        serviceStatus,
        scheduledAt,
        completedAt,
    } = filters;

    const where = {};

    if (vehicleNumber) {
        const vehicleNumberUpper = vehicleNumber.toUpperCase();
        where.vehicle = {
            vehicleNumber: {
                contains: vehicleNumberUpper,
                mode: 'insensitive',
            },
        };
    }

    if (customerNumber) {
        where.vehicle = {
            ...where.vehicle,
            customer: {
                phoneNumber: {
                    contains: customerNumber,
                    mode: 'insensitive',
                },
            },
        };
    }

    if (vehicleType) {
        where.vehicle = {
            ...where.vehicle,
            vehicleType: {
                equals: vehicleType,
            },
        };
    }

    if (serviceStatus) {
        where.serviceStatus = serviceStatus;
    }

    if (scheduledAt) {
        const start = new Date(scheduledAt);
        const end = new Date(scheduledAt);
        end.setDate(end.getDate() + 1);

        where.scheduledAt = {
            gte: start,
            lt: end,
        };
    }

    if (completedAt) {
        const start = new Date(completedAt);
        const end = new Date(completedAt);
        end.setDate(end.getDate() + 1);

        where.completedAt = {
            gte: start,
            lt: end,
        };
    }

    const filteredData = await prisma.serviceVisit.findMany({
        where,
        include: {
            vehicle: {
                include: {
                    customer: true,
                },
            },
        },
        orderBy: {
            scheduledAt: 'desc',
        },
    });

    return filteredData;
};

const getServiceLogById = async (serviceId) => {
    const serviceLog = await prisma.serviceVisit.findUnique({
        where: {
            id: serviceId,
        },
        include: {
            vehicle: {
                include: {
                    customer: true,
                },
            },
        },
    });

    if (!serviceLog) {
        throw new ApiError(404, 'Service log not found.');
    }

    return serviceLog;
};

const getAllServiceLogs = async () => {
    const serviceLogs = await prisma.serviceVisit.findMany({
        include: {
            vehicle: {
                include: {
                    customer: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return serviceLogs;
};


// ---------- HELPER FUNCTIONS ----------
const deleteOldestServiceLog = async () => {
    // Retain only the most recent completed service history to stay
    // within the free-tier database limits. Active service logs are
    // never deleted.
    const oldestCompletedService = await prisma.serviceVisit.findFirst({
        where: {
            serviceStatus: ServiceStatusEnum.COMPLETED,
        },
        orderBy: {
            createdAt: 'asc',
        },
    });

    if (!oldestCompletedService) {
        return;
    }

    await prisma.serviceVisit.delete({
        where: {
            id: oldestCompletedService.id,
        },
    });
};
export { createServiceLog, updateServiceLog, filterServiceLog, getServiceLogById, getAllServiceLogs };
