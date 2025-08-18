import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { saveBase64Image, getFilePath, fileExists, deleteFile } from './upload';

describe('File Upload Tests', () => {
  const testDir = './test-uploads';
  
  test('should create test directory', () => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    assert(fs.existsSync(testDir), 'Test directory should exist');
  });

  test('should save base64 image', async () => {
    const base64Data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const filename = await saveBase64Image(base64Data, 'test-image.png');
    
    assert(typeof filename === 'string', 'Should return filename');
    assert(filename.length > 0, 'Filename should not be empty');
    
    const filePath = getFilePath(filename);
    assert(fs.existsSync(filePath), 'File should exist on disk');
  });

  test('should check if file exists', async () => {
    const base64Data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const filename = await saveBase64Image(base64Data, 'test-exists.png');
    
    const exists = await fileExists(filename);
    assert(exists === true, 'File should exist');
    
    const notExists = await fileExists('non-existent-file.png');
    assert(notExists === false, 'Non-existent file should return false');
  });

  test('should delete file', async () => {
    const base64Data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const filename = await saveBase64Image(base64Data, 'test-delete.png');
    
    const existsBefore = await fileExists(filename);
    assert(existsBefore === true, 'File should exist before deletion');
    
    const deleted = await deleteFile(filename);
    assert(deleted === true, 'File should be deleted successfully');
    
    const existsAfter = await fileExists(filename);
    assert(existsAfter === false, 'File should not exist after deletion');
  });

  test('should clean up test directory', () => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    assert(!fs.existsSync(testDir), 'Test directory should be cleaned up');
  });
});
