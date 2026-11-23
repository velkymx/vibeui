import { spawnSync } from 'node:child_process'

// The positive template fixture only proves the slots are strict enough to
// accept correct usage. A regression to permissive slot types (back to a union
// with an index signature, `any`, or deleting the mapped members) would still
// compile every line there. This gate compiles a fixture that MUST fail and
// asserts the exact diagnostics, so "too loose" also fails.

const FIXTURE = 'tests/types/negative/datatable-slots.vue'
// One per negative case in the fixture; the annotated binding yields two
// (the annotation mismatch and the body's use of the narrowed value).
const EXPECTED_CODES = ['TS2339', 'TS2339', 'TS2339', 'TS2345', 'TS2551']

function fail(message, output = '') {
  console.error(`negative type gate failed: ${message}`)
  if (output) console.error(output)
  process.exit(1)
}

function run(args) {
  const result = spawnSync('npx', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  })
  // spawnSync reports launch failures through `error` and signals through
  // `signal`; neither means vue-tsc diagnosed anything. Surface them instead of
  // folding them into a status, so an environment failure cannot be reported as
  // a type regression.
  if (result.error) fail(`vue-tsc could not be executed: ${result.error.message}`)
  if (result.signal) fail(`vue-tsc was terminated by signal ${result.signal}`)
  return {
    code: result.status ?? 1,
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`
  }
}

// 1. The positive fixture must be part of the positive program. If a config
//    edit drops it, test:types would stay green while checking nothing.
const listed = run(['vue-tsc', '--noEmit', '--listFiles', '-p', 'tsconfig.types.json'])
if (listed.code !== 0) fail('the positive type config does not compile', listed.output)
if (!listed.output.includes('tests/types/datatable-slots.vue')) {
  fail('tests/types/datatable-slots.vue is not in tsconfig.types.json — the slot gate is disabled')
}

// 2. The negative fixture must fail, and only with the diagnostics we rely on.
const negative = run([
  'vue-tsc',
  '--noEmit',
  '--pretty',
  'false',
  '-p',
  'tsconfig.types.negative.json'
])
if (negative.code === 0) {
  fail('the negative fixture compiled cleanly — the slot types are permissive again')
}

const errorLines = negative.output.split('\n').filter((line) => / error TS\d+/.test(line))
const foreign = errorLines.filter((line) => !line.startsWith(FIXTURE))
if (foreign.length > 0) fail(`unexpected diagnostics outside ${FIXTURE}`, foreign.join('\n'))

const actual = errorLines
  .map((line) => /error (TS\d+)/.exec(line)?.[1])
  .filter(Boolean)
  .sort()
if (actual.join(',') !== EXPECTED_CODES.join(',')) {
  fail(`expected diagnostics ${EXPECTED_CODES.join(', ')}; got ${actual.join(', ') || '(none)'}`, negative.output)
}

console.log('negative type assertions ok')
