# remove(path)

Removes a file or directory recursively.

## Parameters

- `path` `<string>`: File or directory path relative to the root directory

## Example

```typescript
const opfs = await OPFS.open();

await opfs.writeFile("/data/file.txt", "content");
await opfs.mkdir("/data/subfolder");

// Remove file
await opfs.remove("/data/file.txt");

// Remove directory and all its contents
await opfs.remove("/data");
```
