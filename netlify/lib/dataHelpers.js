
/**
 * Trims subject tags to only include id and name.
 * @param {Array} subjects - The array of subject objects.
 * @returns {Array} - The array of subjects with trimmed tags.
 */
export function trimSubjects(subjects) {
    if (!subjects) return [];
    return subjects.map(subject => ({
        ...subject,
        mainTags: subject.mainTags ? subject.mainTags.map(t => ({ id: t.id, name: t.name })) : [],
        optionalTags: subject.optionalTags ? subject.optionalTags.map(t => ({ id: t.id, name: t.name })) : [],
        // Handle legacy tags if present
        tags: subject.tags ? subject.tags.map(t => ({ id: t.id, name: t.name })) : undefined
    }));
}

/**
 * Trims preferences tags to only include id and name.
 * @param {Object} prefsByTier - The preferences object with tiers (prefer, willing, banned).
 * @returns {Object} - The trimmed preferences object.
 */
export function trimPrefs(prefsByTier) {
    if (!prefsByTier) return { prefer: [], willing: [], banned: [] };

    const trimmed = {};
    ['prefer', 'willing', 'banned'].forEach(tier => {
        if (prefsByTier[tier]) {
            trimmed[tier] = prefsByTier[tier].map(t => ({ id: t.id, name: t.name }));
        } else {
            trimmed[tier] = [];
        }
    });
    return trimmed;
}
