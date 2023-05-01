import {
  BindingScope,
  config,
  ContextTags,
  injectable,
  Provider,
} from '@loopback/core';
import multer from 'multer';

import {BindingKey} from '@loopback/core';
import {RequestHandler} from "express-serve-static-core";

export type FileUploadHandler = RequestHandler;

/**
 * Binding key for the file upload service
 */
export const FILE_UPLOAD_SERVICE = BindingKey.create<FileUploadHandler>(
    'services.FileUpload',
);

/**
 * Binding key for the storage directory
 */
export const STORAGE_DIRECTORY = BindingKey.create<string>('storage.directory');

@injectable({
  scope: BindingScope.TRANSIENT,
  tags: {[ContextTags.KEY]: FILE_UPLOAD_SERVICE},
})
export class FileUploadProvider implements Provider<FileUploadHandler> {
  constructor(@config() private options: multer.Options = {}) {
    if (!this.options.storage) {
      // Default to in-memory storage
      this.options.storage = multer.memoryStorage();
    }
  }

  value(): FileUploadHandler {
    return multer(this.options).any();
  }
}
