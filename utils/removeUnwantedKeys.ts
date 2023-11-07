export type Paragraph = {
    start?: number;
    end?: number;
    speaker: number;
    num_words?: number;
    sentences: {
        end?: number;
        text: string;
        start?: number;
    }[];
};

export type ParagraphWithKeysRemoved = {
    speaker: number;
    sentences: {
        text: string;
    }[];
}

/**
 * Removes unwanted keys from a transcript's paragraphs.
 * @param data paragraphs from a transcript
 * @returns cleaned paragraphs
 */
const removeUnwantedKeys = (data: {
    paragraphs: Paragraph[];
}): { paragraphs: ParagraphWithKeysRemoved[] } => {

    data.paragraphs.forEach((paragraph) => {
        delete paragraph.start;
        delete paragraph.end;
        delete paragraph.num_words;

        paragraph.sentences.forEach((sentence) => {
            delete sentence.start;
            delete sentence.end;
        });
    });

    return data
};

export { removeUnwantedKeys };
