import * as React from 'react';
import { $p } from 'graphcool-styles';
import * as cx from 'classnames'
import { CodeEditor } from './CodeEditor';
import { state } from '../state';
import { observer } from 'mobx-react';
import Output from './Output';
import Header from './Header'
import { ExecuteButton } from './RunButton'

@observer
export default class App extends React.Component<{}, {}> {
  render() {
    return (
      <div className={cx($p.h100, $p.w100, $p.flex, $p.flexColumn)}>
        <Header selectExample={state.setCode}/>
        <div className={cx($p.flex, $p.h100)}>
          <div className={cx($p.h100, $p.w50, $p.pl10, $p.pr25, $p.pv25)} style={{ background: '#272822'}}>
            <CodeEditor
              filePath={state.editorFilePath}
              value={state.code}
              onChange={(value => state.setCode(value))}
              onCodeEdit={(codeEdit) => state.onCodeEdit(codeEdit)}/>
          </div>
          <div className={cx($p.h100, $p.w50, $p.flex, $p.relative)}>
            <ExecuteButton execute={state.executeCode} isRunning={state.executing}/>
            <div className={cx($p.h100, $p.overflowYScroll)}>
              <Output loading={state.executing} result={state.executionResult}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
