# getDirectoryHandle(path[, options])

Gets a directory handle.

## Parameters

- `path` `<string>`: Directory path relative to the root directory
- `options` `<FileSystemGetDirectoryOptions>`: _[Optional]_ Options for retrieving the directory handle

## Returns

- `<Promise<FileSystemDirectoryHandle>>`

## Example

```typescript
const opfs = await OPFS.open();

// Get existing directory
const handle = await opfs.getDirectoryHandle("/data");

// Create directory if it doesn't exist
const handle = await opfs.getDirectoryHandle("/data/subfolder", { create: true });
```
