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

  it("keeps official extension keys in the library lane", () => {
    assert.match(source, /micromarkExtensions/)
    assert.match(source, /fromMarkdownExtensions/)
    assert.match(source, /toMarkdownExtensions/)
    assert.match(source, /mathText/)
    assert.match(source, /singleDollarTextMath/)
  })

  it("pushes micromark and mdast extensions onto the processor", () => {
    const { store, processor } = fakeProcessor()
    const result = remarkMath.call(processor)
    assert.equal(result, undefined)
    assert.equal(store.micromarkExtensions.length, 1)
    assert.ok(store.micromarkExtensions[0].flow)
    assert.ok(store.micromarkExtensions[0].text)
    assert.equal(store.fromMarkdownExtensions.length, 1)
    assert.ok(store.fromMarkdownExtensions[0].enter.mathFlow)
    assert.ok(store.fromMarkdownExtensions[0].enter.mathText)
    assert.equal(store.toMarkdownExtensions.length, 1)
    assert.ok(store.toMarkdownExtensions[0].handlers.math)
    assert.ok(store.toMarkdownExtensions[0].handlers.inlineMath)
    assert.equal(typeof store.toMarkdownExtensions[0].handlers.inlineMath.peek, "function")
  })

  it("creates missing extension arrays", () => {
    const { store, processor } = fakeProcessor()
    store.micromarkExtensions = []
    remarkMath.call(processor, { singleDollarTextMath: false })
    assert.equal(store.micromarkExtensions.length, 1)
    assert.equal(store.fromMarkdownExtensions.length, 1)
    assert.equal(store.toMarkdownExtensions.length, 1)
  })
})
