# shogo82148/actions-goveralls

[Coveralls](https://coveralls.io/) GitHub Action with Go integration powered by [mattn/goveralls](https://github.com/mattn/goveralls).

## SYNOPSIS

Add the following step snippet to your workflows.

```yaml
- uses: shogo82148/actions-goveralls@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
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
      - uses: actions/checkout@v1
      - run: go test -v -coverprofile=profile.cov .

      - name: Send coverage
        uses: shogo82148/actions-goveralls@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          path-to-profile: profile.cov
          parallel: true
          job-number: ${{ strategy.job-index }}

  # notifies that all test jobs are finished.
  finish:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: shogo82148/actions-goveralls@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          parallel-finished: true
```
