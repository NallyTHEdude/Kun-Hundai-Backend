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
        vehicleMake,
        vehicleModel,
        vehicleYear,
        vehicleColor,
        customerName,
        customerNumber,
        customerAddress,
        kilometersDriven,
        serviceType,
        estimatedPrice,
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
                phoneNumber: customerNumber,
            },
        });

        if (!customer) {
            customer = await tx.customer.create({
                data: {
                    fullName: customerName,
                    phoneNumber: customerNumber,
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
                    vehicleMake,
                    vehicleModel,
                    vehicleYear,
                    vehicleColor,
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
            vehicle.vehicleMake !== vehicleMake ||
            vehicle.vehicleModel !== vehicleModel ||
            vehicle.vehicleYear !== vehicleYear ||
            vehicle.vehicleColor !== vehicleColor
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
                entryBy,
                kilometersDriven,
                serviceType,
                estimatedPrice: estimatedPrice ?? 0.0,
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
        estimatedPrice,
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

    if (serviceType !== undefined) {
        updateData.serviceType = serviceType;
    }

    if (estimatedPrice !== undefined) {
        updateData.estimatedPrice = estimatedPrice;
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
        // completed cannot be set to pending
        if (
            serviceLog.serviceStatus === ServiceStatusEnum.COMPLETED &&
            serviceStatus !== ServiceStatusEnum.COMPLETED
        ) {
            throw new ApiError(400, 'Completed services cannot be modified.');
        }

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
                contains: vehicleType,
                mode: 'insensitive',
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
            vehicle: true,
            enteredBy: true,
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
            // enteredBy: true,
        },
    });

    if (!serviceLog) {
        throw new ApiError(404, 'Service log not found.');
    }

    return serviceLog;
};
export { createServiceLog, updateServiceLog, filterServiceLog, getServiceLogById };
