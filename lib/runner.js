"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.goveralls = void 0;
const path = __importStar(require("path"));
const exec = __importStar(require("@actions/exec"));
async function goveralls(options) {
    if (options.parallel_finished) {
        await finish(options);
    }
    else {
        await run(options);
    }
}
exports.goveralls = goveralls;
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
        const value = process.env[name];
        if (value) {
            env[name] = value;
        }
    }
    const args = [
        `-coverprofile=${options.profile}`,
        "-service=github",
        `-ignore=${options.ignore}`,
    ];
    if (options.parallel) {
        args.push("-parallel");
        if (options.flag_name !== "") {
            args.push(`-flagname=${options.flag_name}`);
        }
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
        const value = process.env[name];
        if (value) {
            env[name] = value;
        }
    }
    const args = ["-parallel-finish", "-service=github"];
    await exec.exec(get_goveralls_path(), args, {
        env: env,
        cwd: options.working_directory,
    });
}
function get_goveralls_path() {
    const name = process.platform === "win32"
        ? "goveralls_windows_amd64.exe"
        : `goveralls_${process.platform}_amd64`;
    return path.join(__dirname, "..", "bin", name);
}
