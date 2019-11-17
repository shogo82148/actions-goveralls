import * as path from "path";
import * as exec from "@actions/exec";

export async function goveralls(token: string, profile: string) {
  await exec.exec(
    get_goveralls_path(),
    [`-coverprofile=${profile}`, "-service=github"],
    {
      env: {
        COVERALLS_TOKEN: token
      }
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
