# shogo82148/actions-goveralls

[![test](https://github.com/shogo82148/actions-goveralls/workflows/test/badge.svg?branch=master)](https://github.com/shogo82148/actions-goveralls/actions)

[Coveralls](https://coveralls.io/) GitHub Action with Go integration powered by [mattn/goveralls](https://github.com/mattn/goveralls).

## SYNOPSIS

Add the following step snippet to your workflows.

```yaml
- uses: actions/checkout@v1
- uses: shogo82148/actions-goveralls@v1
  with:
    path-to-profile: profile.cov
```

### Working with Checkout V2

[actions/checkout@v2](https://github.com/actions/checkout/releases/tag/v2.0.0) is improved fetch performance,
but it doesn't fetch commits required by goveralls in `pull_request` event by default.
You have to fetch the commits by `git fetch --depth=1 origin "$GITHUB_HEAD_REF"` yourself.

```yaml
- uses: actions/checkout@v2
- run: test -z "${GITHUB_HEAD_REF:-}" || git fetch --depth=1 origin "$GITHUB_HEAD_REF"
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
      - run: test -z "${GITHUB_HEAD_REF:-}" || git fetch --depth=1 origin "$GITHUB_HEAD_REF"
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
