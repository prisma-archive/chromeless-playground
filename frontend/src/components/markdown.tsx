import * as React from "react";
import * as marked from "marked";
import { style, cssRaw, classes } from 'typestyle';
import * as csstips from 'csstips';
import { colors, spacing, fontSizes } from './styles';
import * as escape from 'escape-html';
import { getPlaygroundLink } from '../play/srcLoader';

/** 
 * Using codemirror for syntax highlighting
 **/
import * as CodeMirror from 'codemirror';
cssRaw(require('codemirror/lib/codemirror.css'));
cssRaw(require('codemirror/theme/monokai.css'));
require('codemirror/addon/runmode/runmode');
/** JSX */
require('codemirror/mode/jsx/jsx');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/xml/xml');
/** CSS */
require('codemirror/mode/css/css');
/** HTML */
require('codemirror/mode/htmlmixed/htmlmixed');
/** Our function */
function highlightCodeWithMode(args: { code: string, mode: string }) {
  // console.log({ code }); // DEBUG
  const collection = [];
  (CodeMirror as any).runMode(args.code, args.mode,
    (text, category) => {
      text = escape(text);
      collection.push(category ? `<span class="cm-${category}">${text}</span>` : text)
    }
  );
  return `<div class="cm-s-default" style="display: inline-block">${collection.join('')}</div>`
}

namespace PlayButtonStyles {
  export const anchorLookingLikeButton = style({
    cursor: 'pointer',
    height: 'auto',
    padding: "12px 30px 11px",
    border: `1px solid ${colors.header}`,
    borderRadius: '3px',
    color: `${colors.white} !important`,
    backgroundColor: colors.header,
    fontSize: fontSizes.buttonText,
    textDecoration: "none",
    lineHeight: "1em",
    outline: 'none',
    transition: 'color .2s, background-color .2s',
    display: 'inline-block',
    $nest: {
      '&:hover': {
        backgroundColor: colors.headerHover,
      },
      '&:active': {
        backgroundColor: colors.headerHover,
      },
      '&:focus': {
        outline: 'thin dotted',
        outlineColor: colors.header
      }
    }
  });
}

/**
 * CSS customizations
 */
namespace MarkDownStyles {
  export const rootClass = 'typestyle-markdown';

  cssRaw(`
.${rootClass} {
    color: ${colors.text}
}

.${rootClass} p {
  margin: 0px;
  line-height: 24px;
}

.${rootClass} h2 {
  margin: 0px;
}
.${rootClass} h3 {
  margin: 0px;
}

/** List styling */
.${rootClass} ul {
    margin: 0px;
    margin-bottom: 20px !important;
    line-height: ${spacing.lineHeight};
    padding-left: 27px;
}
.${rootClass} ul>* {
  margin-bottom: 5px !important;
}
.${rootClass} ul>*:last-child {
  margin-bottom: 0px !important;
}
.${rootClass} li>* {
  margin-top: 5px !important;
  margin-bottom: 5px !important;
}
.${rootClass} li>*:last-child {
  margin-bottom: 0px !important;
}

.${rootClass} ol {
    margin: 0px;
    margin-bottom: 20px !important;
    line-height: ${spacing.lineHeight};
    padding-left: 27px;
}
.${rootClass} ol>* {
  margin-bottom: 5px !important;
}
.${rootClass} ol>*:last-child {
  margin-bottom: 0px !important;
}

.${rootClass} a {
  color: grey;
}

.${rootClass} a:hover {
  color: black;
}

/** Inline code */
.${rootClass} code {
  padding-left: 5px;
  padding-right: 5px;
  background: #eee;
  font-family: consolas, menlo, monospace; 
}

/** Block code */
.${rootClass} pre>code {
  display: block;
  padding: 10px;
  background: #f4f4f4;
  overflow: auto;
  font-family: consolas, menlo, monospace; 
  border-left: 2px solid #ddd;
  line-height: 24px;
}

/** Blockquote */
.${rootClass} blockquote {
  margin: 0;
  padding: 5px 20px;
  color: #6b6b6b;
  background-color: #f6f6f6;
  border-top: 1px solid #e5e5e5;
  border-bottom: 1px solid #e5e5e5;
  border-right: 1px solid #e5e5e5;
  border-left: 4px solid #e5e5e5;
}

/** Images */
.${rootClass} img {
  /** Ensures a nice display on mobile devices */
  max-width: 100%;
}
  `);
}



interface Props { markdown: string }

/**
 * Renders markdown
 */
export class MarkDown extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const rendered = toHtml(this.props.markdown);

    return (
      <div className={classes(MarkDownStyles.rootClass, style(csstips.verticallySpaced(10)))} dangerouslySetInnerHTML={{ __html: rendered }} />
    );
  }
}

/** Converts an html string to markdown */
export function toHtml(markdown: string) {
  /** Custom rendering */
  const renderer = new marked.Renderer();

  /** 
   * Target blank external links
   * https://github.com/chjj/marked/pull/451
   **/
  renderer.link = function(href, title, text) {
    var external, newWindow, out;
    external = /^https?:\/\/.+$/.test(href);
    newWindow = external || title === 'newWindow';
    out = "<a href=\"" + href + "\"";
    if (newWindow) {
      out += ' target="_blank"';
    }
    if (title && title !== 'newWindow') {
      out += " title=\"" + title + "\"";
    }
    const output = out += ">" + text + "</a>";
    return output;
  };

  return (
    marked(markdown, {
      gfm: true,
      renderer: renderer,
      highlight: (code, lang) => {
        if (lang === 'ts' || lang === 'js' || lang === 'typescript' || lang === 'javascript') {
          return highlightCodeWithMode({ code, mode: 'jsx' })
        }
        if (lang === 'html') {
          return highlightCodeWithMode({ code, mode: 'text/html' })
        }
        if (lang === 'css') {
          return highlightCodeWithMode({ code, mode: 'css' })
        }
        if (lang === 'play') {
          // Remove any imports 
          const codeForPlayground = code.split(/\n|\r\n/g).filter(l => !l.startsWith('import')).join('\n').trim();

          /** Makes it easier to write :) */
          code = code.trim();

          return `
${highlightCodeWithMode({ code, mode: 'jsx' })}

<a class="${PlayButtonStyles.anchorLookingLikeButton}" href="${getPlaygroundLink(codeForPlayground)}" target="_blank">Open in Playground</a>
`.trim()
        }

        return code;
      }
    })
      // don't want a trailing newline
      .trim()
  );
}