<h1 align="center">opfs-extra</h1>
<p align="center"><b>opfs-extra</b> brings the user-friendly API to <a href="https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system">OPFS</a>, just like <a href="https://github.com/jprichardson/node-fs-extra">fs-extra</a></p>
<p align="center">
    <a href="https://github.com/nonoroazoro/opfs-extra/actions/workflows/ci.yml">
        <img src="https://github.com/nonoroazoro/opfs-extra/actions/workflows/ci.yml/badge.svg" alt="GitHub CI" />
    </a>
    <a href="https://github.com/nonoroazoro/opfs-extra/blob/master/LICENSE">
        <img src="https://img.shields.io/npm/l/opfs-extra" alt="NPM License" />
    </a>
    <a href="https://www.npmjs.com/package/opfs-extra">
        <img src="https://img.shields.io/npm/dw/opfs-extra" alt="NPM Downloads" />
    </a>
</p>

## Installation

```bash
npm i opfs-extra
```

## Usage

```typescript
import { OPFS } from "opfs-extra";

// Initialization
const opfs = await OPFS.open();

// Directory Creating
await opfs.mkdir("/data");

// File Writing
await opfs.writeFile("/data/hello.txt", "Hello World");
await opfs.writeJSON("/data/hello.json", { text: "Hello World" });

// File Reading
const text = await opfs.readText("/data/hello.txt"); // "Hello World"
const json = await opfs.readJSON("/data/hello.json"); // { text: "Hello World" }

// Directory Reading
const files = await opfs.readdir("/data"); // ["hello.txt", "hello.json"]

// Exists
await opfs.exists("/data/hello.json"); // true

// Remove
await opfs.remove("/data");
```

## API Reference

### Initialization

- **[open](docs/open.md)** - Opens access to the Origin Private File System.

### Storage

- **root** - Gets the handle to the root directory of the Origin Private File System.
- **[estimate](docs/estimate.md)** - Estimates storage usage and quota.

### Handles

- **[getFileHandle](docs/getFileHandle.md)** - Gets a handle to a file.
- **[getDirectoryHandle](docs/getDirectoryHandle.md)** - Gets a handle to a directory.

### File Reading

- **[readBinary](docs/readBinary.md)** - Reads a file as an ArrayBuffer.
- **[readText](docs/readText.md)** - Reads a file as plain text.
- **[readJSON](docs/readJSON.md)** - Reads a file as a JSON Object.
- **[readJSONL](docs/readJSONL.md)** - Reads a JSONL file as a JSON Array.

### File Writing

> _These methods will create file and parent directories automatically if needed._

- **[writeFile](docs/writeFile.md)** - Writes data to a file.
- **[writeJSON](docs/writeJSON.md)** - Writes JSON data to a file.
- **[appendFile](docs/appendFile.md)** - Appends data to a file.
- **[appendJSONL](docs/appendJSONL.md)** - Appends JSON data to a JSONL file.
- **[createAppendable](docs/createAppendable.md)** - Creates a writable stream ready for high-performance appending.
- **[truncate](docs/truncate.md)** - Truncates a file to a specified size.

### Directory

- **[mkdir](docs/mkdir.md)** - Creates a directory _(creates directories if needed)._
- **[emptyDir](docs/emptyDir.md)** - Empties a directory _(creates directories if needed)._
- **[readdir](docs/readdir.md)** - Reads the directory contents as names.
- **[readdirHandles](docs/readdirHandles.md)** - Reads the directory contents as handles.

### Path

- **[exists](docs/exists.md)** - Tests whether a file or directory exists.
- **[remove](docs/remove.md)** - Removes a file or directory recursively.
