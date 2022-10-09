import fs from "fs";

export default (templatesDirRootPath) => {
  let remoteUrl = "";
  if (fs.existsSync(`${templatesDirRootPath}/defaultRemoteUrl.txt`)) {
    remoteUrl = fs.readFileSync(
      `${templatesDirRootPath}/defaultRemoteUrl.txt`,
      "utf-8"
    );
  }
  return {
    type: "input",
    name: "remoteUrl",
    default: remoteUrl || undefined,
    message: "请设置远程项目模版地址：",
    validate(val) {
      // 校验 git 仓库地址的正则
      const gitRemoteUrlRegex = /((git@|http(s)?:\/\/))([\w\.@\:/\-~]+)(\.git)/;

      if (!val) {
        return "请设置远程项目模版地址";
      } else if (!gitRemoteUrlRegex.test(val)) {
        return "远程仓库地址格式错误，请重新输入";
      } else {
        return true;
      }
    },
  };
};
