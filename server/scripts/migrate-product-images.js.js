import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import cloudinary from '../src/lib/cloudinary.js';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_DIR = path.resolve(
    __dirname,
    '../../public/images/products'
);

function uploadToCloudinary(filePath, publicId) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'otaku-store/products',
                public_id: publicId,
                resource_type: 'image',
                overwrite: false,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        fs.readFile(filePath)
            .then((buffer) => stream.end(buffer))
            .catch(reject);
    });
}

async function main() {
    console.log('Starting product image migration...');
    console.log(`Images directory: ${PRODUCTS_DIR}`);

    const files = await fs.readdir(PRODUCTS_DIR);

    const imageFiles = files.filter((file) =>
        /\.(png|jpg|jpeg|webp)$/i.test(file)
    );

    console.log(`Found ${imageFiles.length} image files.`);

    let uploaded = 0;
    let skipped = 0;

    for (const file of imageFiles) {
        const extension = path.extname(file);
        const productId = path.basename(file, extension);

        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: {
                id: true,
                image: true,
            },
        });

        if (!product) {
            console.log(`⚠️ Skipping ${file} — product "${productId}" not found.`);
            skipped++;
            continue;
        }

        console.log(`Uploading ${file} → product ${productId}...`);

        const filePath = path.join(PRODUCTS_DIR, file);

        const result = await uploadToCloudinary(
            filePath,
            productId
        );

        if (!result?.secure_url) {
            throw new Error(`Cloudinary upload failed for ${file}`);
        }

        await prisma.product.update({
            where: { id: productId },
            data: {
                image: result.secure_url,
            },
        });

        console.log(`✅ ${productId} updated`);
        uploaded++;
    }

    console.log('');
    console.log('================================');
    console.log('Product image migration complete');
    console.log('================================');
    console.log(`Uploaded: ${uploaded}`);
    console.log(`Skipped:  ${skipped}`);
}

main()
    .catch((error) => {
        console.error('');
        console.error('❌ Migration failed:');
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });