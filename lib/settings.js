"use babel";

export default {
  formatOnSave: {
    title: "Format on Save",
    description: "Automatically format files on save.",
    type: "boolean",
    default: true,
    order: 1
  },
  showErrorNotifications: {
    title: "Show Error Notifications",
    description: "Show error notifications when formatting fails.",
    type: "boolean",
    default: true,
    order: 2
  },
  elixirPath: {
    title: "Elixir Path",
    description:
      "Use a specific `elixir` installation by providing its absolute path " +
      "to the `bin` folder. By default it is used the one found in the " +
      "PATH environment variable.",
    type: "string",
    default: "",
    order: 3
  }
};
