import assert from "node:assert/strict"
import { existsSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { describe, it } from "node:test"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const closedPath = resolve(root, "dist/remark-math.closed.js")

describe("@itslil/remark-math closed lane", () => {
  it("ships a closed artifact whose exports stay callable", async () => {
    assert.equal(existsSync(closedPath), true, "dist/remark-math.closed.js")
    const closed = await import(pathToFileURL(closedPath).href)
    assert.deepEqual(Object.keys(closed), ["default"])
    assert.equal(typeof closed.default, "function")
    const store = {}
    const result = closed.default.call({
      data() {
        return store
      },
    })
    assert.equal(result, undefined)
    assert.ok(Object.values(store).some((value) => Array.isArray(value) && value.length > 0))
  })
})
