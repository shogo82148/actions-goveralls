"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
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
    "GITHUB_BASE_REF"
];
async function run(options) {
    const env = {
        COVERALLS_TOKEN: options.token
    };
    for (const name of go_environment_values) {
        const value = process.env[name];
        if (value) {
            env[name] = value;
        }
    }
    const args = [`-coverprofile=${options.profile}`, "-service=github"];
    if (options.parallel) {
        args.push("-parallel");
        if (options.job_number !== "") {
            args.push(`-jobnumber=${options.job_number}`);
        }
    }
    await exec.exec(get_goveralls_path(), args, {
        env: env,
        cwd: options.working_directory
    });
}
async function finish(options) {
    const env = {
        COVERALLS_TOKEN: options.token
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
        cwd: options.working_directory
    });
}
function get_goveralls_path() {
    const name = process.platform === "win32"
        ? "goveralls_windows_amd64.exe"
        : `goveralls_${process.platform}_amd64`;
    return path.join(__dirname, "..", "bin", name);
}
