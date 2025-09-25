# clang-format-action

Lint C/C++ code using clang-format.

Based on <https://github.com/muttleyxd/clang-tools-static-binaries> prebuilt binaries.

## Features

- Runs [`clang-format`] on your codebase
- Supports custom configuration via [`.clang-format`]
- Supports [`.gitignore`] and [`.clang-format-ignore`] files
- Easy integration with GitHub Workflows

[`clang-format`]: https://clang.llvm.org/docs/ClangFormat.html
[`.gitignore`]: https://git-scm.com/docs/gitignore
[`.clang-format`]: https://clang.llvm.org/docs/ClangFormatStyleOptions.html
[`.clang-format-ignore`]: https://clang.llvm.org/docs/ClangFormat.html#clang-format-ignore

## Usage

Add the following to your workflow YAML:

```yaml
- uses: nicelabs/clang-format-action@v1
```

Defined in [`action.yaml`](action.yaml).

## Configuration

Place your `.clang-format` file in the repository root to customize formatting rules.

See <https://clang.llvm.org/docs/ClangFormatStyleOptions.html>

## LICENSE

[MIT LICENSE](LICENSE.txt)
