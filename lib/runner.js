"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const exec = __importStar(require("@actions/exec"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
async function goveralls(options) {
    const event = JSON.parse(fs_1.default.readFileSync(process.env.GITHUB_EVENT_PATH.toString(), "utf8"));
    const sha = process.env.GITHUB_SHA.toString().substr(0, 9);
    const job_id = process.env.GITHUB_EVENT_NAME === "pull_request"
        ? `${sha}-PR-${event.number}`
        : sha;
    if (options.parallel_finished) {
        await finish(options, job_id);
    }
    else {
        await run(options, job_id);
    }
}
exports.goveralls = goveralls;
async function run(options, job_id) {
    const env = {
        COVERALLS_TOKEN: options.token
    };
    // copy environment values related to Go
    const names = [
        "PATH",
        "GOROOT",
        "GOPATH",
        "GOBIN",
        "GOTMPDIR",
        "GOTOOLDIR",
        "GOOS",
        "GOARCH",
        // GOCAHE and fall back directories
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
    for (const name of names) {
        const value = process.env[name];
        if (value) {
            env[name] = value;
        }
    }
    const args = [
        `-coverprofile=${options.profile}`,
        "-service=github",
        `-jobid=${job_id}`
    ];
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
async function finish(options, job_id) {
    const payload = {
        repo_token: options.token,
        repo_name: process.env.GITHUB_REPOSITORY,
        payload: { build_num: job_id, status: "done" }
    };
    const response = await axios_1.default.post("https://coveralls.io/webhook", payload);
    if (!response.data.done) {
        throw new Error(JSON.stringify(response.data));
    }
}
function get_goveralls_path() {
    const name = process.platform === "win32"
        ? "goveralls_windows_amd64.exe"
        : `goveralls_${process.platform}_amd64`;
    return path.join(__dirname, "..", "bin", name);
}
