import simpleGit from "simple-git";
import Heroku from "heroku-client";

const git = simpleGit();

export const updateHerokuApp = async () => {
    const heroku = new Heroku({ token: process.env.HEROKU_API_KEY });

    await git.fetch();
    const commits = await git.log(["master..origin/master"]);
    if (commits.total === 0) return "```You already have the latest version installed.```";

    const app = await heroku.get(`/apps/${process.env.HEROKU_APP_NAME}`);
    const gitUrl = app.git_url.replace("https://", `https://api:${process.env.HEROKU_API_KEY}@`);
    await git.addRemote("heroku", gitUrl);
    await git.push("heroku", "master");

    return "```Bot updated. Restarting.```";
};
