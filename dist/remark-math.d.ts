import type {Data, Literal} from "mdast"

export interface Options {
  singleDollarTextMath?: boolean | null | undefined
}

export default function remarkMath(options?: Readonly<Options> | null | undefined): undefined

declare module "mdast" {
  interface Math extends Literal {
    type: "math"
    meta?: string | null | undefined
    data?: MathData | undefined
  }

  interface MathData extends Data {}

  interface InlineMath extends Literal {
    type: "inlineMath"
    data?: InlineMathData | undefined
  }

  interface InlineMathData extends Data {}

  interface BlockContentMap {
    math: Math
  }

  interface PhrasingContentMap {
    inlineMath: InlineMath
  }

  interface RootContentMap {
    inlineMath: InlineMath
    math: Math
  }
}

declare module "mdast-util-from-markdown" {
  interface CompileData {
    mathFlowInside?: boolean | undefined
  }
}

declare module "mdast-util-to-markdown" {
  interface ConstructNameMap {
    mathFlow: "mathFlow"
    mathFlowMeta: "mathFlowMeta"
  }
}
