import { createMap } from '../../../../utils';
import { match, filter as fuzzyFilter } from "fuzzaldrin";
import * as CodeMirror from 'codemirror';

/**
 * Based on https://github.com/atom/fuzzy-finder/blob/51f1f2415ecbfab785596825a011c1d2fa2658d3/lib/fuzzy-finder-view.coffee#L56-L74
 */
export function renderMatchedSegments(result: string, query: string): JSX.Element[] {
    // A data structure which is efficient to render
    type MatchedSegments = { str: string, matched: boolean }[];

    // local function that creates the *matched segment* data structure
    function getMatchedSegments(result: string, query: string) {
        let matches = match(result, query);
        let matchMap = createMap(matches);
        // collapse contiguous sections into a single `<strong>`
        let currentUnmatchedCharacters = [];
        let currentMatchedCharacters = [];
        let combined: MatchedSegments = [];
        function closeOffUnmatched() {
            if (currentUnmatchedCharacters.length) {
                combined.push({ str: currentUnmatchedCharacters.join(''), matched: false });
                currentUnmatchedCharacters = [];
            }
        }
        function closeOffMatched() {
            if (currentMatchedCharacters.length) {
                combined.push({ str: currentMatchedCharacters.join(''), matched: true });
                currentMatchedCharacters = [];
            }
        }
        result.split('').forEach((c, i) => {
            let isMatched = matchMap[i];
            if (isMatched) {
                if (currentMatchedCharacters.length) {
                    currentMatchedCharacters.push(c);
                }
                else {
                    currentMatchedCharacters = [c]
                    // close off any unmatched characters
                    closeOffUnmatched();
                }
            }
            else {
                if (currentUnmatchedCharacters.length) {
                    currentUnmatchedCharacters.push(c);
                }
                else {
                    currentUnmatchedCharacters = [c]
                    // close off any matched characters
                    closeOffMatched();
                }
            }
        });
        closeOffMatched();
        closeOffUnmatched();
        return combined;
    }

    /**
     * Rendering the matched segment data structure is trivial
     */
    let matched = getMatchedSegments(result, query);
    let matchedStyle = {fontWeight:'bold', color:'#66d9ef'};
    return matched.map((item, i) => {
        return <span key={i} style={item.matched?matchedStyle:{}}>{item.str}</span>;
    });
}

/**
 * Exists to allow us to pass throught the `original` information around.
 * Code mirror insists on using `CodeMirror.Hint` so we use that
 * But then we put the good stuff in `original` and use it in `render` and `complete` and `move` etc
 */
export interface ExtendedCodeMirrorHint extends CM.Hint {
    original?: Completion;
    /** For rending matched segments */
    queryString?: string;
    comment?: string;
    template?: any;
    data?: CM.Hints;
}

/**
 * For highlighting matched segments
 */
import * as ReactServer from "react-dom/server";
import * as React from "react";

/**
 * Key strokes can have different effect based on this state
 * So moved this check out into a utility
 */
export function isCompletionActive(ed: CodeMirror.Editor): boolean {
    return !!(ed as any).state.completionActive;
}

/**
 * A common shared render function
 */

/**
 * General utility for consistent coloring
 */
export function kindToColor(kind: string, lighten = false) {
    let add = lighten ? 50 : 0;
    let opacity = lighten ? 0.2 : 1;
    switch (kind) {
        case ts.ScriptElementKind.keyword:
        case 'snippet':
            // redish
            return `rgba(${0xf9 + add},${0x26 + add},${0x72 + add},${opacity})`;
        case ts.ScriptElementKind.scriptElement:
        case ts.ScriptElementKind.moduleElement:
        case ts.ScriptElementKind.classElement:
        case ts.ScriptElementKind.localClassElement:
        case ts.ScriptElementKind.interfaceElement:
        case ts.ScriptElementKind.typeElement:
        case ts.ScriptElementKind.enumElement:
        case ts.ScriptElementKind.alias:
        case ts.ScriptElementKind.typeParameterElement:
        case ts.ScriptElementKind.primitiveType:
            // yelloish
            // #e6db74
            return `rgba(${0xe6 + add},${0xdb + add},${0x74 + add},${opacity})`;
        case ts.ScriptElementKind.variableElement:
        case ts.ScriptElementKind.localVariableElement:
        case ts.ScriptElementKind.memberVariableElement:
        case ts.ScriptElementKind.letElement:
        case ts.ScriptElementKind.constElement:
        case ts.ScriptElementKind.label:
        case ts.ScriptElementKind.parameterElement:
        case ts.ScriptElementKind.indexSignatureElement:
            // blueish
            // #66d9ef
            return `rgba(${0x66 + add},${0xd9 + add},${0xef + add},${opacity})`;
        case ts.ScriptElementKind.functionElement:
        case ts.ScriptElementKind.localFunctionElement:
        case ts.ScriptElementKind.memberFunctionElement:
        case ts.ScriptElementKind.memberGetAccessorElement:
        case ts.ScriptElementKind.memberSetAccessorElement:
        case ts.ScriptElementKind.callSignatureElement:
        case ts.ScriptElementKind.constructorImplementationElement:
        case 'path':
            // greenish
            // #a6e22e
            return `rgba(${0xa6 + add},${0xe2 + add},${0x2e + add},${opacity})`;
        default:
            return `rgba(${0xaa + add},${0xaa + add},${0xaa + add},${opacity})`;
    }
}

