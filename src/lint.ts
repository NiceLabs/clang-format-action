import { error, ExitCode, setOutput, summary, warning } from '@actions/core'
import { getExecOutput } from '@actions/exec'
import { join as joinPath } from 'node:path'
import type { Inputs } from './inputs'

const title = 'clang-format'
const message = 'Code should be clang-formatted'

export async function lint(program: string, inputs: Inputs, fileListPath: string) {
  const result = await getExecOutput(program, Array.from(buildArguments(inputs, fileListPath)), { cwd: inputs.path })
  const errors = parseErrors(result.stderr)

  const annotation = inputs.asError ? error : warning
  for (const [filePath, lines] of errors.entries()) {
    const file = joinPath(inputs.path, filePath)
    let startLine = Math.min(...lines)
    if (lines.size > 1) startLine = 1
    annotation(message, { title, file, startLine })
  }

  setOutput('unformatted-files', Array.from(errors.keys()).join('\n'))
  setOutput('unformatted-file-count', errors.size)

  if (errors.size === 0) return
  if (inputs.asError) process.exitCode = ExitCode.Failure
  await summary
    .addHeading('Unformatted Files', 2)
    .addEOL()
    .addRaw('The following files do not conform to the clang-format style and need to be formatted:', true)
    .addEOL()
    .addList(Array.from(errors.keys()))
    .write()
}

function parseErrors(stderr: string): ReadonlyMap<string, ReadonlySet<number>> {
  const errors = new Map<string, Set<number>>()

  function get(name: string) {
    if (!errors.has(name)) errors.set(name, new Set())
    return errors.get(name)!
  }

  for (const line of stderr.split('\n')) {
    const match = /^(?<file>\S+):(?<lineNo>\d+):(?<colNo>\d+):/.exec(line)
    if (match === null || match.groups === undefined) continue
    get(match.groups.file).add(Number.parseInt(match.groups.lineNo, 10))
  }
  return errors
}

function* buildArguments(inputs: Inputs, fileListPath: string): Iterable<string> {
  if (inputs.dryRun) {
    yield '--dry-run'
  } else {
    yield '-i' // inplace edit
  }
  yield '--fno-color-diagnostics'
  yield '--style'
  yield inputs.style
  yield '--fallback-style'
  yield inputs.fallbackStyle
  yield '--files'
  yield fileListPath
}
