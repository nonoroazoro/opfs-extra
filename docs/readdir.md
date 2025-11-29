# readdir(path)

Lists directory contents as names.

## Parameters

- `path` `<string>`: Directory path relative to the root directory

## Returns

- `<Promise<string[]>>`: Array of file and directory names

## Example

```typescript
const opfs = await OPFS.open();

await opfs.writeFile("/data/file1.txt", "content");
await opfs.writeFile("/data/file2.txt", "content");
await opfs.mkdir("/data/subfolder");

const names = await opfs.readdir("/data");
console.log(names); // ["file1.txt", "file2.txt", "subfolder"]
```
