import { BaseService } from "./baseService";
import { ApiCallbacks } from "./httpBase";

/**
 * Interface for file upload response
 */
export interface FileUploadResponse {
  object_name: string;
  folder: string;
  url?: string;
  content_type?: string;
  size_bytes?: number;
}

/**
 * Interface for file response from API
 */
interface FileResponse {
  file: {
    name: string;
    url: string;
    folder: string;
    object_name?: string;
    content_type?: string;
    size_bytes?: number;
  };
}

/**
 * File service for handling file operations
 */
class FileService extends BaseService {
  /**
   * Get a file URL by object name and folder
   * @param objectName The name of the file object
   * @param folder The folder path where the file is stored
   * @param callbacks Optional callbacks for success, error, and finally
   * @returns Promise with the file URL
   */
  async getFileUrl(
    objectName: string,
    folder: string,
    callbacks?: ApiCallbacks<FileResponse>
  ): Promise<string> {
    try {
      const data = await this.get<FileResponse>(
        `/media/file?object_name=${encodeURIComponent(objectName)}&folder=${encodeURIComponent(folder)}`,
        undefined,
        callbacks
      );

      // Handle the response format: {"file":{"name":"filename.mp3","url":"https://...","folder":"folder/path"}}
      if (data.file && data.file.url) {
        return data.file.url;
      } else {
        throw new Error('File URL not found in response');
      }
    } catch (error) {
      console.error("Error fetching file URL:", error);
      throw error;
    }
  }

  /**
   * Get an audio preview URL from task set input metadata
   * @param inputMetadata The input metadata from a task set
   * @param callbacks Optional callbacks for success, error, and finally
   * @returns Promise with the audio preview URL or null if no audio file info is available
   */
  async getAudioPreviewUrl(
    inputMetadata: any,
    callbacks?: ApiCallbacks<FileResponse>
  ): Promise<string | null> {
    try {
      if (!inputMetadata || !inputMetadata.object_name || !inputMetadata.folder) {
        return null;
      }

      return await this.getFileUrl(inputMetadata.object_name, inputMetadata.folder, callbacks);
    } catch (error) {
      console.error("Error getting audio preview URL:", error);
      return null;
    }
  }

  /**
   * Upload an audio file to the server
   * @param audioBlob The audio blob to upload
   * @param folder Optional folder to store the file in (default: 'recordings')
   * @param callbacks Optional callbacks for success, error, and finally
   * @returns Promise with object containing object_name and folder for the uploaded file
   */
  async uploadAudioFile(
    audioBlob: Blob,
    folder: string = 'recordings',
    callbacks?: ApiCallbacks<FileUploadResponse>
  ): Promise<FileUploadResponse> {
    try {
      // Convert blob to array buffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Create form data
      const formData = new FormData();
      formData.append('file', new Blob([bytes]), 'recording.wav');
      formData.append('folder', folder);

      // Upload the file using post method
      const data = await this.post<any>(
        '/media/file',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        },
        callbacks
      );

      console.log('File upload response:', data);

      // Check if the response has a nested 'file' object
      if (data.file) {
        console.log('File upload response has nested file object:', data.file);
        return {
          object_name: data.file.object_name,
          folder: data.file.folder,
          url: data.file.url,
          content_type: data.file.content_type,
          size_bytes: data.file.size_bytes
        };
      } else {
        // Handle the case where the response is flat
        console.log('File upload response is flat:', data);
        return {
          object_name: data.object_name,
          folder: data.folder,
          url: data.url,
          content_type: data.content_type,
          size_bytes: data.size_bytes
        };
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const fileService = new FileService();

// Export functions for backward compatibility
export const getFileUrl = (objectName: string, folder: string, callbacks?: ApiCallbacks<FileResponse>) =>
  fileService.getFileUrl(objectName, folder, callbacks);

export const getAudioPreviewUrl = (inputMetadata: any, callbacks?: ApiCallbacks<FileResponse>) =>
  fileService.getAudioPreviewUrl(inputMetadata, callbacks);

export const uploadAudioFile = (audioBlob: Blob, folder: string = 'recordings', callbacks?: ApiCallbacks<FileUploadResponse>) =>
  fileService.uploadAudioFile(audioBlob, folder, callbacks);

