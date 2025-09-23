import { error, ExitCode, setOutput, summary, warning } from '@actions/core'
import { getExecOutput } from '@actions/exec'
import { join as joinPath } from 'node:path'
import type { Inputs } from './inputs'

const title = 'clang-format'
const message = 'Code should be clang-formatted'

export async function lint(program: string, inputs: Inputs, fileListPath: string) {
  const result = await getExecOutput(program, Array.from(buildArguments(inputs, fileListPath)), { cwd: inputs.path })
  const errors = parseErrors(result.stderr)

  const emit = inputs.asError ? error : warning
  for (const [filePath, lines] of errors.entries()) {
    const file = joinPath(inputs.path, filePath)
    for (const [startLine, endLine] of lines) {
      emit(message, { title, file, startLine, endLine })
    }
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

function parseErrors(stderr: string): ReadonlyMap<string, LineRange> {
  const errors = new Map<string, LineRange>()

  function get(name: string) {
    if (!errors.has(name)) errors.set(name, new LineRange())
    return errors.get(name)!
  }

  for (const line of stderr.split('\n')) {
    const match = /^(?<file>\S+):(?<lineNo>\d+):(?<colNo>\d+):/.exec(line)
    if (match === null || match.groups === undefined) continue
    get(match.groups.file).add(match.groups.lineNo)
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

class LineRange implements Iterable<readonly [number, number]> {
  private lines = new Set<number>()

  add(line: string | number) {
    if (typeof line === 'string') line = Number.parseInt(line, 10)
    this.lines.add(line)
  }

  *[Symbol.iterator](): Iterator<readonly [number, number]> {
    if (this.lines.size === 0) return
    const values = Array.from(this.lines) // copy
    values.sort((a, b) => a - b) // sort ascending
    let start = values[0]
    let end = values[0]
    for (let index = 1; index < values.length; index++) {
      const current = values[index]
      if (current === end + 1) {
        end = current
      } else {
        yield [start, end]
        start = current
        end = current
      }
    }
    yield [start, end]
  }
}
