import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, it } from "node:test"
import remarkParse from "remark-parse"
import remarkStringify from "remark-stringify"
import { unified } from "unified"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const source = readFileSync(resolve(root, "dist/remark-math.esm.js"), "utf8")
const module = await import("@itslil/remark-math")
const commonjs = createRequire(import.meta.url)("@itslil/remark-math")
const remarkMath = module.default

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
  it("exposes the upstream public API", () => {
    assert.deepEqual(Object.keys(module), ["default"])
    assert.deepEqual(Object.keys(commonjs), ["default"])
    assert.equal(typeof remarkMath, "function")
    assert.equal(typeof commonjs.default, "function")
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

  it("does not over-escape a lone dollar with default options", () => {
    const processor = unified().use(remarkParse).use(remarkStringify).use(remarkMath)
    assert.equal(String(processor.processSync("cost$*`")), "cost$\\*\\`\n")

    const { store, processor: host } = fakeProcessor()
    remarkMath.call(host)
    const pattern = store.toMarkdownExtensions[0].unsafe[2]
    assert.equal(Object.hasOwn(pattern, "after"), true)
    assert.equal(pattern.after, undefined)
  })
})
