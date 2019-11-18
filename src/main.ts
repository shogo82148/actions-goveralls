import * as core from "@actions/core";
import { goveralls } from "./runner";

async function run() {
  try {
    const token = core.getInput("github-token");
    const profile = core.getInput("path-to-profile");
    const parallel = parseBoolean(core.getInput("parallel"));
    await goveralls(token, profile, parallel);
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
      return true;
    case "n":
    case "N":
    case "no":
    case "No":
    case "NO":
    case "false":
    case "False":
    case "FALSE":
      return false;
  }
  throw `invalid boolean value: ${s}`;
}

run();
