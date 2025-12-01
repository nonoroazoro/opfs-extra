# writeJSON(path, data, options?)

Writes JSON data to a file, _creates file and parent directories automatically if needed._

## Signature

```typescript
/**
 * @param {string} path File path relative to the root directory.
 * @param {unknown} data Data to write.
 * @param {({ pretty?: boolean; } & FileSystemCreateWritableOptions)} [options] Options for writing file.
 *
 * @throws
 */
writeJSON(path: string, data: unknown, options?: { pretty?: boolean } & FileSystemCreateWritableOptions): Promise<void>
```

## Example

```typescript
const opfs = await OPFS.open();

const data = { name: "example", version: "1.0.0" };

// Compact format
await opfs.writeJSON("/data/config.json", data);

// Pretty format
await opfs.writeJSON("/data/config.json", data, { pretty: true });
```
