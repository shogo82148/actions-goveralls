help: ## show this text
	# http://postd.cc/auto-documented-makefile/
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'¥

GO=go

.PHONY: all linux darwin windows
all: linux darwin windows ## build all binaries

linux: bin/goveralls_linux_amd64 bin/goveralls_linux_arm64 ## build Linux binary
bin/goveralls_linux_amd64: go.mod go.sum
	mkdir -p bin
	GOOS=linux GOARCH=amd64 CGO_ENABLED=0 $(GO) build -o bin/goveralls_linux_amd64 github.com/mattn/goveralls
bin/goveralls_linux_arm64: go.mod go.sum
	mkdir -p bin
	GOOS=linux GOARCH=arm64 CGO_ENABLED=0 $(GO) build -o bin/goveralls_linux_arm64 github.com/mattn/goveralls

darwin: bin/goveralls_darwin_amd64 bin/goveralls_darwin_arm64 ## build macOS binary
bin/goveralls_darwin_amd64: go.mod go.sum
	mkdir -p bin
	GOOS=darwin GOARCH=amd64 CGO_ENABLED=0 $(GO) build -o bin/goveralls_darwin_amd64 github.com/mattn/goveralls
bin/goveralls_darwin_arm64: go.mod go.sum
	mkdir -p bin
	GOOS=darwin GOARCH=arm64 CGO_ENABLED=0 $(GO) build -o bin/goveralls_darwin_arm64 github.com/mattn/goveralls

windows: bin/goveralls_windows_amd64.exe bin/goveralls_windows_arm64.exe ## build windows binary
bin/goveralls_windows_amd64.exe: go.mod go.sum
	mkdir -p bin
	GOOS=windows GOARCH=amd64 CGO_ENABLED=0 $(GO) build -o bin/goveralls_windows_amd64.exe github.com/mattn/goveralls
bin/goveralls_windows_arm64.exe: go.mod go.sum
	mkdir -p bin
	GOOS=windows GOARCH=arm64 CGO_ENABLED=0 $(GO) build -o bin/goveralls_windows_arm64.exe github.com/mattn/goveralls
