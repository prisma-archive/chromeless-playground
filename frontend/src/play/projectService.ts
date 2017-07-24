import * as ts from 'byots';
import * as lsh from './languageServiceHost';
import * as fuzzaldrin from 'fuzzaldrin';
import * as utils from '../utils';
import { resolve } from '../utils';

const languageServiceHost = new lsh.LanguageServiceHost('', {
  allowNonTsExtensions: true,
  allowJs: true,
  noLib: true, /** We add lib files ourselves */
  jsx: ts.JsxEmit.React,
  experimentalDecorators: true,
});
const languageService = ts.createLanguageService(languageServiceHost, ts.createDocumentRegistry());

export function addFile(filePath: string, contents: string) {
  languageServiceHost.addScript(filePath, contents);
}
export function removeFile(filePath: string) {
  languageServiceHost.removeFile(filePath);
}
export function editFile(filePath: string, codeEdit: CodeEdit) {
  languageServiceHost.applyCodeEdit(filePath, codeEdit.from, codeEdit.to, codeEdit.newText);
}
export function setContents(filePath: string, contents: string) {
  languageServiceHost.setContents(filePath, contents);
}
export function getLineAndCharacterOfPosition(filePath: string, pos: number): EditorPosition {
  return languageServiceHost.getLineAndCharacterOfPosition(filePath, pos);
}
export function getPositionOfLineAndCharacter(filePath: string, line: number, ch: number): number {
  return languageServiceHost.getPositionOfLineAndCharacter(filePath, line, ch);
}

//////////////////////
// 
// ADD all the context files
// 
//////////////////////
addFile('lib.es6.d.ts', require('!raw-loader!typescript/lib/lib.es6.d.ts'));
addFile('chromeless.d.ts', require('!raw-loader!./chromeless.d.ts'))

/** Note : for node_modules typescript calls `fs.existsSync` so lets *patch* it */
const fs = require('fs');
fs.existsSync = function() {
  return true;
}


/**
 * 
 * 
 * 
 * TRUE project service stuff
 * 
 * 
 * 
 */
export function getCompletionsAtPosition(query: Types.GetCompletionsAtPositionQuery): Types.GetCompletionsAtPositionResponse {
  const {filePath, position, prefix} = query;
  const service = languageService;

  const completions: ts.CompletionInfo = service.getCompletionsAtPosition(filePath, position);
  let completionList = completions ? completions.entries.filter(x => !!x) : [];
  const endsInPunctuation = utils.prefixEndsInPunctuation(prefix);

  if (prefix.length && prefix.trim().length && !endsInPunctuation) {
    // Didn't work good for punctuation
    completionList = fuzzaldrin.filter(completionList, prefix.trim(), { key: 'name' });
  }

  /** Doing too many suggestions is slowing us down in some cases */
  let maxSuggestions = 50;
  /** Doc comments slow us down tremendously */
  let maxDocComments = 10;

  // limit to maxSuggestions
  if (completionList.length > maxSuggestions) completionList = completionList.slice(0, maxSuggestions);

  // Potentially use it more aggresively at some point
  // This queries the langauge service so its a bit slow
  function docComment(c: ts.CompletionEntry): {
    /** The display parts e.g. (a:number)=>string */
    display: string;
    /** The doc comment */
    comment: string;
  } {
    const completionDetails = languageService.getCompletionEntryDetails(filePath, position, c.name);
    const comment = ts.displayPartsToString(completionDetails.documentation || []);

    // Show the signatures for methods / functions
    var display: string;
    if (c.kind == "method" || c.kind == "function" || c.kind == "property") {
      let parts = completionDetails.displayParts || [];
      // don't show `(method)` or `(function)` as that is taken care of by `kind`
      if (parts.length > 3) {
        parts = parts.splice(3);
      }
      display = ts.displayPartsToString(parts);
    }
    else {
      display = '';
    }
    display = display.trim();

    return { display: display, comment: comment };
  }

  let completionsToReturn: Completion[] = completionList.map((c, index) => {
    if (index < maxDocComments) {
      var details = docComment(c);
    }
    else {
      details = {
        display: '',
        comment: ''
      }
    }
    return {
      name: c.name,
      kind: c.kind,
      comment: details.comment,
      display: details.display
    };
  });

  /**
   * Add function signature help
   */
  if (query.prefix == '(') {
    const signatures = service.getSignatureHelpItems(query.filePath, query.position);
    if (signatures && signatures.items) {
      signatures.items.forEach((item) => {
        const template: string = item.parameters.map((p, i) => {
          const display = '${' + (i + 1) + ':' + ts.displayPartsToString(p.displayParts) + '}';
          return display;
        }).join(ts.displayPartsToString(item.separatorDisplayParts));

        const name: string = item.parameters.map((p) => ts.displayPartsToString(p.displayParts))
          .join(ts.displayPartsToString(item.separatorDisplayParts));

        // e.g. test(something:string):any;
        // prefix: test(
        // template: ${something}
        // suffix: ): any;
        const description: string =
          ts.displayPartsToString(item.prefixDisplayParts)
          + template
          + ts.displayPartsToString(item.suffixDisplayParts);

        completionsToReturn.unshift({
          snippet: {
            template,
            name,
            description: description
          }
        });
      });
    }
  }

  return {
    completions: completionsToReturn,
    endsInPunctuation: endsInPunctuation
  };
}

