# getDirectoryHandle(path[, options])

Gets a directory handle.

## Signature

```typescript
/**
 * @param {string} path Directory path relative to the root directory.
 * @param {FileSystemGetDirectoryOptions} [options] Options for retrieving the directory handle.
 *
 * @throws
 */
getDirectoryHandle(
  path: string,
  options?: FileSystemGetDirectoryOptions
): Promise<FileSystemDirectoryHandle>
```

## Example

```typescript
const opfs = await OPFS.open();

// Get existing directory
const handle = await opfs.getDirectoryHandle("/data");

// Create directory if it doesn't exist
const handle = await opfs.getDirectoryHandle("/data/subfolder", { create: true });
```
