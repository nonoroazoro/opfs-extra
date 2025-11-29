# mkdir(path)

Creates a directory, _creates parent directories automatically if needed._

## Signature

```typescript
/**
 * @param {string} path Directory path relative to the root directory.
 *
 * @throws
 */
mkdir(path: string): Promise<void>
```

## Example

```typescript
const opfs = await OPFS.open();

await opfs.mkdir("/data");
await opfs.mkdir("/data/subfolder");
await opfs.mkdir("/data/nested/deep/folder"); // Creates all parent directories
```
