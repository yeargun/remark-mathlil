import remarkMath, {type Options} from "@itslil/remark-math"
import type {InlineMath, Math, Root} from "mdast"
import {unified} from "unified"

const options: Readonly<Options> = {singleDollarTextMath: undefined}
const result: undefined = remarkMath(options)
unified().use(remarkMath, options)

const display: Math = {type: "math", value: "x", meta: null}
const inline: InlineMath = {type: "inlineMath", value: "y"}
const tree: Root = {
  type: "root",
  children: [display, {type: "paragraph", children: [inline]}],
}

// @ts-expect-error: the upstream package has no named runtime export.
import {remarkMath as namedRemarkMath} from "@itslil/remark-math"

void result
void tree
void namedRemarkMath
