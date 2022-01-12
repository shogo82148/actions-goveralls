#!/bin/sh

CURRENT=$(cd "$(dirname "$0")" && pwd)
docker volume create actions-goveralls-cache > /dev/null 2>&1
docker run --rm \
    -e GO111MODULE=on \
    -e "GOOS=${GOOS:-linux}" -e "GOARCH=${GOARCH:-amd64}" -e "CGO_ENABLED=${CGO_ENABLED:-0}" \
    -v actions-goveralls-cache:/go/pkg/mod \
    -v actions-goveralls-cache:/root/.cache \
    -v "$CURRENT":/go/src/github.com/shogo82148/actions-goveralls \
    -w /go/src/github.com/shogo82148/actions-goveralls golang:1.17.6 "$@"
