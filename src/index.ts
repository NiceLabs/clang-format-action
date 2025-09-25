import { group } from '@actions/core'
import { exec } from '@actions/exec'
import { downloadTool } from '@actions/tool-cache'
import walk from 'ignore-walk'
import { chmod, rm, writeFile } from 'node:fs/promises'
import { extname, join as joinPath } from 'node:path'
import { getInputs } from './inputs'
import { lint } from './lint'
import { getClangFormatBlobURL, getTempDir } from './utils'

async function main() {
  const tmpdir = await getTempDir()
  const inputs = getInputs()

  const program = await downloadTool(
    getClangFormatBlobURL(inputs.prebuiltTag, inputs.version),
    joinPath(tmpdir, process.platform === 'win32' ? 'clang-format.exe' : 'clang-format'),
  )
  if (process.platform !== 'win32') await chmod(program, 0o755)

  await group('Version', () => exec(program, ['--version']))

  await group('Linting', async () => {
    const filePaths = await walk({
      path: inputs.path,
      ignoreFiles: ['.gitignore', '.clang-format-ignore'],
      includeEmpty: false,
    })

    await writeFile(
      joinPath(tmpdir, 'files.txt'),
      filePaths
        .filter((filePath) => {
          if (filePath.startsWith('.git')) return false
          return inputs.extensions.has(extname(filePath).toLowerCase())
        })
        .join('\n'),
      { encoding: 'utf8', flush: true },
    )
    await lint(program, inputs, joinPath(tmpdir, 'files.txt'))
  })

  await rm(tmpdir, { recursive: true, force: true })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
