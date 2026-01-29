import loader from "@monaco-editor/loader";
import { OPFS } from "opfs-extra";

import opfsDts from "./node_modules/opfs-extra/dist/types/OPFS.d.ts?raw";

import type * as Monaco from "monaco-editor";

import "./style.css";

declare const lucide: { createIcons: () => void; } | undefined;

// Types
interface Example
{
    title: string;
    code: string;
}

interface ExampleGroup
{
    group: string;
    icon: string;
    items: Example[];
}

interface TreeNode
{
    name: string;
    isDir: boolean;
    children: TreeNode[];
}

type LogType = "error" | "info" | "success" | "warn";

// Constants
const LOG_COLORS: Record<LogType, string> = {
    info: "text-cyan-400",
    success: "text-green-400",
    error: "text-red-400",
    warn: "text-yellow-400"
};

const EXAMPLE_GROUPS: ExampleGroup[] = [
    {
        group: "Basic Read & Write",
        icon: "file-text",
        items: [
            {
                title: "Write & Read Text",
                code: `const opfs = await OPFS.open();

// Write text file
await opfs.writeFile("/hello.txt", "Hello, OPFS!");

// Read it back
const content = await opfs.readText("/hello.txt");
console.log("Content:", content);`
            },
            {
                title: "Write & Read JSON",
                code: `const opfs = await OPFS.open();

const data = {
    name: "opfs-extra",
    version: "1.0.0",
    features: ["read", "write", "append"]
};

await opfs.writeJSON("/config.json", data);

const loaded = await opfs.readJSON("/config.json");
console.log("Loaded JSON:", loaded);`
            },
            {
                title: "Binary Data",
                code: `const opfs = await OPFS.open();

// Create binary data
const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"

await opfs.writeFile("/binary.bin", data);

// Read as binary
const binary = await opfs.readBinary("/binary.bin");
console.log("Binary:", binary);

// Convert to string
const text = new TextDecoder().decode(binary);
console.log("As text:", text);`
            }
        ]
    },
    {
        group: "Append & Stream",
        icon: "file-plus",
        items: [
            {
                title: "Append File",
                code: `const opfs = await OPFS.open();

// appendFile creates file automatically if needed
await opfs.appendFile("/data/log.txt", "Line 1\\n");
await opfs.appendFile("/data/log.txt", "Line 2\\n");
await opfs.appendFile("/data/log.txt", "Line 3\\n");

const content = await opfs.readText("/data/log.txt");
console.log("Content:\\n" + content);`
            },
            {
                title: "JSONL Operations",
                code: `const opfs = await OPFS.open();

// Write multiple JSON lines
const logs = [
    { time: Date.now(), event: "start" },
    { time: Date.now() + 100, event: "process" },
    { time: Date.now() + 200, event: "end" }
];

for (const log of logs) {
    await opfs.appendJSONL("/logs.jsonl", log);
}

// Read all lines
const allLogs = await opfs.readJSONL("/logs.jsonl");
console.log("All logs:", allLogs);`
            },
            {
                title: "Appendable Stream",
                code: `const opfs = await OPFS.open();

// Create appendable stream for high-performance writes
const appendable = await opfs.createAppendable("/stream.log");

// Write multiple chunks efficiently
await appendable.write("Line 1\\n");
await appendable.write("Line 2\\n");
await appendable.write("Line 3\\n");

// Always close the stream when done
await appendable.close();

// Read the result
const content = await opfs.readText("/stream.log");
console.log("Stream content:\\n" + content);`
            }
        ]
    },
    {
        group: "Directory Operations",
        icon: "folder-open",
        items: [
            {
                title: "Create & List Directory",
                code: `const opfs = await OPFS.open();

// Create nested directories
await opfs.mkdir("/projects/demo/src");

// Write some files
await opfs.writeFile("/projects/demo/README.md", "# Demo");
await opfs.writeFile("/projects/demo/src/index.ts", "export {}");

// List directory contents (names only)
const files = await opfs.readdir("/projects/demo");
console.log("Files in /projects/demo:", files);

const srcFiles = await opfs.readdir("/projects/demo/src");
console.log("Files in src:", srcFiles);`
            },
            {
                title: "Read Directory Handles",
                code: `const opfs = await OPFS.open();

await opfs.writeFile("/data/file.txt", "content");
await opfs.mkdir("/data/subfolder");

// Get handles for more control
const handles = await opfs.readdirHandles("/data");
for (const handle of handles) {
    console.log(\`\${handle.kind}: \${handle.name}\`);
}

// You can use handles for advanced operations
const fileHandle = handles.find(h => h.kind === "file");
if (fileHandle) {
    const file = await fileHandle.getFile();
    console.log("File size:", file.size, "bytes");
}`
            },
            {
                title: "Empty Directory",
                code: `const opfs = await OPFS.open();

// Create directory with files
await opfs.mkdir("/cache");
await opfs.writeFile("/cache/a.txt", "a");
await opfs.writeFile("/cache/b.txt", "b");
await opfs.mkdir("/cache/sub");
await opfs.writeFile("/cache/sub/c.txt", "c");

console.log("Before:", await opfs.readdir("/cache"));

// Empty the directory (keeps the directory itself)
await opfs.emptyDir("/cache");

console.log("After:", await opfs.readdir("/cache"));
console.log("Directory still exists:", await opfs.exists("/cache"));`
            }
        ]
    },
    {
        group: "File Management",
        icon: "settings-2",
        items: [
            {
                title: "Check Existence",
                code: `const opfs = await OPFS.open();

await opfs.writeFile("/test.txt", "test");
await opfs.mkdir("/testdir");

console.log("/test.txt exists:", await opfs.exists("/test.txt"));
console.log("/testdir exists:", await opfs.exists("/testdir"));
console.log("/nonexistent exists:", await opfs.exists("/nonexistent"));`
            },
            {
                title: "Remove Files & Directories",
                code: `const opfs = await OPFS.open();

// Create some files
await opfs.mkdir("/to-delete");
await opfs.writeFile("/to-delete/file1.txt", "1");
await opfs.writeFile("/to-delete/file2.txt", "2");

console.log("Before:", await opfs.readdir("/to-delete"));

// Remove single file
await opfs.remove("/to-delete/file1.txt");
console.log("After removing file1:", await opfs.readdir("/to-delete"));

// Remove entire directory (recursive)
await opfs.remove("/to-delete");
console.log("Directory exists:", await opfs.exists("/to-delete"));`
            },
            {
                title: "Truncate File",
                code: `const opfs = await OPFS.open();

await opfs.writeFile("/data/file.txt", "Hello World");
console.log("Before:", await opfs.readText("/data/file.txt"));

// Truncate to 5 bytes
await opfs.truncate("/data/file.txt", 5);

const content = await opfs.readText("/data/file.txt");
console.log("After truncate(5):", content);

// Truncate to 0 to clear file
await opfs.truncate("/data/file.txt", 0);
console.log("After truncate(0):", await opfs.readText("/data/file.txt"));`
            }
        ]
    },
    {
        group: "Low-level API",
        icon: "code",
        items: [
            {
                title: "Get File Handle",
                code: `const opfs = await OPFS.open();

// Create file first
await opfs.writeFile("/data/file.txt", "Hello World");

// Get existing file handle
const handle = await opfs.getFileHandle("/data/file.txt");
console.log("Handle name:", handle.name);

// Get File object from handle
const file = await handle.getFile();
console.log("File size:", file.size);
console.log("File type:", file.type);

// Create file if it doesn't exist
const newHandle = await opfs.getFileHandle("/data/new.txt", { create: true });
console.log("New handle created:", newHandle.name);`
            },
            {
                title: "Get Directory Handle",
                code: `const opfs = await OPFS.open();

// Create directory first
await opfs.mkdir("/mydir");

// Get existing directory handle
const handle = await opfs.getDirectoryHandle("/mydir");
console.log("Handle name:", handle.name);
console.log("Handle kind:", handle.kind);

// Create directory if it doesn't exist
const newHandle = await opfs.getDirectoryHandle("/newdir/sub", { create: true });
console.log("New handle created:", newHandle.name);

// Use handle to create file directly
const fileHandle = await newHandle.getFileHandle("test.txt", { create: true });
console.log("File created via handle:", fileHandle.name);`
            }
        ]
    },
    {
        group: "System Info",
        icon: "hard-drive",
        items: [
            {
                title: "Storage Estimate",
                code: `const opfs = await OPFS.open();

const estimate = await opfs.estimate();
const usedMB = (estimate.usage / 1024 / 1024).toFixed(2);
const quotaMB = (estimate.quota / 1024 / 1024).toFixed(2);

console.log(\`Used: \${usedMB} MB\`);
console.log(\`Quota: \${quotaMB} MB\`);
console.log(\`Usage: \${((estimate.usage / estimate.quota) * 100).toFixed(4)}%\`);`
            }
        ]
    }
];

