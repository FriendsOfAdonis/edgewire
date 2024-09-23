import { TagToken } from 'edge.js/types'
import { expressions as expressionsList, Parser } from 'edge-parser'
import { EdgeError } from 'edge-error'

type ExpressionList = readonly (keyof typeof expressionsList | 'ObjectPattern' | 'ArrayPattern')[]

/**
 * Raise an `E_UNALLOWED_EXPRESSION` exception. Filename and expression is
 * required to point the error stack to the correct file
 *
 * @see https://github.com/edge-js/edge/blob/develop/src/utils.ts#L87
 */
export function unallowedExpression(
  message: string,
  filename: string,
  loc: { line: number; col: number }
) {
  throw new EdgeError(message, 'E_UNALLOWED_EXPRESSION', {
    line: loc.line,
    col: loc.col,
    filename: filename,
  })
}

/**
 * Validates the expression type to be part of the allowed
 * expressions only.
 *
 * The filename is required to report errors.
 *
 * ```js
 * isNotSubsetOf(expression, ['Literal', 'Identifier'], () => {})
 * ```
 * @link https://github.com/edge-js/edge/blob/develop/src/utils.ts#L109
 */
export function isSubsetOf(
  expression: any,
  expressions: ExpressionList,
  errorCallback: () => void
) {
  if (!expressions.includes(expression.type)) {
    errorCallback()
  }
}

/**
 * Parses the jsArg by generating and transforming its AST
 *
 * @see https://github.com/edge-js/edge/blob/develop/src/utils.ts#L142
 */
export function parseJsArg(parser: Parser, token: TagToken) {
  return parser.utils.transformAst(
    parser.utils.generateAST(token.properties.jsArg, token.loc, token.filename),
    token.filename,
    parser
  )
}
