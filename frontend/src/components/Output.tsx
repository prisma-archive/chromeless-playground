import * as React from "react";
import { $p } from 'graphcool-styles';
import * as cx from 'classnames'
import styled from 'styled-components'
import isUrl = require('is-url')

const Line = styled.div.attrs({
  className: cx($p.bb, $p.bBlack05, $p.pv10, $p.w100),
})`
  &:last-child {
    border: 0;
  }
`

const Image = styled.a`
  display: inline-flex;
  
  &:hover {
    border-color: rgba(0, 0, 0, 0.2);
  }
  
  img {
    max-height: 150px;
  }
`

interface Props {
  result: string[]
  loading: boolean
}

export default class Output extends React.Component<Props, {}> {

  render() {
    return (
      <div className={cx($p.pl60, $p.pr25, $p.pv25, $p.w100)}>
        <div className={cx($p.ttu, $p.o20, $p.f20, $p.fw3, $p.pb16)}>
          Output
        </div>
        {this.renderOutput()}
      </div>
    )
  }

  renderOutput = () => {
    if (this.props.loading) {
      return (
        <div className={cx($p.o40, $p.i, $p.f14)}>
          Executing code on AWS Lambda. This might take a few seconds...
        </div>
      )
    }

    return (
      <div className={cx($p.f14, $p.o80, $p.w100)} style={{fontFamily: 'Source Code Pro'}}>
        {this.props.result.map(line => (
          <Line key={line}>
            {line}
            {isUrl(line) &&
            <Image href={line} target="_blank" className={cx($p.bBlack10, $p.ba, $p.br2, $p.pa4, $p.mt20)}>
              <img src={line}/>
            </Image>
            }
          </Line>
        ))}
      </div>
    )
  }
}

