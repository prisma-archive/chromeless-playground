import { setupPage, normalize } from 'csstips';
import * as WebFont from 'webfontloader'

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';

normalize()
setupPage('#root');

ReactDOM.render(<App/>, document.getElementById('root'));

WebFont.load({
  google: {
    families: [
      'Open Sans:300,400,600',
      'Source Code Pro:400,500,600,700',
    ],
  },
});
