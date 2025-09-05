import { UploadedFile } from 'express-fileupload';

export default interface FileService {
    saveFile(file: UploadedFile): Promise<string>;
    deleteFile(fileName: string): Promise<void>;
}