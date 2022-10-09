#!/usr/bin/env node

import fs from "fs";
import process from "process";

import { execaSync } from "execa";
import chalk from "chalk";

import questions from "../questions/index.js";

// 存放模板文件的目录路径
const templatesDirPath = "q-cli-project-template";
const processCwd = process.cwd();
const processCwdArr = processCwd.split("/");
const templatesDirRootPath = `/${processCwdArr[1]}/${processCwdArr[2]}/${templatesDirPath}`;

const config = await questions(templatesDirRootPath);

// 创建项目目录，以防止用户输入

if (!fs.existsSync(`./${config.projectName}`)) {
  fs.mkdirSync(`./${config.projectName}`);
} else {
  console.log(chalk.red("项目名已存在"));
}

if (!fs.existsSync(templatesDirRootPath)) {
  fs.mkdirSync(templatesDirRootPath);
}

// 获取远程仓库目录名称
const getGitRemoteFilename = () => {
  const arr = config.remoteUrl.split("/");
  return arr[arr.length - 1].split(".")[0];
};

// 远程仓库目录名称
const gitRemoteFilename = getGitRemoteFilename();

let getGitRemoteResult = {}; // 拉取远程仓库结果
// 获取远程仓库代码
const getGitRemote = () => {
  // 该远程仓库是否已经存在于本地
  const exist = fs.existsSync(
    `${templatesDirRootPath}/${gitRemoteFilename}/.git`
  );
  if (exist) {
    // 存在，则 git pull
    getGitRemoteResult = execaSync(`git`, ["pull"], {
      cwd: `${templatesDirRootPath}/${gitRemoteFilename}`,
      stdio: [2, 2, 2], // 使子进程的输入输出流继承父进程，在当前父进程显示子进程的输入与输出
    });
  } else {
    // 不存在，则 git clone
    try {
      getGitRemoteResult = execaSync(`git`, ["clone", config.remoteUrl], {
        cwd: templatesDirRootPath,
        stdio: [2, 2, 2], // 使子进程的输入输出流继承父进程，在当前父进程显示子进程的输入与输出
      });
    } catch (err) {
      fs.rmdirSync(`./${config.projectName}`);
    }
  }

  fs.writeFile(
    `${templatesDirRootPath}/defaultRemoteUrl.txt`,
    config.remoteUrl,
    (err) => {
      console.log(chalk.red('远程仓库路径保存失败！'));
    }
  );
  if (
    getGitRemoteResult.failed === false ||
    getGitRemoteResult.failed === undefined ||
    getGitRemoteResult.failed === null
  ) {
    console.log(chalk.red("读取远程仓库失败！"));
  } else {
    console.log(chalk.green("读取远程仓库成功！"));
  }
};

getGitRemote();
