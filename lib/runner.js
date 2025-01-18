"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.goveralls = goveralls;
const path = __importStar(require("path"));
const exec = __importStar(require("@actions/exec"));
const core = __importStar(require("@actions/core"));
async function goveralls(options) {
    if (options.parallel_finished) {
        await finish(options);
    }
    else {
        await run(options);
    }
}
// copy environment values related to Go
const go_environment_values = [
    "PATH",
    "GOROOT",
    "GOPATH",
    "GOBIN",
    "GOTMPDIR",
    "GOTOOLDIR",
    "GOOS",
    "GOARCH",
    // GOCACHE and fall back directories
    "GOCACHE",
    "LocalAppData",
    "HOME",
    "XDG_CACHE_HOME",
    // GitHub events information
    "GITHUB_WORKFLOW",
    "GITHUB_RUN_ID",
    "GITHUB_RUN_NUMBER",
    "GITHUB_ACTION",
    "GITHUB_ACTIONS",
    "GITHUB_ACTOR",
    "GITHUB_REPOSITORY",
    "GITHUB_EVENT_NAME",
    "GITHUB_EVENT_PATH",
    "GITHUB_WORKSPACE",
    "GITHUB_SHA",
    "GITHUB_REF",
    "GITHUB_HEAD_REF",
    "GITHUB_BASE_REF",
];
async function run(options) {
    const env = {
        COVERALLS_TOKEN: options.token,
    };
    for (const name of go_environment_values) {
        const value = process.env[name] || (name.match(/^GO/) && (await go_env(name)));
        if (value) {
            env[name] = value;
        }
    }
    const args = ["-service=github"];
    if (options.profile) {
        args.push(`-coverprofile=${options.profile}`);
    }
    if (options.ignore) {
        args.push(`-ignore=${options.ignore}`);
    }
    if (options.parallel) {
        args.push("-parallel");
        if (options.flag_name !== "") {
            args.push(`-flagname=${options.flag_name}`);
        }
    }
    if (options.shallow) {
        args.push("-shallow");
    }
    if (core.isDebug()) {
        args.push("-debug");
    }
    await exec.exec(get_goveralls_path(), args, {
        env: env,
        cwd: options.working_directory,
    });
}
async function finish(options) {
    const env = {
        COVERALLS_TOKEN: options.token,
    };
    for (const name of go_environment_values) {
        const value = process.env[name] || (name.match(/^GO/) && (await go_env(name)));
        if (value) {
            env[name] = value;
        }
    }
    const args = ["-parallel-finish", "-service=github"];
    if (options.ignore) {
        args.push(`-ignore=${options.ignore}`);
    }
    if (options.shallow) {
        args.push("-shallow");
    }
    if (core.isDebug()) {
        args.push("-debug");
    }
    await exec.exec(get_goveralls_path(), args, {
        env: env,
        cwd: options.working_directory,
    });
}
// run `go env` and return its value.
//
// goveralls doesn't use the `go list` command but uses the `go/build` package.
// `go list` sees the `GOROOT` environment value, and its default value is typically `/usr/local/go`.
// But sometimes it isn't, e.g. the `go` command is built from the source and customized.
//
// So if `GOROOT` is not configured, get its value by running `go env GOROOT`.
//
// see https://github.com/shogo82148/actions-goveralls/pull/216 and https://github.com/shogo82148/actions-goveralls/issues/214
async function go_env(name) {
    let out = "";
    await exec.exec("go", ["env", name], {
        listeners: {
            stdout: (data) => {
                out += data.toString();
            },
        },
    });
    return out.trim();
}
function get_goveralls_path() {
    let os;
    let suffix = "";
    switch (process.platform) {
        case "win32":
            os = "windows";
            suffix = ".exe";
            break;
        case "darwin":
            os = "darwin";
            break;
        case "linux":
            os = "linux";
            break;
        default:
            throw new Error(`unsupported OS: ${process.platform}`);
    }
    let arch;
    switch (process.arch) {
        case "x64":
            arch = "amd64";
            break;
        case "arm64":
            arch = "arm64";
            break;
        default:
            throw new Error(`unsupported architecture: ${process.arch}`);
    }
    return path.join(__dirname, "..", "bin", `goveralls_${os}_${arch}${suffix}`);
}
