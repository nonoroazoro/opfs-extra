# mkdir(path)

Creates a directory, _creates parent directories automatically if needed._

## Parameters

- `path` `<string>`: Directory path relative to the root directory

## Example

```typescript
const opfs = await OPFS.open();

await opfs.mkdir("/data");
await opfs.mkdir("/data/subfolder");
await opfs.mkdir("/data/nested/deep/folder"); // Creates all parent directories
```
