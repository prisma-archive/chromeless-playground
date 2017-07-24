import * as React from "react";
import { style } from "typestyle";
import * as csx from 'csstips';

interface Props {
  compiledCode: string
  compiling: boolean
}

interface State {
  output: string[]
  loading: boolean
}

export default class Output extends React.Component<Props, State> {

  state = {
    output: [],
    loading: false,
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.compiledCode !== nextProps.compiledCode) {
      this.setState({ output: [], loading: false })
    }
  }

  render() {
    if (this.props.compiling) {
      return <div>Compiling...</div>
    }

    if (this.state.loading) {
      return <div>Executing...</div>
    }

    return (
      <div className={style(csx.vertical, csx.flex, {position: 'relative'})}>
        <button onClick={this.request}>RUN!</button>
        {this.state.output.map(line => <div key={line}>{line}</div>)}
      </div>
    )
  }

  private request = async () => {
    this.setState({loading: true})

    // const endpoint = 'https://9r6omxusb0.execute-api.eu-west-1.amazonaws.com/dev'
    const endpoint = 'http://localhost:3000'
    const response = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({b64Code: btoa(this.props.compiledCode)})
    })

    const output = await response.json()

    this.setState({output, loading: false})
  }
}
