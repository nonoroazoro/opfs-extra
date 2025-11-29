<h1 align="center">opfs-extra</h1>
<p align="center"><b>opfs-extra</b> brings the user-friendly API to <a href="https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system">OPFS</a>, just like <a href="https://github.com/jprichardson/node-fs-extra">fs-extra</a></p>
<p align="center">
    <a href="https://github.com/nonoroazoro/opfs-extra/blob/master/LICENSE">
        <img src="https://img.shields.io/npm/l/opfs-extra.svg" alt="GitHub License" />
    </a>
    <a href="https://www.npmjs.com/package/opfs-extra">
        <img src="https://img.shields.io/npm/dw/opfs-extra.svg" alt="NPM Downloads" />
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

// Directory: Create
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

- **[open](docs/open.md)** - Opens access to the Origin Private File System

### Storage

- **`root`** - Gets the root directory handle
- **[estimate()](docs/estimate.md)** - Estimates storage usage and quota

### Handles

- **[getFileHandle(path, options?)](docs/getFileHandle.md)** - Gets a file handle
- **[getDirectoryHandle(path, options?)](docs/getDirectoryHandle.md)** - Gets a directory handle

### File Reading

- **[readBinary(path)](docs/readBinary.md)** - Reads a file as an ArrayBuffer
- **[readText(path, encoding?)](docs/readText.md)** - Reads a file as plain text
- **[readJSON(path, encoding?)](docs/readJSON.md)** - Reads a file as a JSON Object
- **[readJSONL(path, encoding?)](docs/readJSONL.md)** - Reads a file as JSON lines (JSON Array)

### File Writing

_Methods will create file and parent directories automatically if needed._

- **[writeFile(path, data, options?)](docs/writeFile.md)** - Writes data to a file
- **[writeJSON(path, data, options?)](docs/writeJSON.md)** - Writes JSON data to a file
- **[appendFile(path, data)](docs/appendFile.md)** - Appends data to a file
- **[appendJSONL(path, data)](docs/appendJSONL.md)** - Appends JSON data as JSON Line format
- **[createAppendable(path)](docs/createAppendable.md)** - Creates a writable stream ready for high-performance appending
- **[truncate(path, size)](docs/truncate.md)** - Truncates a file to a specified size

### Directory

- **[mkdir(path)](docs/mkdir.md)** - Creates a directory _(creates directories if needed)_
- **[emptyDir(path)](docs/emptyDir.md)** - Empties a directory _(creates directories if needed)_
- **[readdir(path)](docs/readdir.md)** - Lists directory contents as names
- **[readdirHandles(path)](docs/readdirHandles.md)** - Lists directory contents as handles

### Path

- **[exists(path)](docs/exists.md)** - Tests whether a file or directory exists
- **[remove(path)](docs/remove.md)** - Removes a file or directory recursively
