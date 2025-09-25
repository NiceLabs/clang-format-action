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

## FAQ

1. Q: How to configure which version of clang-format was used? \
   A: Use `version` option. e.g. `version: 20`.
2. Q: I want to format the code directly instead of raise a warning. \
   A: Use `dry-run: false`.
3. Q: I want to exclude some files from format operation. \
   A: Add them into [`.clang-format-ignore`] file.
4. Q: I want format a subdirectory only. \
   A: Use `path` option. e.g. `path: src`.

## LICENSE

[MIT LICENSE](LICENSE.txt)
