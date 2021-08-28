import * as core from "@actions/core";
import { goveralls } from "./runner";

async function run() {
  try {
    await goveralls({
      token: core.getInput("github-token"),
      profile: core.getInput("path-to-profile"),
      parallel: core.getBooleanInput("parallel"),
      parallel_finished: core.getBooleanInput("parallel-finished"),
      flag_name: core.getInput("flag-name"),
      working_directory: core.getInput("working-directory"),
      ignore: core.getInput("ignore"),
    });
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error);
    } else {
      core.setFailed(`${error}`);
    }
  }
}

run();
