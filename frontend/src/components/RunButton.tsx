import * as React from 'react'
import * as cx from 'classnames'
import { $p, $v, Icon } from 'graphcool-styles';
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
    const loader = (
      <svg x="0px" y="0px" width="35px" height="35px" viewBox="0 0 40 40">
        <path opacity="0.2" fill="#fff" d={`M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946
          s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634
          c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z`}/>
        <path fill="#fff"
              d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0 C22.32,8.481,24.301,9.057,26.013,10.047z">
          <animateTransform attributeType="xml"
                            attributeName="transform"
                            type="rotate"
                            from="0 20 20"
                            to="360 20 20"
                            dur="0.5s"
                            repeatCount="indefinite"/>
        </path>
      </svg>
    )

    const playButton = (
      <svg
        width="35"
        height="35"
        viewBox={`3.5,4.5,24,24`}
      >
        <path d="M 11 9 L 24 16 L 11 23 z"/>
      </svg>
    )

    // Allow mouse down if there is no running query, there are options for
    // which operation to run, and the dropdown is currently closed.
    const pathJSX = !this.props.isRunning
      ? playButton
      : loader

    return (
      <Wrap>
        <Button
          onClick={this.props.execute}
          title="Execute Query (Ctrl-Enter)"
        >
          {pathJSX}
        </Button>
      </Wrap>
    )
  }
}