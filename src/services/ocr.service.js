import sharp from 'sharp';
import Tesseract from 'tesseract.js';
import { ApiError } from '../utils/api-error.js';
import { logger } from '../utils/logger.js';

const extractVehicleNumber = async (imageBuffer) => {
    try {
        // Preprocess image
        const processedImage = await sharp(imageBuffer)
            .resize({
                width: 1600,
                withoutEnlargement: true,
            })
            .grayscale()
            .normalize()
            .sharpen()
            .threshold(160)
            .png()
            .toBuffer();

        // OCR
        const {
            data: { text },
        } = await Tesseract.recognize(processedImage, 'eng');

        logger.info('Raw OCR Output:');
        logger.info(text);

        // Remove everything except letters and digits
        const normalizedText = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

        logger.info('Normalized OCR Output:');
        logger.info(normalizedText);

        // Indian registration number
        const match = normalizedText.match(
            /[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}/,
        );

        if (!match) {
            throw new ApiError(404, 'Vehicle number could not be detected.');
        }

        return {
            vehicleNumber: match[0],
        };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        logger.error(error);

        throw new ApiError(500, 'Failed to process image for OCR.');
    }
};

export { extractVehicleNumber };
