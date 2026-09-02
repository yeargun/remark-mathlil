# @itslil/remark-math

Official [`remark-math@6.0.0`](https://github.com/remarkjs/remark-math) algorithms rewritten in LilScript. Full test suite 60/60. Not affiliated with upstream.

**Site:** [yeargun.github.io/remark-mathlil/](https://yeargun.github.io/remark-mathlil/)

```sh
npm install @itslil/remark-math
```

Two compiles ship from the same `.lil` source:

| Lane | Config | Meaning |
| --- | --- | --- |
| **library** (npm) | `lilscript.toml` · `--target js-module` | reusable ESM. Export names and `extern class` keys stay. |
| **closed** | `lilscript.closed.toml` · `--target js-module` | closed LilScript world. `extern class` keys may mangle. ESM export names stay so the lane is testable. |

You publish the library lane. `dist/remark-math.closed.js` is diagnostic only.

The LilScript compiler lives next door at `../lilscript`.
