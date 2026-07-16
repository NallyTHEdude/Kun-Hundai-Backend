import { prisma } from '../db/database.js';
import { ApiError } from '../utils/api-error.js';

const getVehicleDetailsById = async (vehicleId) => {
	const vehicle = await prisma.vehicle.findUnique({
		where: {
			id: vehicleId,
		},
		include: {
			customer: true,
		},
	});

	if (!vehicle) {
		throw new ApiError(404, 'Vehicle not found.');
	}

	return vehicle;
};

const getVehicleServiceHistory = async (vehicleId) => {
	const vehicle = await prisma.vehicle.findUnique({
		where: {
			id: vehicleId,
		},
		select: {
			id: true,
		},
	});

	if (!vehicle) {
		throw new ApiError(404, 'Vehicle not found.');
	}

	const serviceHistory = await prisma.serviceVisit.findMany({
		where: {
			vehicleId,
		},
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

	return serviceHistory;
};

export { getVehicleDetailsById, getVehicleServiceHistory };
