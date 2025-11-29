# readdirHandles(path)

Lists directory contents as handles.

## Parameters

- `path` `<string>`: Directory path relative to the root directory

## Returns

- `<Promise<Array<FileSystemFileHandle | FileSystemDirectoryHandle>>>`

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
