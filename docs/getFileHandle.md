# getFileHandle(path[, options])

Gets a file handle.

## Parameters

- `path` `<string>`: File path relative to the root directory
- `options` `<FileSystemGetFileOptions>`: _[Optional]_ Options for retrieving the file handle

## Returns

- `<Promise<FileSystemFileHandle>>`

## Example

```typescript
const opfs = await OPFS.open();

// Get existing file
const handle = await opfs.getFileHandle("/data/file.txt");

// Create file if it doesn't exist
const handle = await opfs.getFileHandle("/data/file.txt", { create: true });
```
