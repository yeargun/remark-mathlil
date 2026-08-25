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
    assert.equal(typeof closed.remarkMath, "function")
    assert.equal(closed.default, closed.remarkMath)
    const tree = {
      type: "root",
      children: [{ type: "paragraph", children: [{ type: "text", value: "x is $a+b$" }] }],
    }
    const transform = closed.remarkMath.call({})
    transform(tree)
    assert.equal(tree.children[0].children[1].type, "inlineMath")
    assert.equal(tree.children[0].children[1].value, "a+b")
  })
})
