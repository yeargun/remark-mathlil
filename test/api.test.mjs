import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, it } from "node:test"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const source = readFileSync(resolve(root, "dist/remark-math.esm.js"), "utf8")
const { remarkMath, default: remarkMathDefault } = await import(
  new URL("../dist/remark-math.esm.js", import.meta.url)
)

function paragraphTree(value) {
  return {
    type: "root",
    children: [{ type: "paragraph", children: [{ type: "text", value }] }],
  }
}

function fakeProcessor() {
  const store = {}
  return {
    store,
    processor: {
      data() {
        return store
      },
    },
  }
}

describe("@itslil/remark-math", () => {
  it("exports remarkMath and default", () => {
    assert.equal(typeof remarkMath, "function")
    assert.equal(remarkMathDefault, remarkMath)
    assert.match(source, / as remarkMath[},]/)
    assert.match(source, / as default[},]/)
  })

  it("keeps pinned settings keys in the library lane", () => {
    assert.match(source, /\.math\s*=/)
    assert.match(source, /\.settings\s*=/)
    assert.match(source, /"inlineMath"/)
    assert.match(source, /"math"/)
  })

  it("sets settings.math on a fake processor", () => {
    const { store, processor } = fakeProcessor()
    const transform = remarkMath.call(processor)
    assert.equal(store.settings.math, true)
    assert.equal(typeof transform, "function")
  })

  it("splits $...$ into inlineMath", () => {
    const tree = paragraphTree("x is $a+b$")
    remarkMath.call({ data() { return {} } })(tree)
    const kids = tree.children[0].children
    assert.equal(kids[0].type, "text")
    assert.equal(kids[0].value, "x is ")
    assert.equal(kids[1].type, "inlineMath")
    assert.equal(kids[1].value, "a+b")
  })

  it("splits $$...$$ into math", () => {
    const tree = paragraphTree("$$x^2$$")
    remarkMath.call({})(tree)
    const kids = tree.children[0].children
    assert.equal(kids.length, 1)
    assert.equal(kids[0].type, "math")
    assert.equal(kids[0].value, "x^2")
  })

  it("ignores escaped dollars and does not split code or link urls", () => {
    const tree = {
      type: "root",
      children: [
        { type: "code", value: "$a+b$" },
        {
          type: "paragraph",
          children: [
            { type: "inlineCode", value: "$a$" },
            { type: "text", value: "cost is \\$5 and $x$" },
            { type: "link", url: "$not$", children: [{ type: "text", value: "see $y$" }] },
          ],
        },
      ],
    }
    remarkMath.call({})(tree)
    assert.equal(tree.children[0].value, "$a+b$")
    const kids = tree.children[1].children
    assert.equal(kids[0].type, "inlineCode")
    assert.equal(kids[1].type, "text")
    assert.equal(kids[1].value, "cost is \\$5 and ")
    assert.equal(kids[2].type, "inlineMath")
    assert.equal(kids[2].value, "x")
    assert.equal(kids[3].type, "link")
    assert.equal(kids[3].url, "$not$")
    assert.equal(kids[3].children[0].type, "text")
    assert.equal(kids[3].children[0].value, "see ")
    assert.equal(kids[3].children[1].type, "inlineMath")
    assert.equal(kids[3].children[1].value, "y")
  })
})