export function getRawJsOutput(filePath: string): string {
  let services = languageService;

  try {
    let output: ts.EmitOutput = services.getEmitOutput(filePath);

    /** We only care about the js output */
    const jsFile = output.outputFiles.filter(x => x.name.endsWith(".js"))[0];
    if (!jsFile) return '';

    return jsFile.text;
  }
  catch (e) {
    console.log('TypeScript emit failure:', e);
    return '';
  }
}

function getDiagnostics() {
  const program = languageService.getProgram();

  const allDiagnostics = program.getGlobalDiagnostics()
    .concat(program.getSemanticDiagnostics())
    .concat(program.getSyntacticDiagnostics());

  return ts.sortAndDeduplicateDiagnostics(allDiagnostics);
}

function getDiagnosticsByFilePath(filePath: string) {
  const program = languageService.getProgram();
  const sourceFile = program.getSourceFile(filePath);

  const allDiagnostics = program.getSemanticDiagnostics(sourceFile)
    .concat(program.getSyntacticDiagnostics(sourceFile));

  return ts.sortAndDeduplicateDiagnostics(allDiagnostics);
}

function diagnosticToCodeError(diagnostic: ts.Diagnostic): CodeError {

  let preview = '';
  let filePath = '';
  let startPosition = { line: 0, character: 0 };
  let endPosition = { line: 0, character: 0 };

  if (diagnostic.file) {
    filePath = diagnostic.file.fileName;
    startPosition = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    endPosition = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start + diagnostic.length);
    preview = diagnostic.file.text.substr(diagnostic.start, diagnostic.length)
  }

  return {
    filePath,
    from: { line: startPosition.line, ch: startPosition.character },
    to: { line: endPosition.line, ch: endPosition.character },
    message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
    preview,
  };
}

export function getCodeErrors(filePath: string) {
  return getDiagnosticsByFilePath(filePath).map(diagnosticToCodeError);
}

/** Utility */
function positionErrors(query: Types.FilePathPositionQuery): CodeError[] {
  let editorPos = languageServiceHost.getLineAndCharacterOfPosition(query.filePath, query.position);
  let errors = getCodeErrors(query.filePath);
  errors = errors.filter(e =>
    // completely contained in the multiline
    (e.from.line < editorPos.line && e.to.line > editorPos.line)
    // error is single line and on the same line and characters match
    || (e.from.line == e.to.line && e.from.line == editorPos.line && e.from.ch <= editorPos.ch && e.to.ch >= editorPos.ch)
  );

  return errors;
}

export function quickInfo(query: Types.QuickInfoQuery): Promise<Types.QuickInfoResponse> {
  var info = languageService.getQuickInfoAtPosition(query.filePath, query.position);
  var errors = positionErrors(query);
  if (!info && !errors.length) {
    return Promise.resolve({ valid: false } as Types.QuickInfoResponse);
  } else {
    return resolve({
      valid: true,
      info: info && {
        name: ts.displayPartsToString(info.displayParts || []),
        comment: ts.displayPartsToString(info.documentation || [])
      },
      errors: errors
    });
  }
}

/**
 * General utility interfaces
 */
export namespace Types {

  /** Used a lot in project service */
  export interface FilePathPositionQuery {
    filePath: string;
    position: number;
  }

  /**
   * Completions stuff
   */
  export interface GetCompletionsAtPositionQuery extends FilePathPositionQuery {
    prefix: string;
  }
  export interface GetCompletionsAtPositionResponse {
    completions: Completion[];
    endsInPunctuation: boolean;
  }

  /**
   * Mouse hover
   */
  export interface QuickInfoQuery extends FilePathPositionQuery { }
  export interface QuickInfoResponse {
    valid: boolean; // Do we have a valid response for this query
    info?: {
      name?: string;
      comment?: string;
    }
    errors: CodeError[];
  }
}