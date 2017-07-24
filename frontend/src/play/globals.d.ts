interface EditorPosition {
    line: number;
    ch: number;
}
interface CodeEdit {
    from: EditorPosition;
    to: EditorPosition;
    newText: string;
    /**
     * When we are editing stuff from the front end we want all code edits except our own (user typing code)
     * This helps us track that.
     */
    sourceId? : string;
}

/**
 * Complete related stuff
 */
interface Completion {
    /** stuff like "var"|"method" etc */
    kind?: string;
    /** stuff like "toString" */
    name?: string;
    /** This is displayParts (for functions). Empty for `var` etc. */
    display?: string;
    /** the docComment if any */
    comment?: string;

    /** If snippet is specified then the above stuff is ignored */
    snippet?: {
        name: string;
        description: string;
        template: string;
    };
}

interface CodeError {
    filePath: string;
    from: EditorPosition;
    to: EditorPosition;
    message: string;
    preview: string;
}