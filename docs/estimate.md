# estimate()

Estimates storage usage and quota.

## Signature

```typescript
estimate(): Promise<StorageEstimate>
```

## Example

```typescript
const opfs = await OPFS.open();

const { usage, quota } = await opfs.estimate();

console.log(`Using ${usage} bytes of ${quota} bytes`);
```
