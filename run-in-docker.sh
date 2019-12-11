#!/bin/sh

CURRENT=$(cd "$(dirname "$0")" && pwd)
docker run --rm \
    -e GO111MODULE=on \
    -e "GOOS=${GOOS:-linux}" -e "GOARCH=${GOARCH:-amd64}" -e "CGO_ENABLED=${CGO_ENABLED:-0}" \
    -v "$CURRENT/.mod":/go/pkg/mod \
    -v "$CURRENT":/go/src/github.com/shogo82148/actions-goveralls \
    -w /go/src/github.com/shogo82148/actions-goveralls golang:1.13.5 "$@"
