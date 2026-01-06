import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

/**
 * Upload Image Response
 */
export interface UploadImageResponse {
    path: string;
    filename: string;
    message: string;
}

/**
 * Image Base64 Response
 */
export interface ImageBase64Response {
    filename: string;
    mime_type: string;
    data: string;  // base64 data URL (e.g., "data:image/jpeg;base64,...")
}

@Injectable({
    providedIn: 'root'
})
export class FileUploadService {
    private readonly API_PATH = '/files';

    constructor(private api: ApiService) { }

    /**
     * Upload an image file using multipart/form-data
     * Backend: POST /api/v1/files/upload-image/
     * @param file The file to upload
     * @returns Observable containing the upload response with path and filename
     */
    uploadImage(file: File): Observable<UploadImageResponse> {
        return this.api.upload<UploadImageResponse>(
            `${this.API_PATH}/upload-image/`,
            file
        );
    }

    /**
     * Upload an image as a base64 string
     * Backend: POST /api/v1/files/upload-image-base64/
     * @param base64Image The base64 string of the image
     * @returns Observable containing the upload response with path and filename
     */
    uploadImageBase64(base64Image: string): Observable<UploadImageResponse> {
        // Note: The backend expects 'base64_image' as a form field
        const formData = new FormData();
        formData.append('base64_image', base64Image);

        // We use post instead of upload because upload expects a File object
        // But we need to send it as FormData to match backend expectation
        return this.api.post<UploadImageResponse>(
            `${this.API_PATH}/upload-image-base64/`,
            formData
        );
    }

    /**
     * Get image file (binary)
     * Backend: GET /api/v1/files/get-image/{filename}
     * @param filename The filename of the image
     * @returns Observable containing the image as Blob
     */
    getImage(filename: string): Observable<Blob> {
        return this.api.get<Blob>(
            `${this.API_PATH}/get-image/${filename}`,
            undefined,
            { responseType: 'blob' }
        );
    }

    /**
     * Get image as base64 string
     * Backend: GET /api/v1/files/get-image-base64/{filename}
     * @param filename The filename of the image
     * @returns Observable containing the image as base64 data URL
     */
    getImageBase64(filename: string): Observable<ImageBase64Response> {
        return this.api.get<ImageBase64Response>(
            `${this.API_PATH}/get-image-base64/${filename}`
        );
    }

    /**
     * Get the full URL for an uploaded image
     * @param filename The filename of the image
     * @returns The full URL to access the image
     */
    getImageUrl(filename: string): string {
        if (!filename) return '';
        if (filename.startsWith('http')) return filename;

        // If filename already contains /images/ prefix, strip it to avoid duplication
        // or just return it if it's a full path relative to root
        if (filename.startsWith('/images/')) {
            return `${environment.apiUrl.replace('/api/v1', '')}${filename}`;
        }

        return `${environment.apiUrl.replace('/api/v1', '')}/images/${filename}`;
    }

    /**
     * Get the full URL for an uploaded image (alias for getImageUrl)
     * @param path The path returned from upload (e.g., /images/filename.jpg)
     * @returns The full URL
     */
    getPublicUrl(path: string): string {
        return this.getImageUrl(path);
    }
}