// Flatten examples for easy access by index
const ALL_EXAMPLES = EXAMPLE_GROUPS.flatMap(g => g.items);

// Helper to get DOM element with type safety
function $(id: string): HTMLElement
{
    const el = document.getElementById(id);
    if (!el)
    {
        throw new Error(`Element #${id} not found`);
    }
    return el;
}

// Module state
let editor: Monaco.editor.IStandaloneCodeEditor | null = null;
let opfs: null | OPFS = null;
const output = $("output") as HTMLPreElement;
const examplesList = $("examples-list");
const fileTree = $("file-tree");

// Logging
function log(message: string, type: LogType = "info"): void
{
    const span = document.createElement("span");
    span.className = LOG_COLORS[type];
    span.textContent = `${message}\n`;
    output.appendChild(span);
    output.scrollTo({ top: output.scrollHeight, behavior: "smooth" });
}

function logSection(message: string, type: LogType = "info"): void
{
    const prefix = output.childNodes.length > 0 ? "\n" : "";
    log(`${prefix}${message}`, type);
}

function logError(message: string, error: unknown): void
{
    console.error(error);
    log(`${message}: ${String(error)}`, "error");
}

function clearOutput(): void
{
    output.innerHTML = "";
}

// Formatting
function formatValue(value: unknown): string
{
    if (value === null)
    {
        return "null";
    }
    if (value === undefined)
    {
        return "undefined";
    }

    if (value instanceof Uint8Array)
    {
        const preview = Array.from(value.slice(0, 10)).join(", ");
        const suffix = value.length > 10 ? ", ..." : "";
        return `Uint8Array(${value.length}) [${preview}${suffix}]`;
    }

    if (typeof value === "object")
    {
        return JSON.stringify(value, null, 2);
    }

    return String(value as unknown);
}

