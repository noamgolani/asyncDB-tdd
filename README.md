## DB

-	*constructor(dir)*: Should create new / open, "db"(folder) with the specified name. Handle folder related errors.
- *get size*: returns the number of keys in the `DB`
- *async get(key)*: should return an `Entry` or `ReadOnlyEntry` instance with the parsed data
- *async store(key, data, readOnly)*: should write new file with the `key` as name and `{data, readOnly, timestamp}` values inside
- *toString()* : should return an array containing all keys
- *[Iterator]*: `DB` should be iterateble as a normal `Map`, by `key` -> `Entry`


- *static realSize*: recives an `Entry` and returns the memory it holds in bytes
- *private updateEntry* <= can maby be also static, and recive absolute path.

Maby add for ID new Entry, and static currentID for DB

## Entry - DB utility class

- *constructor(data, timestamp, updateCb)*:
	-	data - current `Entry` data
	- timestamp
	- updateCb - (data) => sets the new data in the entry
-	*get value*
- *set value(val)*: should use the `updateCb` and update both its values and the `DB` content (timestemp & data)
- *get timestemp*
- *remove()*: should remove the entry from the `DB`
- *toString()*: should return the parsed value

## ReadOnlyEntry - DB utility class

-	*constructor(data, timestemp)*: Cant change value
