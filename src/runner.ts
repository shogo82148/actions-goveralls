import * as path from "path";
import * as exec from "@actions/exec";

export async function goveralls(token: string, profile: string) {
  const env = {
    COVERALLS_TOKEN: token
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
  await exec.exec(
    get_goveralls_path(),
    [`-coverprofile=${profile}`, "-service=github"],
    {
      env: env
    }
  );
}

function get_goveralls_path(): string {
  const name =
    process.platform === "win32"
      ? "goveralls_windows_amd64.exe"
      : `goveralls_${process.platform}_amd64`;
  return path.join(__dirname, "..", "bin", name);
}
