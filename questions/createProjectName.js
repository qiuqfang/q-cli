export default () => ({
  type: "input",
  name: "projectName",
  message: "请输入要创建的项目名称：",
  default: "my-project",
  validate(val) {
    if (val) return true;
    return "请输入要创建的项目名称";
  },
});
