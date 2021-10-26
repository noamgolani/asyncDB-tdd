import DB from "../src/DB";
import Entry, { ReadOnlyEntry } from "../src/Entry";
import fs from "fs/promises";
import fsSync, { read } from "fs";
import { validate } from "uuid";
import path from "path";

const TEST_DB_DIR = "testDB";

afterAll(() => {
  try {
    fsSync.rmdirSync(TEST_DB_DIR, { recursive: true });
  } catch {
    return;
  }
});

beforeAll(() => {
  try {
    fsSync.rmdirSync(TEST_DB_DIR, { recursive: true });
  } catch {
    return;
  }
});

describe("constructor()", () => {
  test("Should init new empty folder if not exists", async () => {
    const db = new DB(TEST_DB_DIR);
    expect(db).toBeInstanceOf(DB);
    expect(await fs.readdir("./")).toContain(TEST_DB_DIR);
  });

  test("Should not open new folder if already exists", () => {
    expect(async () => {
      const db = await new DB(TEST_DB_DIR);
      expect(db).toBeInstanceOf(DB);
    }).not.toThrow();
  });
});

describe("store()", () => {
  const db = new DB(TEST_DB_DIR);
  const data = { test: "test" };
  let newId;
  let dataObj;

  test("Should generate new uuid and return its value", async () => {
    newId = await db.store(data);
    expect(validate(newId)).toBe(true);
  });

  test("Should create new file with id as name", async () => {
    const dirCont = await fs.readdir(TEST_DB_DIR);
    expect(dirCont).toContain(newId);
  });

  test("File content should be json and contain readOnly, data and timestemp", async () => {
    const fileContent = await fs.readFile(path.join(TEST_DB_DIR, newId));
    dataObj = JSON.parse(fileContent);
    expect(dataObj.data).toEqual(data);
    expect(dataObj.readOnly).toEqual(false);
    expect(() => {
      // check if parsble
      Date(dataObj.timestemp);
    }).not.toThrow();
  });
});

describe("get()", () => {
  const db = new DB(TEST_DB_DIR);
  const data = { test: "test" };
  let entry, readOnly;

  test("Should return Entry", async () => {
    const id = await db.store(data);
    entry = await db.get(id);
    expect(entry).toBeInstanceOf(Entry);
  });

  test("Entry value should be the data", () => {
    expect(entry.value).toEqual(data);
  });

  test("Entry should have timestemp property", () => {
    expect(entry.timestemp).toBeDefined();
  });

  test("Entry should have be of readOnly instace if its readonly and Entry if can be changed", async () => {
    readOnly = await db.get(await db.store(data, true));
    expect(readOnly).toBeInstanceOf(ReadOnlyEntry);
  });
});

describe("Updating Entry", () => {
  const db = new DB(TEST_DB_DIR);
  const data = { test: "test" };
  const newData = { new: "data" };
  let entry, entryId;

  test("Setting entry value, should update its value", async () => {
    entryId = await db.store(data);
    entry = await db.get(entryId);
    await entry.setValue(newData);
    expect(entry.value).toEqual(newData);
  });

  test("Setting read only entry value should throw an Error", async () => {
    const readOnly = await db.get(await db.store(data, true));
    expect(readOnly).toBeInstanceOf(ReadOnlyEntry);
    await expect(async () => {
      await readOnly.setValue(newData);
    }).rejects.toThrow();
  });

  test("Setting entry value should update the Entry file", async () => {
    const fileCont = await fs.readFile(path.join(TEST_DB_DIR, entryId));
    const { data, timestemp, readOnly } = JSON.parse(fileCont);
    // TODO test timestemp
    expect(readOnly).toBe(false);
    expect(data).toEqual(newData);
  });
});
