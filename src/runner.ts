import * as path from "path";
import * as exec from "@actions/exec";
import * as core from "@actions/core";

interface Options {
  token: string;
  profile: string;
  parallel: boolean;
  parallel_finished: boolean;
  flag_name: string;
  working_directory: string;
  ignore: string;
}

export async function goveralls(options: Options) {
  if (options.parallel_finished) {
    await finish(options);
  } else {
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

async function run(options: Options) {
  const env = {
    COVERALLS_TOKEN: options.token,
  };

  for (const name of go_environment_values) {
    const value = process.env[name];
    if (value) {
      env[name] = value;
    } else if (name.match(/^GO/)) {
      env[name] = await go_env(name);
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
  if (core.isDebug()) {
    args.push("-debug");
  }
  await exec.exec(get_goveralls_path(), args, {
    env: env,
    cwd: options.working_directory,
  });
}

async function finish(options: Options) {
  const env = {
    COVERALLS_TOKEN: options.token,
  };
  for (const name of go_environment_values) {
    const value = process.env[name];
    if (value) {
      env[name] = value;
    } else if (name.match(/^GO/)) {
      env[name] = await go_env(name);
    }
  }
  const args = ["-parallel-finish", "-service=github"];
  await exec.exec(get_goveralls_path(), args, {
    env: env,
    cwd: options.working_directory,
  });
}

// run `go env` and return its value.
async function go_env(name: string): Promise<string> {
  let out = "";
  await exec.exec("go", ["env", name], {
    listeners: {
      stdout: (data: Buffer) => {
        out += data.toString();
      },
    },
  });
  return out.trim();
}

function get_goveralls_path(): string {
  const name =
    process.platform === "win32"
      ? "goveralls_windows_amd64.exe"
      : `goveralls_${process.platform}_amd64`;
  return path.join(__dirname, "..", "bin", name);
}