// File tree
async function buildFileTree(path: string): Promise<TreeNode>
{
    const handles = await opfs!.readdirHandles(path);
    const children: TreeNode[] = [];

    for (const handle of handles)
    {
        const childPath = path === "/" ? `/${handle.name}` : `${path}/${handle.name}`;

        if (handle.kind === "directory")
        {
            const subtree = await buildFileTree(childPath);
            children.push({ name: handle.name, isDir: true, children: subtree.children });
        }
        else
        {
            children.push({ name: handle.name, isDir: false, children: [] });
        }
    }

    return { name: path, isDir: true, children };
}

function refreshLucideIcons(): void
{
    lucide?.createIcons();
}

function renderTree(items: TreeNode[], container: HTMLElement, depth: number, parentPath = "/"): void
{
    for (const item of items)
    {
        const fullPath = parentPath === "/" ? `/${item.name}` : `${parentPath}/${item.name}`;

        const div = document.createElement("div");
        div.className = "py-1 px-2 hover:bg-slate-700/50 rounded cursor-default flex items-center gap-2 group";
        div.style.paddingLeft = `${(depth * 16) + 8}px`;

        const iconName = item.isDir ? "folder" : "file";
        const iconColor = item.isDir ? "text-amber-400" : "text-slate-400";
        const viewBtn = item.isDir
            ? ""
            : `
            <button class="cursor-pointer opacity-0 group-hover:opacity-100 ml-auto p-1 hover:bg-slate-600 rounded transition-opacity" title="View file content">
                <i data-lucide="eye" class="w-3 h-3 text-slate-400"></i>
            </button>`;

        div.innerHTML = `
            <i data-lucide="${iconName}" class="w-4 h-4 ${iconColor} shrink-0"></i>
            <span class="truncate flex-1">${item.name}</span>
            ${viewBtn}`;
        container.appendChild(div);

        if (!item.isDir)
        {
            div.querySelector("button")?.addEventListener("click", e =>
            {
                e.stopPropagation();
                viewFileContent(fullPath).catch(() =>
                {});
            });
        }

        if (item.isDir && item.children.length > 0)
        {
            renderTree(item.children, container, depth + 1, fullPath);
        }
    }

    if (depth === 0)
    {
        refreshLucideIcons();
    }
}

