/**
 * ESLint rule: use-vibeui (#92).
 *
 * Denylist, not allowlist: flag only the raw HTML elements that already have a
 * VibeUI equivalent, and name the component to use instead. Everything else
 * (div, span, p, headings, lists, img, ...) stays allowed. The deny map is rule
 * configuration so teams can trim or extend it.
 */

// Element -> component to use instead. Kept current as VibeUI adds components.
export const DEFAULT_DENY_MAP = {
  button: 'VibeButton',
  a: 'VibeLink',
  input: 'VibeFormInput',
  select: 'VibeFormSelect',
  textarea: 'VibeFormTextarea',
  table: 'VibeDataTable',
  thead: 'VibeDataTable',
  tbody: 'VibeDataTable',
  tfoot: 'VibeDataTable',
  tr: 'VibeDataTable',
  td: 'VibeDataTable',
  th: 'VibeDataTable',
  nav: 'VibeNavbar',
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Use the VibeUI component in place of a raw HTML element that has an equivalent.',
      recommended: true,
    },
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          // When provided, replaces the default deny map entirely (trim or extend as needed).
          denyMap: {
            type: 'object',
            additionalProperties: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      useComponent: "Use <{{component}}> instead of a raw <{{element}}> element.",
      replaceWithComponent: 'Replace <{{element}}> with <{{component}}>.',
    },
  },

  create(context) {
    const options = context.options[0] || {}
    const denyMap = Object.prototype.hasOwnProperty.call(options, 'denyMap')
      ? options.denyMap
      : DEFAULT_DENY_MAP

    const sourceCode = context.sourceCode || context.getSourceCode()
    const parserServices = sourceCode.parserServices || context.parserServices

    // Not a Vue SFC (no template AST) - nothing to do.
    if (!parserServices || !parserServices.defineTemplateBodyVisitor) return {}

    return parserServices.defineTemplateBodyVisitor({
      VElement(node) {
        const element = node.rawName
        if (!element || !Object.prototype.hasOwnProperty.call(denyMap, element)) return
        const component = denyMap[element]

        context.report({
          node,
          loc: node.startTag.loc,
          messageId: 'useComponent',
          data: { element, component },
          suggest: [
            {
              messageId: 'replaceWithComponent',
              data: { element, component },
              fix(fixer) {
                const fixes = []
                // Rename the opening tag name (immediately after '<').
                const openStart = node.startTag.range[0] + 1
                fixes.push(fixer.replaceTextRange([openStart, openStart + element.length], component))
                // Rename the closing tag name (immediately after '</'), when present.
                if (node.endTag) {
                  const closeStart = node.endTag.range[0] + 2
                  fixes.push(fixer.replaceTextRange([closeStart, closeStart + element.length], component))
                }
                return fixes
              },
            },
          ],
        })
      },
    })
  },
}
