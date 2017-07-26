import { observable, action, computed } from 'mobx';
import * as ps from './codemirror/projectService';
import { debounce } from './utils';
import * as srcLoader from './codemirror/srcLoader';

class State {
  /**
   * This is the file name we use for the user file
   */
  readonly editorFilePath = 'editor.tsx';

  @observable code: string;
  @observable executionResult: string[] = [];
  @observable executing: boolean = false;

  constructor() {
    this.reset();
  }

  @action reset = () => {
    this.code = srcLoader.getSource();
    ps.addFile(this.editorFilePath, this.code);
    this.recalculateOutput();
  }
  @action setCode = (code: string) => {
    this.code = code;
    this.recalculateOutput();
    this.pendingUpdates = true;
  }
  @action onCodeEdit = (codeEdit: CodeEdit) => {
    ps.editFile(this.editorFilePath, codeEdit);
  }

  @computed
  get hasCode() {
    return !!this.code.trim()
  }

  @observable output = '';
  @observable pendingUpdates = false;
  @action recalculateOutput = debounce(() => {
    const tmpFilePath = `${randomString()}.tsx`
    ps.addFile(tmpFilePath, `return (async () => { ${this.code} })()`);
    this.output = ps.getRawJsOutput(tmpFilePath);
    ps.removeFile(tmpFilePath);
    this.pendingUpdates = false;
    srcLoader.setSource(this.code);
  }, 100);

  @action executeCode = async () => {
    this.executing = true
    this.executionResult = []
    const endpoint = 'https://9r6omxusb0.execute-api.eu-west-1.amazonaws.com/dev'
    // const endpoint = 'http://localhost:3000'
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({b64Code: btoa(this.output)})
      })

      const result = await response.json()

      if (Array.isArray(result)) {
        this.executionResult = result
      } else {
        this.executionResult = [JSON.stringify(result)]
      }
    } catch (e) {
      this.executionResult = [e.toString()]
    }

    this.executing = false
  }
}

function randomString(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

/**
 * Our singleton state
 */
export const state = new State();