import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import FileService from '../../domain/services/file.service.js';
import { UploadedFile } from 'express-fileupload';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default class FileServiceImpt implements FileService  {
    async saveFile(file: UploadedFile): Promise<string> {
        const uploadDir = path.resolve(__dirname, '..', '..', '..', '..', 'static');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileExt = path.extname(file.name);
        const fileName = `${uuidv4()}${fileExt}`;
        const filePath = path.join(uploadDir, fileName);

        await file.mv(filePath); 

        return fileName;
    }

    async deleteFile(fileName: string): Promise<void> {
        const filePath = path.resolve(__dirname, '..', '..', '..', '..', 'static', fileName);

        try {
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
            } else {
                throw new Error(`Файл ${fileName} не найден в static`);
            }
        } catch (err) {
            throw new Error('Не удалось удалить файл');
        }
    }а
}