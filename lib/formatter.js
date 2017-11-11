"use babel";

import main from "./main";
import fs from "fs";
import path from "path";
import process from "child_process";
import utils from "./utils";

export default {
  // formats the active text editor
  formatActiveTextEditor() {
    if ((editor = atom.workspace.getActiveTextEditor())) {
      if (main.hasElixirGrammar(editor)) {
        this.formatTextEditor(editor, this.getSelectedRange(editor));
      } else {
        atom.notifications.addInfo(
          "Elixir Formatter only formats Elixir source code",
          { dismissable: false }
        );
      }
    }
  },

  // formats the given text editor
  formatTextEditor(editor, range = null) {
    try {
      const { status, stdout, stderr, error } = this.runFormat(
        this.getTextInRange(editor, range)
      );

      if (status == 0 && (!stderr || !stderr.length) && !error) {
        this.insertText(editor, range, stdout.toString());
      } else {
        this.showErrorNotifcation("Elixir Formatter Error", {
          detail: stderr || error
        });
      }
    } catch (exception) {
      this.showErrorNotifcation("Elixir Formatter Exception", {
        detail: exception,
        stack: exception.stack
      });
    }
  },

  getSelectedRange(editor) {
    range = editor.getSelectedBufferRange();
    if (range.isEmpty()) {
      range = null;
    }
    return range;
  },

  // returns text in given range (or entire text if no range given)
  getTextInRange(editor, range = null) {
    if (range) {
      return editor.getTextInBufferRange(range);
    } else {
      return editor.getText();
    }
  },

  // runs mix format process and returns response
  runFormat(text) {
    var opts = { input: text, shell: true };

    if ((projectPath = main.projectPath())) {
      opts.cwd = projectPath;
    }

    const elixirPath = main.elixirPath();

    if (elixirPath) {
      const elixir = utils.safePathJoin(elixirPath, "elixir");
      const mix = utils.safePathJoin(elixirPath, "mix");

      // run command with custom Elixir path
      // `<elixirPath>\elixir <elixirPath>\mix format -`
      return process.spawnSync(
        elixir,
        [mix, "format", "-"],
        opts
      );
    }

    // run default command `mix format -`
    return process.spawnSync(
      "mix",
      ["format", "-"],
      opts
    );
  },

  // inserts the given text and updates cursor position
  insertText(editor, range, text) {
    if (range) {
      editor.setTextInBufferRange(range, this.indentText(editor, range, text));
      editor.setCursorScreenPosition(range.start);
    } else {
      const cursorPosition = editor.getCursorScreenPosition();
      editor.setText(text);
      editor.setCursorScreenPosition(cursorPosition);
    }
  },

  // indents text using indentation level of first line of range
  indentText(editor, range, text) {
    const indentation = editor.indentationForBufferRow(range.start.row);

    if (editor.softTabs) {
      prefix = " ".repeat(indentation * editor.getTabLength());
    } else {
      prefix = "\t".repeat(indentation);
    }

    return prefix + text.replace(/\n/g, "\n" + prefix);
  },

  // shows error notification
  showErrorNotifcation(message, options = {}) {
    if (main.showErrorNotifications()) {
      options["dismissable"] = true;
      atom.notifications.addError(message, options);
    }
  }
};
