import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { Inputs } from './inputs'

export function getClangFormatBlobURL(inputs: Inputs): string {
  function getPlatform() {
    const { platform, arch } = process
    if (platform === 'linux' && arch === 'x64') return 'linux-amd64'
    if (platform === 'darwin' && arch === 'arm64') return 'macos-arm-arm64'
    if (platform === 'darwin' && arch === 'x64') return 'macosx-amd64'
    if (platform === 'win32' && arch === 'x64') return 'windows-amd64.exe'
    throw new Error(`Unsupported ${process.platform} with ${process.arch}`)
  }

  const pathname = path.posix.join(
    'muttleyxd',
    'clang-tools-static-binaries',
    'releases',
    inputs.prebuiltTag,
    'download',
    `clang-format-${inputs.version}_${getPlatform()}`,
  )
  return new URL(pathname, 'https://github.com').toString()
}

export function getTempDir() {
  const baseDir = process.env.RUNNER_TEMP ?? tmpdir()
  return mkdtemp(path.join(baseDir, 'clang-fmt-'))
}
