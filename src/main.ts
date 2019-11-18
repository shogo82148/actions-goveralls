import * as core from "@actions/core";
import axios, { AxiosResponse } from "axios";
import fs from "fs";
import { goveralls } from "./runner";

async function run() {
  try {
    const token = core.getInput("github-token");
    const profile = core.getInput("path-to-profile");
    const parallel = parseBoolean(core.getInput("parallel"));
    const parallel_finished = parseBoolean(core.getInput("parallel-finished"));
    const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH!.toString(), 'utf8'));
    const sha = process.env.GITHUB_SHA!.toString().substr(0, 9);
    const job_id = process.env.GITHUB_EVENT_NAME === 'pull_request' ? `${sha}-PR-${event.number}` : sha;

    if (parallel_finished) {
      await finished(token, job_id);
      return;
    }
    await goveralls(token, profile, job_id, parallel);

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

interface WebhookResult {
  canceled: boolean;
  done: boolean;
  errored: boolean;
}

async function finished(token: string, job_id: string) {
  const payload = {
    "repo_token": token,
    "repo_name": process.env.GITHUB_REPOSITORY,
    "payload": { "build_num": job_id, "status": "done" }
  };

  const response: AxiosResponse<WebhookResult> = await axios.post("https://coveralls.io/webhook", payload);
  if (!response.data.done) {
    throw new Error(JSON.stringify(response.data));
  }
}

run();
