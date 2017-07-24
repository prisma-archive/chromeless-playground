/** Setup es6 */
import 'babel-polyfill';

import { setupPage, normalize } from 'csstips';
import * as csstips from 'csstips';
import { style, cssRule } from 'typestyle';

normalize()
setupPage('#root');

/**
 * Clear default margins from all things
 * I wouldn't do this in a production site. But doing it to make teaching easier
 */
cssRule('h1,h2,h3,h4,h5,h6,h7,h8,p', {
  margin: '0px'
});

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CodeEditor } from './play/codeEditor/codeEditor';
import { state } from './state';
import { observer } from 'mobx-react';
import Output from './output'

/**
 * Provides a nice demo / test component
 */
@observer
export class App extends React.Component<{}, {}> {
  render() {
    return (
      <div style={{ display: 'flex', height: '100%' }}>
        <CodeEditor
          filePath={state.editorFilePath}
          value={state.code}
          onChange={(value => state.setCode(value))}
          onCodeEdit={(codeEdit) => state.onCodeEdit(codeEdit)}/>
        <Output compiledCode={state.output} compiling={state.pendingUpdates}/>
      </div>
    )
  }
}

ReactDOM.render(<div className={style(csstips.fillParent, csstips.vertical)}>
  <App/>
</div>, document.getElementById('root'));
