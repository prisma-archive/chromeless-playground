/**
 * Debounce
 */
var now = () => new Date().getTime();
export function debounce<T extends Function>(func: T, milliseconds: number, immediate = false): T {
    var timeout, args, context, timestamp, result;

    var wait = milliseconds;

    var later = function() {
        var last = now() - timestamp;

        if (last < wait && last > 0) {
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            if (!immediate) {
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            }
        }
    };

    return <any>function() {
        context = this;
        args = arguments;
        timestamp = now();
        var callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
            context = args = null;
        }

        return result;
    };
};

type MapKey = string|number;
type MapableArray = MapKey[];
export type TruthTable = { [string: string]: boolean;[number: number]: boolean };
/**
 * Create a quick lookup map from list
 */
export function createMap(arr: MapableArray): TruthTable {
    return arr.reduce((result: { [string: string]: boolean }, key: string) => {
        result[key] = true;
        return result;
    }, <{ [string: string]: boolean }>{});
}

export function throttle<T extends Function>(func: T, milliseconds: number, options?: { leading?: boolean; trailing?: boolean }): T {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    let gnow = now;
    var later = function() {
        previous = options.leading === false ? 0 : gnow();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function() {
        var now = gnow();
        if (!previous && options.leading === false) previous = now;
        var remaining = milliseconds - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > milliseconds) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    } as any;
};

/** Useful for various editor related stuff e.g. completions */
var punctuations = createMap([';', '{', '}', '(', ')', '.', ':', '<', '>', "'", '"']);
/** Does the prefix end in punctuation */
export var prefixEndsInPunctuation = (prefix: string) => prefix.length && prefix.trim().length && punctuations[prefix.trim()[prefix.trim().length - 1]];


/**
 * Promise.resolve is something I call the time (allows you to take x|promise and return promise ... aka make sync prog async if needed)
 */
export var resolve: typeof Promise.resolve = Promise.resolve.bind(Promise);