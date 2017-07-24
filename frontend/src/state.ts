import { observable, action, computed } from 'mobx';
import * as ps from './play/projectService';
import { debounce } from './utils';
import * as srcLoader from './play/srcLoader';

class State {
  /**
   * This is the file name we use for the user file
   */
  readonly editorFilePath = 'editor.tsx';

  @observable code: string;

  constructor() {
    this.reset();

    /**
     * Debounced because hash can chang as much as it wants while the user is editing code
     */
    window.onhashchange = () => {
      if (srcLoader.getSource() !== this.code) {
        this.reset();
      }
    };
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
  }, 1000);
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