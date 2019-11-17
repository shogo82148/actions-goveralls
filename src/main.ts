import * as core from "@actions/core";
import { goveralls } from "./runner";

async function run() {
  try {
    const token = core.getInput("github-token");
    const profile = core.getInput("path-to-profile");
    await goveralls(token, profile);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
