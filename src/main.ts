import * as core from "@actions/core";
import { goveralls } from "./runner";

async function run() {
  try {
    await goveralls({
      token: core.getInput("github-token"),
      profile: core.getInput("path-to-profile"),
      parallel: parseBoolean(core.getInput("parallel") || "false"),
      parallel_finished: parseBoolean(
        core.getInput("parallel-finished") || "false"
      ),
      job_number: core.getInput("job-number"),
      working_directory: core.getInput("working-directory")
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

function parseBoolean(s: string): boolean {
  switch (s) {
    case "y":
    case "Y":
    case "yes":
    case "Yes":
    case "YES":
    case "true":
    case "True":
    case "TRUE":
    case "on":
    case "On":
    case "ON":
      return true;
    case "n":
    case "N":
    case "no":
    case "No":
    case "NO":
    case "false":
    case "False":
    case "FALSE":
    case "off":
    case "Off":
    case "OFF":
      return false;
  }
  throw new Error(`invalid boolean value: ${s}`);
}

run();
