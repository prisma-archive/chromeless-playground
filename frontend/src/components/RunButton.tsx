import * as React from 'react'
import * as cx from 'classnames'
import { $p, $v } from 'graphcool-styles';
import styled from 'styled-components'

const Wrap = styled.div`
  position: absolute !important;
  left: -35.5px;
  z-index: 5;
  top: 25px;
`

const Button = styled.div.attrs({
  className: cx($p.br100, $p.flex, $p.itemsCenter, $p.justifyCenter, $p.pointer)
})`
  background-color: #1F201B;
  border: 6px solid #fff;
  width: 71px;
  height: 71px;
  
  svg {
    fill: #fff;
  }
  
  &:hover {
    background: ${$v.blue};
  }
`

export interface Props {
  execute: () => void
  isRunning: boolean
}

export interface State {
}

export class ExecuteButton extends React.Component<Props, State> {

  render() {
    // Allow mouse down if there is no running query, there are options for
    // which operation to run, and the dropdown is currently closed.
    const pathJSX = this.props.isRunning
      ? <rect x="10" y="10" width="13" height="13" rx="1"/>
      : <path d="M 11 9 L 24 16 L 11 23 z"/>

    return (
      <Wrap>
        <Button
          onClick={this.props.execute}
          title="Execute Query (Ctrl-Enter)"
        >
          <svg
            width="35"
            height="35"
            viewBox={`${this.props.isRunning ? 4 : 3}.5,4.5,24,24`}
          >
            {pathJSX}
          </svg>
        </Button>
      </Wrap>
    )
  }
}