async function refreshFileTree(): Promise<void>
{
    if (!opfs)
    {
        fileTree.innerHTML = '<div class="text-gray-500 italic p-2">OPFS not initialized</div>';
        return;
    }

    try
    {
        const tree = await buildFileTree("/");
        fileTree.innerHTML = "";

        if (tree.children.length === 0)
        {
            fileTree.innerHTML = '<div class="text-gray-500 italic p-2">No files yet</div>';
        }
        else
        {
            renderTree(tree.children, fileTree, 0);
        }
    }
    catch (e)
    {
        fileTree.innerHTML = `<div class="text-red-400 p-2">Error: ${e}</div>`;
    }
}

async function viewFileContent(path: string): Promise<void>
{
    if (!opfs)
    {
        return;
    }

    try
    {
        const content = await opfs.readText(path);
        logSection(`--- ${path} ---`);
        log(content);
    }
    catch (e)
    {
        logError(`Failed to read ${path}`, e);
    }
}

async function clearAllFiles(silent = false): Promise<void>
{
    if (!opfs)
    {
        return;
    }

    try
    {
        await opfs.emptyDir("/");
        if (!silent)
        {
            log("All files cleared", "success");
        }
        await refreshFileTree();
    }
    catch (e)
    {
        logError("Failed to clear files", e);
    }
}

// Code execution
async function runCode(): Promise<void>
{
    const clearCheckbox = document.getElementById("clear-before-run") as HTMLInputElement;
    if (clearCheckbox?.checked)
    {
        clearOutput();
        await clearAllFiles(true);
    }

    const code = editor?.getValue() ?? "";
    logSection("--- Running ---");

    try
    {
        const AsyncFunction = Object.getPrototypeOf(async () =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        {}).constructor as new(arg: string, body: string) => (opfs: typeof OPFS) => Promise<void>;
        const fn = new AsyncFunction("OPFS", code);
        await fn(OPFS);
        log("--- Done ---");
    }
    catch (e)
    {
        logError("Error", e);
    }

    await refreshFileTree();
}

// Examples
function loadExample(index: number): void
{
    const example = ALL_EXAMPLES[index];
    editor?.setValue(example.code);

    examplesList.querySelectorAll(".example-item").forEach(item =>
    {
        const el = item as HTMLElement;
        const isSelected = el.dataset.index === String(index);
        el.classList.toggle("bg-slate-700/50", isSelected);
        el.classList.toggle("border-l-cyan-400", isSelected);
        el.classList.toggle("border-l-transparent", !isSelected);
    });
}

function setupExamples(): void
{
    let globalIndex = 0;

    for (const group of EXAMPLE_GROUPS)
    {
        const header = document.createElement("div");
        header.className =
            "px-3 py-2 text-xs font-semibold text-slate-300 uppercase tracking-wider bg-slate-900/80 border-b border-slate-700/50 flex items-center gap-1.5 sticky top-0";
        header.innerHTML =
            `<i data-lucide="${group.icon}" class="w-3 h-3 text-slate-400"></i><span>${group.group}</span>`;
        examplesList.appendChild(header);

        for (const example of group.items)
        {
            const item = document.createElement("div");
            item.className =
                "example-item pl-6 pr-4 py-2 cursor-pointer hover:bg-slate-700/50 border-b border-slate-700/50 last:border-b-0 text-sm border-l-2 border-l-transparent";
            item.textContent = example.title;
            item.dataset.index = String(globalIndex);
            item.addEventListener("click", () =>
            {
                loadExample(Number(item.dataset.index));
            });
            examplesList.appendChild(item);
            globalIndex++;
        }
    }

    refreshLucideIcons();
}

