import DB from "../src/DB";
import fs from "fs/promises";
import fsSync from "fs";
import { validate } from "uuid";
import path from "path";

const TEST_DB_DIR = "testDB";

describe("Constructor", () => {
  fsSync.rmdirSync(TEST_DB_DIR, { recursive: true });
  test("Should init new empty folder if not exists", async () => {
    const db = new DB("TEST_DB_DIR");
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

describe("store", () => {
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
