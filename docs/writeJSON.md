# writeJSON(path, data[, options])

Writes JSON data to a file, _creates file and parent directories automatically if needed._

## Parameters

- `path` `<string>`: File path relative to the root directory
- `data` `<unknown>`: Data to write
- `options` `<object>`: _[Optional]_ Options for writing file

## Example

```typescript
const opfs = await OPFS.open();

const data = { name: "example", version: "1.0.0" };

// Compact format
await opfs.writeJSON("/data/config.json", data);

// Pretty format
await opfs.writeJSON("/data/config.json", data, { pretty: true });
```
