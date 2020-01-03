import * as path from "path";
import * as exec from "@actions/exec";
import axios, { AxiosResponse } from "axios";
import fs from "fs";

interface Options {
  token: string;
  profile: string;
  parallel: boolean;
  parallel_finished: boolean;
  job_number: string;
  working_directory: string;
}

export async function goveralls(options: Options) {
  const event = JSON.parse(
    fs.readFileSync(process.env.GITHUB_EVENT_PATH!.toString(), "utf8")
  );
  const sha = process.env.GITHUB_SHA!.toString().substr(0, 9);
  const job_id =
    process.env.GITHUB_EVENT_NAME === "pull_request"
      ? `${sha}-PR-${event.number}`
      : sha;

  if (options.parallel_finished) {
    await finish(options, job_id);
  } else {
    await run(options, job_id);
  }
}

async function run(options: Options, job_id: string) {
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
    `-jobid=${job_id}`,
    "-stdout"
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

interface WebhookResult {
  canceled: boolean;
  done: boolean;
  errored: boolean;
}

async function finish(options: Options, job_id: string) {
  const payload = {
    repo_token: options.token,
    repo_name: process.env.GITHUB_REPOSITORY,
    payload: { build_num: job_id, status: "done" }
  };

  const response: AxiosResponse<WebhookResult> = await axios.post(
    "https://coveralls.io/webhook",
    payload
  );
  if (!response.data.done) {
    throw new Error(JSON.stringify(response.data));
  }
}

function get_goveralls_path(): string {
  const name =
    process.platform === "win32"
      ? "goveralls_windows_amd64.exe"
      : `goveralls_${process.platform}_amd64`;
  return path.join(__dirname, "..", "bin", name);
}
