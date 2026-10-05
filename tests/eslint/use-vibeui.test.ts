import { RuleTester } from 'eslint'
import vueParser from 'vue-eslint-parser'
// @ts-expect-error - plugin rule is authored in plain JS (no d.ts), imported for testing.
import rule from '../../eslint-plugin/rules/use-vibeui.mjs'

// #92: lint rule that flags raw HTML elements which have a VibeUI equivalent.
const ruleTester = new RuleTester({
  languageOptions: {
    parser: vueParser,
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
})

ruleTester.run('use-vibeui', rule, {
  valid: [
    // Elements with no VibeUI equivalent are allowed.
    { filename: 'a.vue', code: '<template><div><p>Hello</p></div></template>' },
    // The VibeUI component itself is allowed.
    { filename: 'b.vue', code: '<template><VibeButton>Go</VibeButton></template>' },
    // A denied element removed from the map via options is allowed.
    { filename: 'c.vue', code: '<template><button>x</button></template>', options: [{ denyMap: {} }] },
  ],
  invalid: [
    {
      filename: 'e.vue',
      code: '<template><button>x</button></template>',
      errors: [
        {
          messageId: 'useComponent',
          data: { element: 'button', component: 'VibeButton' },
          suggestions: [
            { messageId: 'replaceWithComponent', output: '<template><VibeButton>x</VibeButton></template>' },
          ],
        },
      ],
    },
    {
      filename: 'f.vue',
      code: '<template><table><tbody><tr><td>1</td></tr></tbody></table></template>',
      // table, tbody, tr, td all map to VibeDataTable.
      errors: 4,
    },
    {
      filename: 'g.vue',
      code: '<template><nav>x</nav></template>',
      errors: [
        {
          messageId: 'useComponent',
          suggestions: [
            { messageId: 'replaceWithComponent', output: '<template><VibeNavbar>x</VibeNavbar></template>' },
          ],
        },
      ],
    },
    // A custom denyMap entry is honored.
    {
      filename: 'h.vue',
      code: '<template><marquee>x</marquee></template>',
      options: [{ denyMap: { marquee: 'VibeMarquee' } }],
      errors: [
        {
          messageId: 'useComponent',
          data: { element: 'marquee', component: 'VibeMarquee' },
          suggestions: [
            { messageId: 'replaceWithComponent', output: '<template><VibeMarquee>x</VibeMarquee></template>' },
          ],
        },
      ],
    },
    // Suggestion renames the element to the component.
    {
      filename: 'i.vue',
      code: '<template><button>x</button></template>',
      errors: [
        {
          messageId: 'useComponent',
          suggestions: [
            {
              messageId: 'replaceWithComponent',
              output: '<template><VibeButton>x</VibeButton></template>',
            },
          ],
        },
      ],
    },
  ],
})
