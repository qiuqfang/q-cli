import { program } from "commander";
import inquirer from "inquirer";

import fs from "fs";
import process from "process";

import { execaSync } from "execa";
import chalk from "chalk";

import { inputRemoteUrl } from "../questions/index.js";
import { log } from "../utils/log.js";

// 存放模板文件的目录路径
const templatesDirPath = "q-cli-project-template";
const processCwd = process.cwd();
const processCwdArr = processCwd.split("/");
const templatesDirRootPath = `/${processCwdArr[1]}/${processCwdArr[2]}/${templatesDirPath}`;

const createProjectFolder = (projectName) => {
  if (!fs.existsSync(`./${projectName}`)) {
    fs.mkdirSync(`./${projectName}`);
  } else {
    throw new Error("项目名已存在");
  }
};

// 获取远程仓库代码
const getGitRemote = (projectName, remoteUrl) => {
  const arr = remoteUrl.split("/");
  const gitRemoteFilename = arr[arr.length - 1].split(".")[0];
  let getGitRemoteResult = {}; // 拉取远程仓库结果

  // 该远程仓库是否已经存在于本地
  const isExist = fs.existsSync(
    `${templatesDirRootPath}/${gitRemoteFilename}/.git`
  );
  if (isExist) {
    // 存在，则 git pull
    getGitRemoteResult = execaSync(`git`, ["pull"], {
      cwd: `${templatesDirRootPath}/${gitRemoteFilename}`,
      stdio: [2, 2, 2], // 使子进程的输入输出流继承父进程，在当前父进程显示子进程的输入与输出
    });
  } else {
    // 不存在，则 git clone
    try {
      getGitRemoteResult = execaSync(`git`, ["clone", remoteUrl], {
        cwd: templatesDirRootPath,
        stdio: [2, 2, 2], // 使子进程的输入输出流继承父进程，在当前父进程显示子进程的输入与输出
      });
    } catch (err) {
      fs.rmdirSync(`./${projectName}`);
    }
  }

  fs.writeFile(
    `${templatesDirRootPath}/defaultRemoteUrl.txt`,
    remoteUrl,
    (err) => {
      if (err) log(chalk.red("远程仓库路径保存失败！"));
    }
  );
  if (
    getGitRemoteResult.failed === true ||
    getGitRemoteResult.failed === undefined ||
    getGitRemoteResult.failed === null
  ) {
    log(chalk.red("读取远程仓库失败！"));
    return false;
  } else {
    log(chalk.green("读取远程仓库成功！"));
    return true;
  }
};

program
  .command("create")
  .description("新建一个项目")
  .argument("[string]", "项目名称", "my-project")
  .action(async (projectName, options) => {
    const { remoteUrl } = await inquirer.prompt([
      inputRemoteUrl(templatesDirRootPath), // 设置远程仓库地址
    ]);

    // 创建项目目录
    try {
      createProjectFolder(projectName);
    } catch (error) {
      log(chalk.red(error.message));
      return;
    }

    // 拉取远程项目模板
    const result = getGitRemote(projectName, remoteUrl);
    if (!result) return;

    // 复制项目模板到新建的项目中
  });

program.parse();