/**
 * For consitent icon lookup against kind
 */
import {FAIconName,toFontAwesomeCharCode} from "../fontAwesomeToCharCode";
export function kindToIcon(kind: string):string {
    switch (kind) {
        case 'snippet':
            return toFontAwesomeCharCode(FAIconName.exchange);
        case 'path':
            return toFontAwesomeCharCode(FAIconName.fileText);
        case ts.ScriptElementKind.keyword:
            return toFontAwesomeCharCode(FAIconName.key);
        case ts.ScriptElementKind.classElement:
            return toFontAwesomeCharCode(FAIconName.copyright);
        case ts.ScriptElementKind.interfaceElement:
            return toFontAwesomeCharCode(FAIconName.infoCircle);
        case ts.ScriptElementKind.scriptElement:
        case ts.ScriptElementKind.moduleElement:
        case ts.ScriptElementKind.localClassElement:
        case ts.ScriptElementKind.typeElement:
        case ts.ScriptElementKind.enumElement:
        case ts.ScriptElementKind.alias:
        case ts.ScriptElementKind.typeParameterElement:
        case ts.ScriptElementKind.primitiveType:
            return toFontAwesomeCharCode(FAIconName.archive);
        case ts.ScriptElementKind.variableElement:
        case ts.ScriptElementKind.localVariableElement:
        case ts.ScriptElementKind.memberVariableElement:
        case ts.ScriptElementKind.letElement:
        case ts.ScriptElementKind.constElement:
        case ts.ScriptElementKind.label:
        case ts.ScriptElementKind.parameterElement:
        case ts.ScriptElementKind.indexSignatureElement:
            return toFontAwesomeCharCode(FAIconName.at);
        case ts.ScriptElementKind.functionElement:
        case ts.ScriptElementKind.localFunctionElement:
        case ts.ScriptElementKind.memberFunctionElement:
        case ts.ScriptElementKind.memberGetAccessorElement:
        case ts.ScriptElementKind.memberSetAccessorElement:
        case ts.ScriptElementKind.callSignatureElement:
        case ts.ScriptElementKind.constructorImplementationElement:
            return toFontAwesomeCharCode(FAIconName.circleArrowRight);
        default:
            return toFontAwesomeCharCode(FAIconName.info);
    }
}

namespace AutocompleteStyles {
    /**
     * We have a rows of hints with each hint being
     * `leftLeft`  `left`      `main`        `right`
     * icon        for type    for content   for docs
     */
    export const leftLeftClassName = 'cm-hint left-left';
    export const leftClassName = 'cm-hint left';
    export const mainClassName = 'cm-hint main';
    export const rightClassName = 'cm-hint right';
}
export function render(elt: HTMLLIElement, data: CM.Hints, cur: ExtendedCodeMirrorHint) {
    let original: Completion = cur.original;
    let color = kindToColor(original.kind);
    let colorBackground = kindToColor(original.kind, true);
    let icon = kindToIcon(original.kind);
    const text = cur.queryString ? ReactServer.renderToString(<span>{renderMatchedSegments(original.name,cur.queryString)}</span>) : original.name;

    elt.innerHTML = `
        <span class="${AutocompleteStyles.leftLeftClassName}" style="color:${color};background:${colorBackground}">${icon}</span>
        <strong class="${AutocompleteStyles.leftClassName}" style="color:${color};background:${colorBackground}">${original.kind}</strong>
        <span class="${AutocompleteStyles.mainClassName}">${text}</span>
        <span class="${AutocompleteStyles.rightClassName}">${original.display}</span>
    `.replace(/\s+/g,' ');
}