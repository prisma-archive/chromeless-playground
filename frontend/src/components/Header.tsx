import * as React from 'react';
import { $p, Icon } from 'graphcool-styles';
import * as cx from 'classnames'
import { observer } from 'mobx-react';
import examples from '../examples'
import styled from 'styled-components'

const Github = styled.a`
  &:hover {
    opacity: 1;
  }
`

interface Props {
  selectExample: (code: string) => void
}

interface State {
  selectedTitle: string
}

@observer
export default class Header extends React.Component<Props, State> {

  state = {
    selectedTitle: examples[0].title,
  }

  render() {
    return (
      <div className={cx($p.w100, $p.flex)}>
        <div className={cx($p.w50, $p.flex, $p.pa25, $p.white, $p.justifyBetween)} style={{background: '#151513'}}>
          <div className={cx($p.f20, $p.flex, $p.itemsCenter)}>
            <span className={cx($p.fw5, $p.pr6)}>Chromeless</span>
            <span className={cx($p.fw3, $p.pr12)}>Playground</span>
            <Github href="https://github.com/graphcool/chromeless" target="_blank" className={cx($p.o40)}>
              <Icon src={require('../assets/icons/github.svg')} width={20} height={20} color='#fff'
              />
            </Github>
          </div>
          <div className={cx($p.f14, $p.flex, $p.justifyEnd, $p.itemsCenter)}>
            <span className={cx($p.o50, $p.fw3, $p.pr6)}>Select example:</span>
            <select
              className={cx($p.bgNone, $p.white, $p.bNone, $p.outline0, $p.fw5, $p.pointer)}
              onChange={(e: any) => this.onSelectExample(e.target.value)}
              value={this.state.selectedTitle}
              style={{appearance: 'none', WebkitAppearance: 'none'}}
            >
              {examples.map(example => (
                <option className={$p.black} key={example.title} value={example.title}>{example.title}</option>
              ))}
            </select>
          </div>
        </div>
        <div className={cx($p.w50, $p.pa25, $p.f14, $p.black50)} style={{background: '#F9F9F9'}}>
          Chrome automation made simple. Runs locally or headless on AWS Lambda.&nbsp;
          <a href="https://github.com/graphcool/chromeless" target="_blank">Read docs to get started</a>. ⚡
        </div>
      </div>
    )
  }

  private onSelectExample = (title: string) => {
    this.props.selectExample(examples.find(e => e.title === title)!.code)
    this.setState({selectedTitle: title})
  }
}
