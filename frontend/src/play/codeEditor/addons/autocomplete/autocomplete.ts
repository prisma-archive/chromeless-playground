import * as ps from '../../../projectService';
import * as templates from './templates';
import CodeMirror = require('codemirror');
require('codemirror/addon/hint/show-hint');
require('codemirror/addon/hint/javascript-hint');

import { ExtendedCodeMirrorHint, render, isCompletionActive } from "./autocompleteShared";
import { debounce, createMap, throttle } from '../../../../utils';
import { cssRaw } from 'typestyle';

cssRaw(require('./autocomplete.css'));


/** Enable showhint for this code mirror */
export function setupOptions(cmOptions: any, filePath: string) {
  cmOptions.showHint = true;
  cmOptions.hintOptions = {
    completeOnSingleClick: true, // User can click on the item to select it :)
    completeSingle: false, // Don't compelete the last item
    hint: new AutoCompleter(filePath).hint,
  };

  // Debugging
  cmOptions.hintOptions.closeOnUnfocus = false; // DEBUG
}

/** Mostly make completions more aggressive */
export function setupCodeMirror(cm: CodeMirror.EditorFromTextArea) {
  let timeout: any;

  // Don't be aggresive on these ending characters
  let ignoreEnds = createMap([
    ';', ',',
    ')',
    '`', '"', "'",
    "{", "}", "[", "]",
    " "
  ]);

  (cm as any).on("inputRead", function(ed: any, change: CodeMirror.EditorChange) {
    let editor: CodeMirror.EditorFromTextArea = ed;

    /** Very important to clear any pending request */
    if (timeout) {
      clearTimeout(timeout);
    }

    /** only on user input (e.g. exclude `cut`) */
    if (change.origin !== '+input') {
      return;
    }

    if (change && change.text && ignoreEnds[change.text.join('')]) {
      return;
    }

    timeout = setTimeout(function() {
      // if a completion is already active ... then cm will call us anyways :)
      if (isCompletionActive(editor)) {
        // For some reason it doesn't for `.`
        // Suspect its because `token` changes and therefore show-hint hides it ¯\_(ツ)_/¯
        let cur = editor.getDoc().getCursor();
        if (editor.getTokenAt(cur).string !== '.') {
          return;
        }
      }
      (CodeMirror as any).showHint(cm as any);
    }, 150);
  });

  /** We don't get input reads on `(` for some reason */
  (cm as any).on('keyup', function(ed: any, evt: KeyboardEvent) {
    if (evt.which === 57 && !isCompletionActive(ed)) {
      (CodeMirror as any).showHint(cm as any);
    }
  });
}

export class AutoCompleter {
  /** if not the last request ... don't show results */
  lastRequest: number;

  constructor(public filePath: string) {
    // Make hint async
    (this.hint as any).async = true;
  }

  hint = throttle((editor: CodeMirror.EditorFromTextArea, cb: (hints: CM.Hints) => void, options): void => {

    // options is just a copy of the `hintOptions` with defaults added
    // So do something fancy with the Editor
    // console.log(ed,options);
    // console.log(options);

    let cur = editor.getDoc().getCursor();
    let token = editor.getTokenAt(cur);
    let prefix = token.string;
    let position = editor.getDoc().indexFromPos(cur);

    /** For various reasons if we don't want to return completions */
    let noCompletions: CM.Hints = null;


    /** Purely designed to attach the render function + any information the render function needs */
    function completionToCodeMirrorHint(completion: Completion, queryString: string): ExtendedCodeMirrorHint {
      let result: ExtendedCodeMirrorHint = {
        text: completion.name,
        render: render,
        comment: completion.comment,

        // Information the render function needs
        original: completion,
        queryString
      }
      return result;
    }

    // This code is based on http://codemirror.net/addon/tern/tern.js `hint` function
    function setupCompletionDocs<T>(obj: T): T {
      var cls = "CodeMirror-Tern-"; // this was a global var that I pull *in*

      var tooltip = null;
      CodeMirror.on(obj, "close", function() { remove(tooltip); });
      CodeMirror.on(obj, "update", function() { remove(tooltip); });
      CodeMirror.on(obj, "select", function(cur: ExtendedCodeMirrorHint, node) {
        remove(tooltip);
        var content = cur.comment;
        if (content) {
          tooltip = makeTooltip(node.parentNode.getBoundingClientRect().right + window.pageXOffset,
            node.getBoundingClientRect().top + window.pageYOffset, content);
          tooltip.className += " " + cls + "hint-doc";
        }
      });
      return obj;

      // pulled in these functions as they were it is
      function remove(node) {
        var p = node && node.parentNode;
        if (p) p.removeChild(node);
      }
      function makeTooltip(x, y, content) {
        var node = (elt as any)("div", cls + "tooltip", content);
        node.style.left = x + "px";
        node.style.top = y + "px";
        document.body.appendChild(node);
        return node;
      }
      function elt(tagname, cls /*, ... elts*/) {
        var e = document.createElement(tagname);
        if (cls) e.className = cls;
        for (var i = 2; i < arguments.length; ++i) {
          var elt = arguments[i];
          if (typeof elt == "string") elt = document.createTextNode(elt);
          e.appendChild(elt);
        }
        return e;
      }
    }

    // if in active project or a supported config file

    this.lastRequest = position;
    const res = ps.getCompletionsAtPosition({ filePath: this.filePath, position, prefix })
    if (this.lastRequest !== position || !editor.hasFocus()) {
      cb(null);
      return;
    }

    let from = { line: cur.line, ch: token.start };
    let to = { line: cur.line, ch: token.start + prefix.length };

    // Don't eat these characters !
    // (our projectService completions come back without these)
    if (token.string == '.' || token.string == '{') {
      from = to;
    }

    let completionInfo = {
      from,
      to,
      list: res.completions.filter(x => !x.snippet).map(c => completionToCodeMirrorHint(c, token.string))
    };

    // Function completion snippets
    const functionCompletionSnippets = res.completions.filter(x => !!x.snippet).map(x => {
      const template = new templates.Template({
        name: x.snippet.name,
        description: x.snippet.description,
        template: x.snippet.template,
        functionCompletion: prefix && prefix == '(',
      });
      return template
    });
    const functionCompletionSnippetsRendered = templates.renderTemplates(editor, functionCompletionSnippets);

    setupCompletionDocs(completionInfo);

    cb(completionInfo);

    return;
  }, 500);

}