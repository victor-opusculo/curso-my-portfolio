
export const defaultItemsOnPage = 20;

export function processSearchText(input: string): string {
    let output = '';
    let withinExistentQuotes = false;
    let addedQuoteOpen = false;

    for (const char of input) {
        if (char === '"') {
            withinExistentQuotes = !withinExistentQuotes;
            output += char;
            continue;
        }

        if (!addedQuoteOpen && char !== ' ' && !withinExistentQuotes) {
            output += '"';
            addedQuoteOpen = true;
        } else if (addedQuoteOpen && char === ' ' && !withinExistentQuotes) {
            output += '"';
            addedQuoteOpen = false;
        }

        output += char;
    }

    if (output.at(-1) !== '"') output += '"';

    return output;
}