import { v4 as uuidv4 } from 'uuid';
import { BlobServiceClient } from '@azure/storage-blob';
import { Request } from 'express';
import multer, { Multer } from 'multer';
import { type } from 'os';


type IFileContent = {
	url: string;
	filename: string;
	type: string;
	size: number;
}


class AzureService {
	containerName: string;
	accountName: string;
	accountKey: string;
	containerClient: any;

	constructor() {
		this.containerName = process.env.AZURE_CONTAINER_NAME as string;
		this.accountName = process.env.AZURE_ACCOUNT_NAME as string;
		this.accountKey = process.env.AZURE_STORAGE_CONNECTION_STRING as string;
		const azureClient = BlobServiceClient.fromConnectionString(this.accountKey);

		this.containerClient = azureClient.getContainerClient(this.containerName);
	}
	public upload(): Multer {
		return multer({
			storage: multer.memoryStorage(),
			limits: { fileSize: 1000000000, files: 1 },
			fileFilter(req, file, cb) {
				if (!file.originalname.match(/\.(usdz|glb|gltf|png|jpg)$/)) {
					return cb(new Error('Please upload a valid image file'));
				}
				cb(null, true);
			},
		});
	}
	public async uploadFile(file: Express.Multer.File, id: string): Promise<IFileContent> {
		const [originalName, extension] = file.originalname.split('.');

		const file_name = `${originalName}.${extension}`;

		const blobName = `openai/${id}/${file_name}`;

		const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

		const uploadBlobResponse = await blockBlobClient.upload(file.buffer, file.buffer.length);

		return {
			url: blockBlobClient.url,
			filename: file_name,
			size: file.size,
			type: extension,
		};
	}

	public async deleteFile(fileName: string) {
		const response = await this.containerClient.deleteBlob(fileName);
		if (response._response.status !== 202) {
			throw new Error(`Error deleting ${fileName}`);
		}
	}

	public async getFile(fileName: string) { }

	public async getFiles() { }

	public async getFilesByPrefix(prefix: string) { }

	public formatBytes(bytes: number, decimals = 2): string {
		if (!+bytes) return '0 Bytes';

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	}

	public getBuild() {

	}

}

export default AzureService;