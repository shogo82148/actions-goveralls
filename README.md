# shogo82148/actions-goveralls

[![test](https://github.com/shogo82148/actions-goveralls/workflows/test/badge.svg?branch=master)](https://github.com/shogo82148/actions-goveralls/actions)
[![Coverage Status](https://coveralls.io/repos/github/shogo82148/actions-goveralls/badge.svg)](https://coveralls.io/github/shogo82148/actions-goveralls)

[Coveralls](https://coveralls.io/) GitHub Action with Go integration powered by [mattn/goveralls](https://github.com/mattn/goveralls).

## SYNOPSIS

### Working with Checkout V2

Add the following step snippet to your workflows.

```yaml
- uses: actions/checkout@v2
- run: git fetch --depth=1 origin "$GITHUB_HEAD_REF"
  if: github.event_name == 'pull_request'
- uses: shogo82148/actions-goveralls@v1
  with:
    path-to-profile: profile.cov
```

[actions/checkout@v2](https://github.com/actions/checkout/releases/tag/v2.0.0) is improved fetch performance,
but it doesn't fetch commits required by goveralls in `pull_request` event by default.
You have to fetch the commits by `git fetch --depth=1 origin "$GITHUB_HEAD_REF"` yourself.

### Working with Checkout V1

```yaml
- uses: actions/checkout@v1
- uses: shogo82148/actions-goveralls@v1
  with:
    path-to-profile: profile.cov
```

### Parallel Job Example

actions-goveralls supports [Parallel Builds Webhook](https://docs.coveralls.io/parallel-build-webhook).
Here is an example of matrix builds.

```yaml
on: [push, pull_request]
jobs:

  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        go: ['1.11', '1.12', '1.13']

    steps:
      - uses: actions/setup-go@v1
        with:
          go-version: ${{ matrix.go }}
      - uses: actions/checkout@v2
      - run: git fetch --depth=1 origin "$GITHUB_HEAD_REF"
        if: github.event_name == 'pull_request'
      - run: go test -v -coverprofile=profile.cov .

      - name: Send coverage
        uses: shogo82148/actions-goveralls@v1
        with:
          path-to-profile: profile.cov
          parallel: true

  # notifies that all test jobs are finished.
  finish:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: shogo82148/actions-goveralls@v1
        with:
          parallel-finished: true
```

### Use with Legacy GOPATH mode

If you want to use Go 1.10 or earlier, you have to set `GOPATH` environment value and the working directory.
See <https://github.com/golang/go/wiki/GOPATH> for more detail.

Here is an example for testing `example.com/owner/repo` package.

```yaml
- uses: actions/checkout@v2
  with:
    path: src/example.com/owner/repo

# run test
- run: go test
  working-directory: src/example.com/owner/repo
  env:
    GOPATH: ${{ github.workspace }}

# send coverage
- run: git fetch --depth=1 origin "$GITHUB_HEAD_REF"
  working-directory: src/example.com/owner/repo
  if: github.event_name == 'pull_request'
- uses: shogo82148/actions-goveralls@v1
  with:
    path-to-profile: profile.cov
    working-directory: src/example.com/owner/repo
  env:
    GOPATH: ${{ github.workspace }}
```
