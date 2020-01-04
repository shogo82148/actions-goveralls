"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const runner_1 = require("./runner");
async function run() {
    try {
        await runner_1.goveralls({
            token: core.getInput("github-token"),
            profile: core.getInput("path-to-profile"),
            parallel: parseBoolean(core.getInput("parallel") || "false"),
            parallel_finished: parseBoolean(core.getInput("parallel-finished") || "false"),
            job_number: core.getInput("job-number"),
            working_directory: core.getInput("working-directory")
        });
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
function parseBoolean(s) {
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
