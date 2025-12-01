# readdirHandles(path)

Reads the directory contents as handles.

## Signature

```typescript
/**
 * @param {string} path Directory path relative to the root directory.
 *
 * @throws
 */
readdirHandles(path: string): Promise<Array<FileSystemFileHandle | FileSystemDirectoryHandle>>
```

## Example

```typescript
const opfs = await OPFS.open();

await opfs.writeFile("/data/file.txt", "content");
await opfs.mkdir("/data/subfolder");

const handles = await opfs.readdirHandles("/data");
for (const handle of handles)
{
    console.log("Name:", handle.name);
}
```
