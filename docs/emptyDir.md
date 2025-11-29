# emptyDir(path)

Empties a directory by deleting all its contents while keeping the directory itself, _creates directory automatically if needed._

## Parameters

- `path` `<string>`: Directory path relative to the root directory

## Example

```typescript
const opfs = await OPFS.open();

await opfs.writeFile("/data/file1.txt", "content");
await opfs.writeFile("/data/file2.txt", "content");

await opfs.emptyDir("/data");

const files = await opfs.readdir("/data");
console.log(files); // []
```
