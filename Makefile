help: ## show this text
	# http://postd.cc/auto-documented-makefile/
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'¥

GO=go

.PHONY: all linux darwin windows
all: linux darwin windows ## build all binaries

linux: bin/goveralls_linux_amd64 ## build Linux binary
bin/goveralls_linux_amd64: go.mod go.sum
	mkdir -p bin
	GOOS=linux GOARCH=amd64 $(GO) build -o bin/goveralls_linux_amd64 github.com/shogo82148/goveralls

darwin: bin/goveralls_darwin_amd64 ## build macOS binary
bin/goveralls_darwin_amd64: go.mod go.sum
	mkdir -p bin
	GOOS=darwin GOARCH=amd64 $(GO) build -o bin/goveralls_darwin_amd64 github.com/shogo82148/goveralls

windows: bin/goveralls_windows_amd64.exe ## build windows binary
bin/goveralls_windows_amd64.exe: go.mod go.sum
	mkdir -p bin
	GOOS=windows GOARCH=amd64 $(GO) build -o bin/goveralls_windows_amd64.exe github.com/shogo82148/goveralls

