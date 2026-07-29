/**
 * Utility functions for string manipulation
 */

/**
 * Normalizes a product title by capitalizing the first letter of each word,
 * except for common Spanish connectors/prepositions unless they are the first word.
 * 
 * Exception list: de, del, el, la, los, las, y, o, con, en, por, para, sin, al, a
 */
export function formatProductTitle(title: string): string {
    if (!title) return '';

    const exceptions = [
        'de', 'del', 'el', 'la', 'los', 'las',
        'y', 'o', 'con', 'en', 'por', 'para',
        'sin', 'al', 'a', 'fue', 'and', 'or', 'of', 'with'
    ];

    return title
        .toLowerCase()
        .split(' ')
        .map((word, index) => {
            // Helper for proper capitalization handling ¡ and ¿
            const capitalize = (w: string) => {
                if (w.startsWith('¡') || w.startsWith('¿')) {
                    if (w.length > 1) {
                        return w.charAt(0) + w.charAt(1).toUpperCase() + w.slice(2);
                    }
                    return w;
                }
                return w.charAt(0).toUpperCase() + w.slice(1);
            };

            // Always capitalize the first word
            if (index === 0) {
                return capitalize(word);
            }

            // Check if it's an exception
            if (exceptions.includes(word)) {
                return word; // Keep lowercase
            }

            // Capitalize normally
            return capitalize(word);
        })
        .join(' ');
}
