import { TagContract } from 'edge.js/types'
import { isSubsetOf, parseJsArg, unallowedExpression } from '../utils.js'
import { Parser, expressions } from 'edge-parser'

/**
 * A list of allowed expressions for the component name
 */
const ALLOWED_EXPRESSION_FOR_COMPONENT_NAME = [
  expressions.Identifier,
  expressions.Literal,
  expressions.LogicalExpression,
  expressions.MemberExpression,
  expressions.ConditionalExpression,
  expressions.CallExpression,
  expressions.TemplateLiteral,
] as const

/**
 * Returns the component name and props by parsing the component jsArg expression
 *
 * @see https://github.com/edge-js/edge/blob/develop/src/tags/component.ts#L45
 */
function getComponentNameAndProps(
  expression: any,
  parser: Parser,
  filename: string
): [string, string] {
  let name: string

  /**
   * Use the first expression inside the sequence expression as the name
   * of the component
   */
  if (expression.type === expressions.SequenceExpression) {
    name = expression.expressions.shift()
  } else {
    name = expression
  }

  /**
   * Ensure the component name is a literal value or an expression that
   * outputs a literal value
   */
  isSubsetOf(name, ALLOWED_EXPRESSION_FOR_COMPONENT_NAME, () => {
    unallowedExpression(
      `"${parser.utils.stringify(name)}" is not a valid argument for component name`,
      filename,
      parser.utils.getExpressionLoc(name)
    )
  })

  /**
   * Parse rest of sequence expressions as an objectified string.
   */
  if (expression.type === expressions.SequenceExpression) {
    /**
     * We only need to entertain the first expression of the sequence
     * expression, as components allows a max of two arguments
     */
    const firstSequenceExpression = expression.expressions[0]
    return [parser.utils.stringify(name), parser.utils.stringify(firstSequenceExpression)]
  }

  /**
   * When top level expression is not a sequence expression, then we assume props
   * as empty stringified object.
   */
  return [parser.utils.stringify(name), '{}']
}

export const edgewireTag: TagContract = {
  block: false,
  seekable: true,
  tagName: 'edgewire',
  compile(parser, buffer, token) {
    const awaitKeyword = parser.asyncMode ? 'await ' : ''
    const parsed = parseJsArg(parser, token)

    const [name, props] = getComponentNameAndProps(parsed, parser, token.filename)

    buffer.outputExpression(
      `${awaitKeyword}template.edgewire.mount(${name})`,
      token.filename,
      token.loc.start.line,
      false
    )
  },
}
