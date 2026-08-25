function $(id) { return document.getElementById(id) }
function copyButtons() {
  for (const button of document.querySelectorAll("[data-copy]")) {
    button.addEventListener("click", async () => {
      await navigator.clipboard.writeText(button.dataset.copy)
      button.textContent = "copied"
      setTimeout(() => { button.textContent = "copy" }, 1200)
    })
  }
}
function samples(items, apply) {
  const root = $("samples")
  for (const item of items) {
    const button = document.createElement("button")
    button.type = "button"
    button.textContent = item.label
    button.addEventListener("click", () => apply(item.value))
    root.append(button)
  }
}
function showText(value) {
  $("output").hidden = false
  $("output").textContent = value
  $("preview").hidden = true
  $("frame").hidden = true
}
function showHtml(html) {
  $("output").hidden = false
  $("output").textContent = html
  $("preview").hidden = true
  $("frame").hidden = false
  $("frame").srcdoc = `<!doctype html><style>body{font:16px/1.55 system-ui;margin:16px}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px 8px}blockquote{border-left:3px solid #e3b341;padding-left:12px;color:#555}</style>${html}`
}
function showPreview(html) {
  $("output").hidden = false
  $("preview").hidden = false
  $("frame").hidden = true
  $("preview").innerHTML = html
}
copyButtons()

import { remarkMath } from "./remark-math.js"
import { remarkParse } from "./vendor/remark-parse.js"
const input = $("input")
samples([
  { label: "inline", value: "has $a+b$ in a sentence" },
  { label: "block", value: "$$\nE=mc^2\n$$" },
], (value) => { input.value = value; render() })
input.value = "Energy is $E=mc^2$.\n\n$$\n\\frac{a}{b}\n$$\n"
function parse(doc) {
  const proc = { _d: { settings: {} }, data() { return this._d } }
  remarkMath.call(proc)
  remarkParse.call(proc, {})
  const tree = proc.parser(doc)
  const transform = remarkMath.call(proc)
  return { settings: proc.data().settings, tree: transform(tree) }
}
function render() {
  try { showText(JSON.stringify(parse(input.value), null, 2)) }
  catch (error) { showText(String(error)) }
}
input.addEventListener("input", render)
render()
