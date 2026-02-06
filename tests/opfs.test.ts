import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { OPFS } from "../src/OPFS";

describe("OPFS", () =>
{
    let opfs: OPFS;

    beforeEach(async () =>
    {
        opfs = await OPFS.open();
    });

    afterEach(async () =>
    {
        // Clean up
        await opfs.remove("test-dir");
        await opfs.remove("test-file.txt");
        await opfs.remove("test.json");
        await opfs.remove("test.jsonl");
    });

    describe("singleton pattern", () =>
    {
        it("should return the same instance on multiple calls", async () =>
        {
            const instance1 = await OPFS.open();
            const instance2 = await OPFS.open();
            expect(instance1).toBe(instance2);
        });

        it("should provide access to root directory", async () =>
        {
            const root = opfs.root;
            expect(root).toBeDefined();
            expect(root.kind).toBe("directory");
        });
    });

    describe("storage estimation", () =>
    {
        it("should return storage estimate", async () =>
        {
            const estimate = await opfs.estimate();
            expect(estimate).toBeDefined();
            expect(typeof estimate.usage).toBe("number");
            expect(typeof estimate.quota).toBe("number");
        });
    });

    describe("file operations", () =>
    {
        it("should write and read binary data", async () =>
        {
            const data = new Uint8Array([1, 2, 3, 4, 5]);
            await opfs.writeFile("test-file.txt", data);

            const result = await opfs.readBinary("test-file.txt");
            const resultArray = new Uint8Array(result);

            expect(resultArray.length).toBe(5);
            expect(resultArray[0]).toBe(1);
            expect(resultArray[4]).toBe(5);
        });

        it("should write and read text", async () =>
        {
            const text = "Hello, OPFS!";
            await opfs.writeFile("test-file.txt", text);

            const result = await opfs.readText("test-file.txt");
            expect(result).toBe(text);
        });

        it("should write and read JSON", async () =>
        {
            const data = { name: "test", value: 42, nested: { flag: true } };
            await opfs.writeJSON("test.json", data);

            const result = await opfs.readJSON("test.json");
            expect(result).toEqual(data);
        });

        it("should write JSON with pretty formatting", async () =>
        {
            const data = { name: "test", value: 42 };
            await opfs.writeJSON("test.json", data, { pretty: true });

            const text = await opfs.readText("test.json");
            expect(text).toContain("\n");
            expect(text).toContain("  ");
        });

        it("should append to file", async () =>
        {
            await opfs.writeFile("test-file.txt", "Hello");
            await opfs.appendFile("test-file.txt", " World");

            const result = await opfs.readText("test-file.txt");
            expect(result).toBe("Hello World");
        });

        it("should create file when appending to non-existent file", async () =>
        {
            await opfs.appendFile("new-file.txt", "first line\n");

            const result = await opfs.readText("new-file.txt");
            expect(result).toBe("first line\n");

            await opfs.remove("new-file.txt");
        });

        it("should truncate file to smaller size", async () =>
        {
            await opfs.writeFile("test-file.txt", "Hello World");
            await opfs.truncate("test-file.txt", 5);

            const result = await opfs.readText("test-file.txt");
            expect(result).toBe("Hello");
        });

        it("should truncate file to zero", async () =>
        {
            await opfs.writeFile("test-file.txt", "Some content");
            await opfs.truncate("test-file.txt", 0);

            const result = await opfs.readText("test-file.txt");
            expect(result).toBe("");
        });

        it("should truncate non-existent file to create it", async () =>
        {
            await opfs.truncate("new-truncated.txt", 10);

            const binary = await opfs.readBinary("new-truncated.txt");
            const view = new Uint8Array(binary);

            expect(binary.byteLength).toBe(10);
            expect(view.every(byte => byte === 0)).toBe(true);

            await opfs.remove("new-truncated.txt");
        });

        it("should handle JSONL operations", async () =>
        {
            const data1 = { id: 1, name: "first" };
            const data2 = { id: 2, name: "second" };
            const data3 = { id: 3, name: "third" };

            await opfs.appendJSONL("test.jsonl", data1);
            await opfs.appendJSONL("test.jsonl", data2);
            await opfs.appendJSONL("test.jsonl", data3);

            const result = await opfs.readJSONL("test.jsonl");
            expect(result).toEqual([data1, data2, data3]);
        });

        it("should handle JSONL with empty lines", async () =>
        {
            const text = '{"id":1}\n\n{"id":2}\n  \n{"id":3}\n';
            await opfs.writeFile("test.jsonl", text);

            const result = await opfs.readJSONL("test.jsonl");
            expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
        });

        it("should handle JSONL with different line endings", async () =>
        {
            const text = '{"id":1}\r\n{"id":2}\n{"id":3}\r\n';
            await opfs.writeFile("test.jsonl", text);

            const result = await opfs.readJSONL("test.jsonl");
            expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
        });

        it("should return empty array for empty JSONL file", async () =>
        {
            await opfs.writeFile("test.jsonl", "");

            const result = await opfs.readJSONL("test.jsonl");
            expect(result).toEqual([]);
        });

        it("should throw on invalid JSON in JSONL", async () =>
        {
            const text = '{"id":1}\n{invalid json}\n{"id":3}\n';
            await opfs.writeFile("test.jsonl", text);

            await expect(opfs.readJSONL("test.jsonl")).rejects.toThrow();
        });
    });

    describe("directory operations", () =>
    {
        it("should create directory", async () =>
        {
            await opfs.mkdir("test-dir");
            const exists = await opfs.exists("test-dir");
            expect(exists).toBe(true);
        });

        it("should create nested directories", async () =>
        {
            await opfs.mkdir("test-dir/nested/deep");
            const exists = await opfs.exists("test-dir/nested/deep");
            expect(exists).toBe(true);
        });

        it("should list directory contents", async () =>
        {
            await opfs.mkdir("test-dir");
            await opfs.writeFile("test-dir/file1.txt", "content1");
            await opfs.writeFile("test-dir/file2.txt", "content2");
            await opfs.mkdir("test-dir/subdir");

            const names = await opfs.readdir("test-dir");
            expect(names).toContain("file1.txt");
            expect(names).toContain("file2.txt");
            expect(names).toContain("subdir");
            expect(names.length).toBe(3);
        });

        it("should list directory handles", async () =>
        {
            await opfs.mkdir("test-dir");
            await opfs.writeFile("test-dir/file.txt", "content");
            await opfs.mkdir("test-dir/subdir");

            const handles = await opfs.readdirHandles("test-dir");
            expect(handles.length).toBe(2);

            const kinds = handles.map(h => h.kind);
            expect(kinds).toContain("file");
            expect(kinds).toContain("directory");
        });

        it("should return usable file handles from readdirHandles", async () =>
        {
            await opfs.mkdir("test-dir");
            await opfs.writeFile("test-dir/file.txt", "test content");

            const handles = await opfs.readdirHandles("test-dir");
            const fileHandle = handles.find(h => h.kind === "file");

            expect(fileHandle).toBeDefined();
            expect(fileHandle!.kind).toBe("file");

            const file = await fileHandle!.getFile();
            const text = await file.text();
            expect(text).toBe("test content");
        });

        it("should empty directory", async () =>
        {
            await opfs.mkdir("test-dir");
            await opfs.writeFile("test-dir/file1.txt", "content");
            await opfs.writeFile("test-dir/file2.txt", "content");
            await opfs.mkdir("test-dir/subdir");

            await opfs.emptyDir("test-dir");

            const names = await opfs.readdir("test-dir");
            expect(names.length).toBe(0);
        });

        it("should create directory if not exists when emptying", async () =>
        {
            await opfs.emptyDir("test-dir");
            const exists = await opfs.exists("test-dir");
            expect(exists).toBe(true);
        });
    });

    describe("path handling", () =>
    {
        it("should handle root path", async () =>
        {
            const handle = await opfs.getDirectoryHandle("/");
            expect(handle).toBe(opfs.root);
        });

        it("should handle leading slash", async () =>
        {
            await opfs.mkdir("/test-dir");
            const exists = await opfs.exists("test-dir");
            expect(exists).toBe(true);
        });

        it("should handle trailing slash", async () =>
        {
            await opfs.mkdir("test-dir/");
            const exists = await opfs.exists("test-dir");
            expect(exists).toBe(true);
        });

        it("should resolve .. segments", async () =>
        {
            await opfs.mkdir("test-dir/nested");
            await opfs.writeFile("test-dir/nested/../hello.txt", "hello");

            const exists = await opfs.exists("test-dir/hello.txt");
            expect(exists).toBe(true);

            const text = await opfs.readText("test-dir/nested/../hello.txt");
            expect(text).toBe("hello");
        });

        it("should clamp .. at root", async () =>
        {
            await opfs.writeFile("test-file.txt", "root file");

            const text = await opfs.readText("../../test-file.txt");
            expect(text).toBe("root file");
        });

        it("should resolve .. to root", async () =>
        {
            const handle = await opfs.getDirectoryHandle("..");
            expect(handle).toBe(opfs.root);
        });
    });

    describe("exists checks", () =>
    {
        it("should return true for existing file", async () =>
        {
            await opfs.writeFile("test-file.txt", "content");
            const exists = await opfs.exists("test-file.txt");
            expect(exists).toBe(true);
        });

        it("should return true for existing directory", async () =>
        {
            await opfs.mkdir("test-dir");
            const exists = await opfs.exists("test-dir");
            expect(exists).toBe(true);
        });

        it("should return false for non-existent path", async () =>
        {
            const exists = await opfs.exists("non-existent");
            expect(exists).toBe(false);
        });
    });

    describe("remove operations", () =>
    {
        it("should remove file", async () =>
        {
            await opfs.writeFile("test-file.txt", "content");
            await opfs.remove("test-file.txt");

            const exists = await opfs.exists("test-file.txt");
            expect(exists).toBe(false);
        });

        it("should remove empty directory", async () =>
        {
            await opfs.mkdir("test-dir");
            await opfs.remove("test-dir");

            const exists = await opfs.exists("test-dir");
            expect(exists).toBe(false);
        });

        it("should remove directory recursively", async () =>
        {
            await opfs.mkdir("test-dir/nested");
            await opfs.writeFile("test-dir/file.txt", "content");
            await opfs.writeFile("test-dir/nested/file.txt", "content");

            await opfs.remove("test-dir");

            const exists = await opfs.exists("test-dir");
            expect(exists).toBe(false);
        });

        it("should not throw when removing non-existent path", async () =>
        {
            await expect(opfs.remove("non-existent")).resolves.toBeUndefined();
        });

        it("should not remove root directory", async () =>
        {
            await opfs.remove("/");
            // Root should still exist
            const handle = await opfs.getDirectoryHandle("/");
            expect(handle).toBe(opfs.root);
        });
    });

    describe("error handling", () =>
    {
        it("should throw when reading non-existent file", async () =>
        {
            await expect(opfs.readText("non-existent.txt")).rejects.toThrow();
        });

        it("should throw when reading non-existent binary file", async () =>
        {
            await expect(opfs.readBinary("non-existent.bin")).rejects.toThrow();
        });

        it("should throw when reading invalid JSON", async () =>
        {
            await opfs.writeFile("test.json", "not valid json");
            await expect(opfs.readJSON("test.json")).rejects.toThrow();
        });

        it("should throw when getting file handle with invalid path", async () =>
        {
            await expect(opfs.getFileHandle("")).rejects.toThrow("File path is not valid");
        });

        it("should throw when reading directory as file", async () =>
        {
            await opfs.mkdir("test-dir");
            await expect(opfs.readText("test-dir")).rejects.toThrow();
        });
    });

    describe("appendable stream operations", () =>
    {
        it("should create appendable for new file", async () =>
        {
            const writable = await opfs.createAppendable("new-stream.txt");
            await writable.write("Line 1\n");
            await writable.write("Line 2\n");
            await writable.close();

            const content = await opfs.readText("new-stream.txt");
            expect(content).toBe("Line 1\nLine 2\n");

            await opfs.remove("new-stream.txt");
        });

        it("should append to existing file", async () =>
        {
            await opfs.writeFile("test-file.txt", "Initial\n");

            const writable = await opfs.createAppendable("test-file.txt");
            await writable.write("Appended\n");
            await writable.close();

            const content = await opfs.readText("test-file.txt");
            expect(content).toBe("Initial\nAppended\n");
        });

        it("should abort stream and discard writes", async () =>
        {
            await opfs.writeFile("test-file.txt", "Original\n");

            const writable = await opfs.createAppendable("test-file.txt");
            await writable.write("Should be discarded\n");
            await writable.abort();

            const content = await opfs.readText("test-file.txt");
            expect(content).toBe("Original\n");
        });

        it("should write binary data via appendable", async () =>
        {
            const buffer1 = new Uint8Array([1, 2, 3]);
            const buffer2 = new Uint8Array([4, 5, 6]);

            const writable = await opfs.createAppendable("binary.bin");
            await writable.write(buffer1);
            await writable.write(buffer2);
            await writable.close();

            const result = await opfs.readBinary("binary.bin");
            const view = new Uint8Array(result);

            expect(view).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6]));

            await opfs.remove("binary.bin");
        });
    });

    describe("E2E workflows", () =>
    {
        it("should handle complete CRUD workflow", async () =>
        {
            // Create
            await opfs.mkdir("test-dir/nested");
            await opfs.writeFile("test-dir/nested/data.json", JSON.stringify({ value: 42 }));

            // Read
            const exists = await opfs.exists("test-dir/nested/data.json");
            expect(exists).toBe(true);

            const content = await opfs.readJSON("test-dir/nested/data.json");
            expect(content).toEqual({ value: 42 });

            // Update
            await opfs.writeJSON("test-dir/nested/data.json", { value: 100 });
            const updated = await opfs.readJSON("test-dir/nested/data.json");
            expect(updated).toEqual({ value: 100 });

            // Delete
            await opfs.remove("test-dir");
            const existsAfterDelete = await opfs.exists("test-dir");
            expect(existsAfterDelete).toBe(false);
        });

        it("should handle log file workflow", async () =>
        {
            const logFile = "test-dir/app.log";

            // Create log directory
            await opfs.mkdir("test-dir");

            // Append multiple log entries
            await opfs.appendFile(logFile, "Log entry 1\n");
            await opfs.appendFile(logFile, "Log entry 2\n");
            await opfs.appendFile(logFile, "Log entry 3\n");

            // Read entire log
            const log = await opfs.readText(logFile);
            expect(log).toBe("Log entry 1\nLog entry 2\nLog entry 3\n");

            // Truncate log
            await opfs.truncate(logFile, 0);
            const truncated = await opfs.readText(logFile);
            expect(truncated).toBe("");
        });

        it("should handle JSONL streaming workflow", async () =>
        {
            interface Event
            {
                timestamp: number;
                type: string;
            }

            const events = "test-dir/events.jsonl";
            await opfs.mkdir("test-dir");

            // Stream multiple events
            const writable = await opfs.createAppendable(events);
            for (let i = 0; i < 5; i++)
            {
                const event = { timestamp: Date.now() + i, type: `event-${i}` };
                await writable.write(`${JSON.stringify(event)}\n`);
            }
            await writable.close();

            // Read all events
            const allEvents = await opfs.readJSONL<Event>(events);
            expect(allEvents.length).toBe(5);
            expect(allEvents[0].type).toBe("event-0");
            expect(allEvents[4].type).toBe("event-4");

            // Append more events
            await opfs.appendJSONL(events, { timestamp: Date.now(), type: "event-5" });

            const updated = await opfs.readJSONL<Event>(events);
            expect(updated.length).toBe(6);
        });
    });

    describe("performance", () =>
    {
        it("should demonstrate createAppendable is faster than repeated appendFile calls", async () =>
        {
            const iterations = 100;
            const testData = "x".repeat(100); // 100 bytes per write

            // Test appendFile performance
            const appendFileStart = performance.now();
            for (let i = 0; i < iterations; i++)
            {
                await opfs.appendFile("test-file.txt", testData);
            }
            const appendFileTime = performance.now() - appendFileStart;

            await opfs.remove("test-file.txt");

            // Test createAppendable performance
            const createAppendableStart = performance.now();
            const writable = await opfs.createAppendable("test-file.txt");
            for (let i = 0; i < iterations; i++)
            {
                await writable.write(testData);
            }
            await writable.close();
            const createAppendableTime = performance.now() - createAppendableStart;

            // Verify correctness
            const result = await opfs.readText("test-file.txt");
            expect(result.length).toBe(iterations * testData.length);

            // Verify createAppendable is faster than repeated appendFile calls
            expect(createAppendableTime).toBeLessThan(appendFileTime);
        });
    });

    describe("file handle options", () =>
    {
        it("should create file when using getFileHandle with create option", async () =>
        {
            const handle = await opfs.getFileHandle("new-file.txt", { create: true });
            expect(handle).toBeDefined();
            expect(handle.kind).toBe("file");

            await opfs.remove("new-file.txt");
        });

        it("should create directory when using getDirectoryHandle with create option", async () =>
        {
            const handle = await opfs.getDirectoryHandle("new-dir", { create: true });
            expect(handle).toBeDefined();
            expect(handle.kind).toBe("directory");

            await opfs.remove("new-dir");
        });

        it("should throw when getting non-existent file without create option", async () =>
        {
            await expect(opfs.getFileHandle("non-existent.txt")).rejects.toThrow();
        });

        it("should throw when getting non-existent directory without create option", async () =>
        {
            await expect(opfs.getDirectoryHandle("non-existent-dir")).rejects.toThrow();
        });

        it("should throw when getting non-existent file with create explicitly false", async () =>
        {
            await expect(opfs.getFileHandle("non-existent.txt", { create: false })).rejects.toThrow();
        });

        it("should throw when getting non-existent directory with create explicitly false", async () =>
        {
            await expect(opfs.getDirectoryHandle("non-existent-dir", { create: false })).rejects.toThrow();
        });
    });

    describe("edge cases and boundary conditions", () =>
    {
        it("should handle empty file for all read operations", async () =>
        {
            await opfs.writeFile("test-file.txt", "");

            const binary = await opfs.readBinary("test-file.txt");
            expect(binary.byteLength).toBe(0);

            const text = await opfs.readText("test-file.txt");
            expect(text).toBe("");
        });

        it("should handle large text file", async () =>
        {
            const largeText = "x".repeat(1024 * 1024); // 1MB
            await opfs.writeFile("test-file.txt", largeText);

            const result = await opfs.readText("test-file.txt");
            expect(result.length).toBe(1024 * 1024);
            expect(result).toBe(largeText);
        });

        it("should handle special characters in content", async () =>
        {
            const specialContent = "Hello 世界 🌍 \n\t\r Special chars: @#$%^&*()";
            await opfs.writeFile("test-file.txt", specialContent);

            const result = await opfs.readText("test-file.txt");
            expect(result).toBe(specialContent);
        });

        it("should handle paths with spaces", async () =>
        {
            await opfs.mkdir("test-dir/folder with spaces");
            await opfs.writeFile("test-dir/folder with spaces/file with spaces.txt", "content");

            const exists = await opfs.exists("test-dir/folder with spaces/file with spaces.txt");
            expect(exists).toBe(true);

            const content = await opfs.readText("test-dir/folder with spaces/file with spaces.txt");
            expect(content).toBe("content");
        });

        it("should handle deeply nested paths (10+ levels)", async () =>
        {
            const deepPath = "test-dir/a/b/c/d/e/f/g/h/i/j/deep-file.txt";
            await opfs.writeFile(deepPath, "deep content");

            const exists = await opfs.exists(deepPath);
            expect(exists).toBe(true);

            const content = await opfs.readText(deepPath);
            expect(content).toBe("deep content");
        });

        it("should handle truncate to extend file with null bytes", async () =>
        {
            await opfs.writeFile("test-file.txt", "Hi");
            await opfs.truncate("test-file.txt", 10);

            const binary = await opfs.readBinary("test-file.txt");
            expect(binary.byteLength).toBe(10);

            const array = new Uint8Array(binary);
            expect(array[0]).toBe(72); // 'H'
            expect(array[1]).toBe(105); // 'i'
            expect(array[2]).toBe(0); // null byte
            expect(array[9]).toBe(0); // null byte
        });

        it("should handle writeFile with Blob containing binary data", async () =>
        {
            const binaryData = new Uint8Array([0xFF, 0xFE, 0xFD, 0xFC]);
            const blob = new Blob([binaryData], { type: "application/octet-stream" });

            await opfs.writeFile("test-file.bin", blob);

            const result = await opfs.readBinary("test-file.bin");
            const resultArray = new Uint8Array(result);

            expect(resultArray).toEqual(binaryData);
        });

        it("should write ArrayBuffer directly", async () =>
        {
            const buffer = new ArrayBuffer(4);
            const view = new DataView(buffer);
            view.setUint8(0, 65); // 'A'
            view.setUint8(1, 66); // 'B'
            view.setUint8(2, 67); // 'C'
            view.setUint8(3, 68); // 'D'

            await opfs.writeFile("test-file.bin", buffer);

            const result = await opfs.readBinary("test-file.bin");
            expect(result.byteLength).toBe(4);
            const resultArray = new Uint8Array(result);
            expect(resultArray[0]).toBe(65);
            expect(resultArray[3]).toBe(68);
        });

        it("should handle multiple slashes and dots in paths", async () =>
        {
            await opfs.mkdir("test-dir///./nested//./deep");
            const exists = await opfs.exists("test-dir/nested/deep");
            expect(exists).toBe(true);
        });
    });

    describe("text encoding", () =>
    {
        it("should read text with UTF-8 content", async () =>
        {
            const text = "Hello 世界 🌍";
            await opfs.writeFile("test-file.txt", text);

            const result = await opfs.readText("test-file.txt");
            expect(result).toBe(text);
        });

        it("should read JSON with UTF-8 content", async () =>
        {
            const data = { message: "Hello 世界" };
            await opfs.writeJSON("test.json", data);

            const result = await opfs.readJSON("test.json");
            expect(result).toEqual(data);
        });

        it("should read JSONL with UTF-8 content", async () =>
        {
            const data1 = { text: "Hello 世界" };
            const data2 = { text: "Bonjour 🇫🇷" };
            await opfs.appendJSONL("test.jsonl", data1);
            await opfs.appendJSONL("test.jsonl", data2);

            const result = await opfs.readJSONL("test.jsonl");
            expect(result).toEqual([data1, data2]);
        });
    });

    describe("writeJSON options exhaustion", () =>
    {
        interface TestData
        {
            id: number;
            name: string;
            active: boolean;
        }

        it("should write pretty formatted JSON", async () =>
        {
            const data: TestData = {
                id: 1,
                name: "test",
                active: true
            };

            await opfs.writeJSON("test.json", data, { pretty: true });

            const text = await opfs.readText("test.json");
            expect(text).toContain("\n");
            expect(text).toContain("  ");

            const result = await opfs.readJSON<TestData>("test.json");
            expect(result).toEqual(data);
        });
    });

    describe("JSONL edge cases", () =>
    {
        it("should return empty array when reading empty JSONL file", async () =>
        {
            await opfs.writeFile("test.jsonl", "");

            const result = await opfs.readJSONL("test.jsonl");
            expect(result).toEqual([]);
        });

        it("should handle JSONL with only whitespace lines", async () =>
        {
            const content = "   \n\t\t\n   \n";
            await opfs.writeFile("test.jsonl", content);

            const result = await opfs.readJSONL("test.jsonl");
            expect(result).toEqual([]);
        });

        it("should handle JSONL with mixed CRLF and LF", async () =>
        {
            const content = '{"a":1}\r\n{"b":2}\n{"c":3}\r\n';
            await opfs.writeFile("test.jsonl", content);

            const result = await opfs.readJSONL("test.jsonl");
            expect(result).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
        });

        it("should handle JSONL with spaces around JSON objects", async () =>
        {
            const content = '  {"a":1}  \n  {"b":2}  \n  {"c":3}  ';
            await opfs.writeFile("test.jsonl", content);

            const result = await opfs.readJSONL("test.jsonl");
            expect(result).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
        });

        it("should throw when JSONL contains invalid JSON line", async () =>
        {
            const content = '{"valid":1}\n{invalid json}\n{"valid":2}';
            await opfs.writeFile("test.jsonl", content);

            await expect(opfs.readJSONL("test.jsonl")).rejects.toThrow();
        });
    });

    describe("appendJSONL type variations", () =>
    {
        it("should append primitive types correctly", async () =>
        {
            await opfs.appendJSONL("test.jsonl", 42);
            await opfs.appendJSONL("test.jsonl", "string");
            await opfs.appendJSONL("test.jsonl", true);
            await opfs.appendJSONL("test.jsonl", false);
            await opfs.appendJSONL("test.jsonl", null);

            const text = await opfs.readText("test.jsonl");
            const lines = text.trim().split("\n");

            expect(lines[0]).toBe("42");
            expect(lines[1]).toBe('"string"');
            expect(lines[2]).toBe("true");
            expect(lines[3]).toBe("false");
            expect(lines[4]).toBe("null");
        });

        it("should append complex nested objects", async () =>
        {
            interface ComplexObject
            {
                id: number;
                metadata: {
                    config: {
                        enabled: boolean;
                        timeout: number;
                    };
                    tags: string[];
                };
            }

            const obj: ComplexObject = {
                id: 123,
                metadata: {
                    tags: ["tag1", "tag2", "tag3"],
                    config: {
                        enabled: true,
                        timeout: 5000
                    }
                }
            };

            await opfs.appendJSONL("test.jsonl", obj);

            const result = await opfs.readJSONL<ComplexObject>("test.jsonl");
            expect(result).toEqual([obj]);
            expect(result[0].metadata.tags).toEqual(["tag1", "tag2", "tag3"]);
            expect(result[0].metadata.config.timeout).toBe(5000);
        });
    });

    describe("writeFile keepExistingData option", () =>
    {
        it("should overwrite when keepExistingData is undefined", async () =>
        {
            await opfs.writeFile("test-file.txt", "original content");
            await opfs.writeFile("test-file.txt", "new content");

            const result = await opfs.readText("test-file.txt");
            expect(result).toBe("new content");
        });

        it("should preserve data when keepExistingData is true", async () =>
        {
            await opfs.writeFile("test-file.txt", "original");
            await opfs.writeFile("test-file.txt", "new", { keepExistingData: true });

            // keepExistingData preserves existing bytes, writes from position 0
            // "original" (8 bytes) + write "new" (3 bytes) = "newginal"
            const result = await opfs.readText("test-file.txt");
            expect(result).toBe("newginal");
        });

        it("should overwrite when keepExistingData is false", async () =>
        {
            await opfs.writeFile("test-file.txt", "original");
            await opfs.writeFile("test-file.txt", "replacement", { keepExistingData: false });

            const result = await opfs.readText("test-file.txt");
            expect(result).toBe("replacement");
        });
    });

    describe("type-safe JSON operations", () =>
    {
        interface User
        {
            id: number;
            username: string;
            email: string;
            profile: {
                age: number;
                firstName: string;
                lastName: string;
            };
            roles: string[];
            isActive: boolean;
        }

        it("should maintain type safety with complete object construction", async () =>
        {
            const user: User = {
                id: 1001,
                username: "testuser",
                email: "test@example.com",
                profile: {
                    firstName: "John",
                    lastName: "Doe",
                    age: 30
                },
                roles: ["admin", "user"],
                isActive: true
            };

            await opfs.writeJSON("test.json", user);

            const result = await opfs.readJSON<User>("test.json");

            expect(result.id).toBe(1001);
            expect(result.username).toBe("testuser");
            expect(result.email).toBe("test@example.com");
            expect(result.profile.firstName).toBe("John");
            expect(result.profile.lastName).toBe("Doe");
            expect(result.profile.age).toBe(30);
            expect(result.roles).toEqual(["admin", "user"]);
            expect(result.isActive).toBe(true);
        });

        it("should handle arrays of typed objects", async () =>
        {
            const users: User[] = [
                {
                    id: 1,
                    username: "user1",
                    email: "user1@test.com",
                    profile: {
                        firstName: "Alice",
                        lastName: "Smith",
                        age: 25
                    },
                    roles: ["user"],
                    isActive: true
                },
                {
                    id: 2,
                    username: "user2",
                    email: "user2@test.com",
                    profile: {
                        firstName: "Bob",
                        lastName: "Johnson",
                        age: 35
                    },
                    roles: ["admin", "moderator"],
                    isActive: false
                }
            ];

            await opfs.writeJSON("test.json", users);

            const result = await opfs.readJSON<User[]>("test.json");

            expect(result).toHaveLength(2);
            expect(result[0].username).toBe("user1");
            expect(result[1].roles).toEqual(["admin", "moderator"]);
        });
    });

    describe("remove error handling", () =>
    {
        it("should silently handle removal of nested non-existent paths", async () =>
        {
            await expect(opfs.remove("test-dir/deeply/nested/non-existent/path")).resolves.toBeUndefined();
        });

        it("should silently handle removal of dot path", async () =>
        {
            await expect(opfs.remove(".")).resolves.toBeUndefined();
        });

        it("should silently handle removal of empty string", async () =>
        {
            await expect(opfs.remove("")).resolves.toBeUndefined();
        });
    });

    describe("exists comprehensive coverage", () =>
    {
        it("should return false for deeply nested non-existent paths", async () =>
        {
            const exists = await opfs.exists("test-dir/a/b/c/d/e/f/non-existent");
            expect(exists).toBe(false);
        });

        it("should return true for empty string (root)", async () =>
        {
            const exists = await opfs.exists("");
            expect(exists).toBe(true);
        });

        it("should return true for dot path (root)", async () =>
        {
            const exists = await opfs.exists(".");
            expect(exists).toBe(true);
        });
    });

    describe("readdir edge cases", () =>
    {
        it("should handle directory with many items", async () =>
        {
            await opfs.mkdir("test-dir/many-items");

            const fileCount = 50;
            for (let i = 0; i < fileCount; i++)
            {
                await opfs.writeFile(`test-dir/many-items/file${i}.txt`, `content${i}`);
            }

            const contents = await opfs.readdir("test-dir/many-items");
            expect(contents).toHaveLength(fileCount);
        });
    });

    describe("emptyDir comprehensive coverage", () =>
    {
        it("should empty deeply nested directory structure", async () =>
        {
            await opfs.mkdir("test-dir/complex/a/b/c");
            await opfs.mkdir("test-dir/complex/x/y/z");
            await opfs.writeFile("test-dir/complex/a/file1.txt", "content");
            await opfs.writeFile("test-dir/complex/a/b/file2.txt", "content");
            await opfs.writeFile("test-dir/complex/x/y/z/file3.txt", "content");

            await opfs.emptyDir("test-dir/complex");

            const exists = await opfs.exists("test-dir/complex");
            expect(exists).toBe(true);

            const contents = await opfs.readdir("test-dir/complex");
            expect(contents).toEqual([]);
        });

        it("should handle emptyDir on root path", async () =>
        {
            // This should empty the root but not fail
            await opfs.emptyDir("/");

            const rootExists = await opfs.exists("/");
            expect(rootExists).toBe(true);
        });
    });
});
