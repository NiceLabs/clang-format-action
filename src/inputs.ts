import { resolve } from 'node:path'
import { getBooleanInput, getInput } from '@actions/core'

export interface Inputs {
  readonly path: string
  readonly baseline: string
  readonly version: string
  readonly style: string
  readonly fallbackStyle: string
  readonly asError: boolean
  readonly dryRun: boolean
  readonly extensions: ReadonlySet<string>
}

export function getInputs(): Inputs {
  const baseline = getInput('baseline', { required: true, trimWhitespace: true })
  const version = getInput('version', { required: true, trimWhitespace: true })
  assertBaseline(baseline)
  assertVersion(version)
  return Object.freeze({
    path: resolve(getInput('path', { required: true, trimWhitespace: true })),
    baseline,
    version,
    style: getInput('style', { required: true, trimWhitespace: true }),
    fallbackStyle: getInput('fallback-style', { required: true, trimWhitespace: true }),
    asError: getBooleanInput('warnings-as-errors', { required: true }),
    dryRun: getBooleanInput('dry-run', { required: true }),
    extensions: new Set<string>(
      getInput('extensions', { required: true, trimWhitespace: true })
        .split(/\s+/g)
        .map((ext) => ext.toLowerCase())
        .filter((ext) => ext[0] === '.' && ext.length > 1),
    ),
  })
}

function assertBaseline(baseline: string): void {
  if (baseline === 'latest') return
  if (baseline.startsWith('master-')) return
  throw new Error('The baseline must be "latest" or "master-<version>"')
}

function assertVersion(version: string): void {
  if (Number.parseInt(version) > 9) return
  throw new Error('The minimum supported clang-format version is 10.0.0')
}
