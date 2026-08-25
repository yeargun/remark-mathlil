export interface RemarkMathSettings {
  math?: boolean
}

export function remarkMath(
  this: { data?: (() => { settings?: RemarkMathSettings }) | { settings?: RemarkMathSettings } },
  options?: unknown,
): (tree: unknown, file?: unknown) => unknown

export default remarkMath
