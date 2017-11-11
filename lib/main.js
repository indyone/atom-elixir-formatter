"use babel";

import { CompositeDisposable } from "atom";
import { dirname } from "path";
import config from "./settings";
import formatter from "./formatter";
import utils from "./utils";

export default {
  config,
  subscriptions: null,

  // registers commands and event hooks
  activate(state) {
    // upgrade from v0.2.6
    upgrade_from_v026();

    this.subscriptions = new CompositeDisposable();

    // register format command
    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "atom-elixir-formatter:format": () => formatter.formatActiveTextEditor()
      })
    );

    // register to receive text editor events
    this.subscriptions.add(
      atom.workspace.observeTextEditors(e => this.handleTextEvents(e))
    );
  },

  // deregisters commands and event hooks
  deactivate() {
    this.subscriptions.dispose();
  },

  // handle text editor events
  handleTextEvents(editor) {
    editor.getBuffer().onWillSave(() => {
      if (this.shouldFormatOnSave() && this.hasElixirGrammar(editor)) {
        formatter.formatTextEditor(editor);
      }
    });
  },

  // returns true if editor grammar is elixir
  hasElixirGrammar(editor) {
    return editor.getGrammar().scopeName === "source.elixir";
  },

  // returns path of current atom project
  projectPath() {
    return atom.project.getPaths()[0];
  },

  // returns the elixir bin path
  elixirPath() {
    return atom.config.get("atom-elixir-formatter.elixirPath") || "";
  },

  // returns true if formatOnSave setting is enabled
  shouldFormatOnSave() {
    return atom.config.get("atom-elixir-formatter.formatOnSave");
  },

  // returns true if showErrorNotifications setting is enabled
  showErrorNotifications() {
    return atom.config.get("atom-elixir-formatter.showErrorNotifications");
  }
};

// upgrades the config from v0.2.6
function upgrade_from_v026() {
  // migrate elixirPath value from elixirExecutable
  var elixirExecutable = atom.config.get("atom-elixir-formatter.elixirExecutable");
  if (elixirExecutable) {
    const elixirPath = dirname(elixirExecutable);
    atom.config.set("atom-elixir-formatter.elixirPath", elixirPath);
  }

  // remove old settings from config
  atom.config.unset("atom-elixir-formatter.elixirExecutable");
  atom.config.unset("atom-elixir-formatter.mixExecutable");
}