// Setup
function setupModifierKey(): void
{
    const isMac = /mac/i.test(navigator.userAgent);
    const el = document.getElementById("modifier-key");
    if (el)
    {
        el.textContent = isMac ? "⌘" : "Ctrl";
    }
}

function interceptConsole(): void
{
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    // eslint-disable-next-line no-console
    console.log = (...args) =>
    {
        originalLog.apply(console, args);
        log(args.map(a => formatValue(a)).join(" "), "info");
    };

    // eslint-disable-next-line no-console
    console.error = (...args) =>
    {
        originalError.apply(console, args);
        log(args.map(a => formatValue(a)).join(" "), "error");
    };

    // eslint-disable-next-line no-console
    console.warn = (...args) =>
    {
        originalWarn.apply(console, args);
        log(args.map(a => formatValue(a)).join(" "), "warn");
    };
}

function setupEventListeners(): void
{
    $("run-btn").addEventListener("click", () =>
    {
        runCode().catch(() =>
        {});
    });
    $("clear-btn").addEventListener("click", () =>
    {
        clearOutput();
    });
    $("clear-files-btn").addEventListener("click", () =>
    {
        clearAllFiles().catch(() =>
        {});
    });
}

async function initMonaco(): Promise<void>
{
    const monaco = await loader.init();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const tsDefaults = (monaco.languages as any).typescript.typescriptDefaults;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    tsDefaults.setDiagnosticsOptions({ diagnosticCodesToIgnore: [1375, 1378] });

    // Add OPFS type definitions for code completion
    const globalTypes = opfsDts.replace(/export declare class/g, "declare class");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    tsDefaults.addExtraLib(globalTypes);

    monaco.editor.defineTheme("playground-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: { "editor.background": "#1f2937" }
    });

    editor = monaco.editor.create($("editor-container"), {
        value: "",
        language: "typescript",
        theme: "playground-dark",
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 4,
        padding: { top: 12, bottom: 12 }
    });

    // Cmd/Ctrl + Enter to run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () =>
    {
        runCode().catch(() =>
        {});
    });
}

async function initOPFS(): Promise<void>
{
    try
    {
        opfs = await OPFS.open();
        log("OPFS initialized", "success");
        await refreshFileTree();
    }
    catch (e)
    {
        logError("Failed to initialize OPFS", e);
    }
}

async function main(): Promise<void>
{
    setupModifierKey();
    await initMonaco();
    setupExamples();
    setupEventListeners();
    interceptConsole();
    loadExample(0);
    await initOPFS();

    requestAnimationFrame(() =>
    {
        document.body.classList.remove("preload");
    });
}

main().catch(e =>
{
    document.body.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #e2e8f0; font-family: system-ui, -apple-system, sans-serif; padding: 2rem; text-align: center;">
            <div style="max-width: 480px; display: flex; flex-direction: column; align-items: center;">
                <svg style="width: 64px; height: 64px; margin-bottom: 1.5rem; color: #f87171;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <h1 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.75rem; color: #f87171;">Oops! Something went wrong</h1>
                <p style="color: #94a3b8; margin-bottom: 1.5rem; line-height: 1.6;">
                    This might be due to browser compatibility issues or missing features.
                </p>
                <div style="width: 100%; text-align: left; background: #1e293b; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; border: 1px solid #334155;">
                    <div style="color: #94a3b8; font-size: 0.75rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">Error</div>
                    <pre style="color: #f87171; font-size: 0.8rem; overflow-x: auto; white-space: pre-wrap; word-break: break-all; margin: 0;">${String(e)}</pre>
                </div>
                <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
                    <button onclick="location.reload()" style="background: #3b82f6; color: white; border: none; padding: 0.625rem 1.25rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-weight: 500;">
                        Try Again
                    </button>
                    <a href="https://github.com/nonoroazoro/opfs-extra/issues" target="_blank" style="background: transparent; color: #94a3b8; border: 1px solid #475569; padding: 0.625rem 1.25rem; border-radius: 6px; text-decoration: none; font-size: 0.875rem; font-weight: 500;">
                        Report Issue
                    </a>
                </div>
            </div>
        </div>
    `;
});
