# getFileHandle(path, options?)

Gets a handle to a file.

## Signature

```typescript
/**
 * @param {string} path File path relative to the root directory.
 * @param {FileSystemGetFileOptions} [options] Options for retrieving the file handle.
 *
 * @throws
 */
getFileHandle(path: string, options?: FileSystemGetFileOptions): Promise<FileSystemFileHandle>
```

## Example

```typescript
const opfs = await OPFS.open();

// Get existing file
const handle = await opfs.getFileHandle("/data/file.txt");

// Create file if it doesn't exist
const handle = await opfs.getFileHandle("/data/file.txt", { create: true });
```
