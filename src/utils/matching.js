
/**
 * Calculates the match score between a Santa and a Recipient.
 * @param {Object} santa - The Santa participant object.
 * @param {Object} recipient - The Recipient participant object.
 * @param {boolean} ignoreWilling - If true, willing tags count as 0 (for Ideal Pass).
 * @returns {number} - The calculated score.
 */
export function calculateMatchScore(santa, recipient, ignoreWilling = false) {
    let totalScore = 0;
    const subjectScores = [];

    const santaPrefer = new Set(santa.prefsByTier?.prefer?.map(t => t.id) || []);
    const santaWilling = new Set(santa.prefsByTier?.willing?.map(t => t.id) || []);
    const santaBanned = new Set(santa.prefsByTier?.banned?.map(t => t.id) || []);

    const subjects = recipient.subjects || [];

    for (const subject of subjects) {
        const mainTags = subject.mainTags?.map(t => t.id) || [];
        const optionalTags = subject.optionalTags?.map(t => t.id) || [];

        // 1. Hard Gate: Check for banned main tags
        let isBanned = false;
        for (const tagId of mainTags) {
            if (santaBanned.has(tagId)) {
                isBanned = true;
                break;
            }
        }

        if (isBanned) {
            subjectScores.push(0);
            continue;
        }

        // 2. Calculate Tag Values
        // Dynamic Budgeting:
        // If NO optional tags, Main = 100.
        // If optional tags exist, Main = 60, Optional = 40.
        let mainBudget = 100;
        let optBudget = 0;

        if (optionalTags.length > 0) {
            mainBudget = 60;
            optBudget = 40;
        }

        const mainVal = mainTags.length > 0 ? mainBudget / mainTags.length : 0;
        const optVal = optionalTags.length > 0 ? optBudget / optionalTags.length : 0;

        // 3. Score the Subject
        let currentSubjectScore = 0;

        // Score Main Tags
        for (const tagId of mainTags) {
            if (santaPrefer.has(tagId)) {
                currentSubjectScore += mainVal;
            } else if (santaWilling.has(tagId)) {
                if (!ignoreWilling) {
                    currentSubjectScore += (mainVal * 0.5);
                }
            }
        }

        // Score Optional Tags
        for (const tagId of optionalTags) {
            if (santaPrefer.has(tagId)) {
                currentSubjectScore += optVal;
            } else if (santaWilling.has(tagId)) {
                if (!ignoreWilling) {
                    currentSubjectScore += (optVal * 0.5);
                }
            }
        }

        subjectScores.push(currentSubjectScore);
    }

    // 4. Aggregate Scores
    const isRanked = !recipient.noRanking;

    if (!isRanked) {
        // Unranked: Simple Sum
        totalScore = subjectScores.reduce((a, b) => a + b, 0);
    } else {
        // Ranked: Linear Parity Weighting
        // Goal: Sum of weights = N * 100
        // Weight_i = (200 / (N + 1)) * (N - i + 1)
        const N = subjectScores.length;
        if (N > 0) {
            for (let i = 0; i < N; i++) {
                const rank = i + 1;
                const weight = (200 / (N + 1)) * (N - rank + 1);
                // The subjectScore is 0-100. We need to scale it by the weight?
                // No, the weight REPLACES the 100 base?
                // Wait, if subjectScore is 100 (perfect match), we want it to contribute 'weight' to the total.
                // So we multiply by (weight / 100).
                totalScore += subjectScores[i] * (weight / 100.0);
            }
        }
    }

    return totalScore;
}

/**
 * Runs the matching algorithm.
 * @param {Array} participants - List of all participants.
 * @param {Object} options - Matching options.
 * @param {Function} onProgress - Callback for progress updates (iteration, total, tier).
 * @returns {Promise<Object>} - Result containing matches and stats.
 */
export async function runMatching(participants, options = {}, onProgress = () => { }) {
    // Split by Tier
    const tierA = participants.filter(p => p.highTier);
    const tierB = participants.filter(p => !p.highTier);

    const matchGroup = async (group, groupName) => {
        // Small Pool Optimization:
        // Always run multiple iterations to avoid greedy-lockout and find better global optima
        const iterations = options.maxIterations || 100;
        let bestResult = null;

        for (let i = 0; i < iterations; i++) {
            // Yield to main thread to allow UI updates
            if (i % 5 === 0) {
                onProgress(i + 1, iterations, groupName);
                await new Promise(resolve => setTimeout(resolve, 0));
            }

            const result = runSingleMatchingIteration(group, groupName, options);

            if (!bestResult) {
                bestResult = result;
                continue;
            }

            // Compare results
            const bestUnmatched = bestResult.unmatchedSantas.length;
            const currentUnmatched = result.unmatchedSantas.length;

            if (currentUnmatched < bestUnmatched) {
                bestResult = result;
            } else if (currentUnmatched === bestUnmatched) {
                // Tie-breaker: Average score
                const bestAvg = bestResult.matches.reduce((sum, m) => sum + m.score, 0) / (bestResult.matches.length || 1);
                const currentAvg = result.matches.reduce((sum, m) => sum + m.score, 0) / (result.matches.length || 1);
                if (currentAvg > bestAvg) {
                    bestResult = result;
                }
            }

            // Break early if we found a perfect match (0 unmatched)
            if (bestResult.unmatchedSantas.length === 0) {
                break;
            }
        }
        return bestResult;
    };

    const resultA = await matchGroup(tierA, "Tier A");
    const resultB = await matchGroup(tierB, "Tier B");

    return {
        matches: [...resultA.matches, ...resultB.matches],
        unmatchedSantas: [...resultA.unmatchedSantas, ...resultB.unmatchedSantas],
        unmatchedRecipients: [...resultA.unmatchedRecipients, ...resultB.unmatchedRecipients],
        stats: {
            tierA: { total: tierA.length, matched: resultA.matches.length },
            tierB: { total: tierB.length, matched: resultB.matches.length }
        }
    };
}

/**
 * Fisher-Yates Shuffle
 * @param {Array} array 
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function runSingleMatchingIteration(participants, groupName, options = {}) {
    const {
        minScore = 100,
        minQuality = 30,
        startingScore = 200,
        startingQuality = 50,
        enableEmergency = false
    } = options;

    // Shuffle recipients to ensure no order bias in candidate collection
    const shuffledRecipients = shuffleArray([...participants]);

    // Shuffle Santas to ensure fairness in priority
    let unmatchedSantas = shuffleArray([...participants]);

    let availableRecipients = new Set(participants.map(p => p._id));
    const matches = [];



    const processPass = (santas, ignoreWilling, minQuality, minScore, passName) => {
        const stillUnmatched = [];
        for (const santa of santas) {
            const candidates = [];
            for (const recipient of shuffledRecipients) {
                if (santa._id === recipient._id) continue;
                if (!availableRecipients.has(recipient._id)) continue;

                const score = calculateMatchScore(santa, recipient, ignoreWilling);

                // Calculate Quality
                const subjectCount = recipient.subjects?.length || 1;
                const maxScore = subjectCount * 100;
                const quality = (score / maxScore) * 100;

                if (score >= minScore && quality >= minQuality) {
                    candidates.push({ recipientId: recipient._id, score, quality, recipient });
                }
            }

            if (candidates.length > 0) {
                // Weighted random by quality
                const totalWeight = candidates.reduce((sum, c) => sum + c.quality, 0);
                let randomVal = Math.random() * totalWeight;
                let choice = candidates[candidates.length - 1];

                for (const candidate of candidates) {
                    randomVal -= candidate.quality;
                    if (randomVal <= 0) {
                        choice = candidate;
                        break;
                    }
                }

                matches.push({
                    santa: { id: santa._id, username: santa.username, tier: groupName, prefsByTier: santa.prefsByTier },
                    recipient: { id: choice.recipient._id, username: choice.recipient.username, subjects: choice.recipient.subjects },
                    score: choice.score,
                    quality: choice.quality,
                    pass: passName,
                    details: getMatchDetails(santa, choice.recipient)
                });
                availableRecipients.delete(choice.recipientId);
            } else {
                stillUnmatched.push(santa);
            }
        }
        return stillUnmatched;
    };

    // Dynamic Passes
    const passes = [];
    const steps = 6; // Number of steps from Start to Min

    for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1); // 0.0 to 1.0

        // Linear interpolation
        const q = startingQuality - (startingQuality - minQuality) * t;
        const s = startingScore - (startingScore - minScore) * t;

        passes.push({
            name: `Pass ${i + 1} (Q:${Math.round(q)}%, S:${Math.round(s)})`,
            minQuality: q,
            minScore: s,
            ignoreWilling: false
        });
    }

    if (enableEmergency) {
        passes.push({ name: "Emergency", minQuality: 0.001, minScore: 0, ignoreWilling: false });
    }

    for (const pass of passes) {
        if (unmatchedSantas.length === 0) break;
        unmatchedSantas = processPass(unmatchedSantas, pass.ignoreWilling, pass.minQuality, pass.minScore, pass.name);
    }

    return {
        matches,
        unmatchedSantas: unmatchedSantas.map(s => ({ id: s._id, username: s.username, tier: groupName })),
        unmatchedRecipients: Array.from(availableRecipients)
    };
}

/**
 * Generates detailed match info for UI.
 * @param {Object} santa - Santa object.
 * @param {Object} recipient - Recipient object.
 * @returns {Object} - Detailed breakdown.
 */
export function getMatchDetails(santa, recipient) {
    const details = {
        totalScore: 0,
        subjectScores: [],
        matchedTags: { prefer: [], willing: [] }
    };

    const santaPrefer = new Set(santa.prefsByTier?.prefer?.map(t => t.id) || []);
    const santaWilling = new Set(santa.prefsByTier?.willing?.map(t => t.id) || []);
    const santaBanned = new Set(santa.prefsByTier?.banned?.map(t => t.id) || []);
    const isRanked = !recipient.noRanking;

    const subjects = recipient.subjects || [];

    for (const subject of subjects) {
        const mainTags = subject.mainTags?.map(t => t.id) || [];
        const optionalTags = subject.optionalTags?.map(t => t.id) || [];
        let subjectScore = 0;

        // Dynamic Budgeting:
        // If NO optional tags, Main = 100.
        // If optional tags exist, Main = 60, Optional = 40.
        let mainBudget = 100;
        let optBudget = 0;

        if (optionalTags.length > 0) {
            mainBudget = 60;
            optBudget = 40;
        }

        const mainVal = mainTags.length > 0 ? mainBudget / mainTags.length : 0;
        const optVal = optionalTags.length > 0 ? optBudget / optionalTags.length : 0;

        const breakdown = {
            main: [],
            optional: [],
            mainScore: 0,
            mainMax: mainBudget,
            optScore: 0,
            optMax: optBudget
        };

        let subjectIsBanned = false;

        // Score Main
        for (const tagId of mainTags) {
            const tag = subject.mainTags.find(t => t.id === tagId);
            if (santaBanned.has(tagId)) {
                subjectIsBanned = true;
                breakdown.main.push({ name: tag.name, type: 'Banned', score: 0 });
            } else if (santaPrefer.has(tagId)) {
                subjectScore += mainVal;
                breakdown.mainScore += mainVal;
                breakdown.main.push({ name: tag.name, type: 'Prefer', score: mainVal });
                details.matchedTags.prefer.push(tag.name);
            } else if (santaWilling.has(tagId)) {
                subjectScore += (mainVal * 0.5);
                breakdown.mainScore += (mainVal * 0.5);
                breakdown.main.push({ name: tag.name, type: 'Willing', score: (mainVal * 0.5) });
                details.matchedTags.willing.push(tag.name);
            } else {
                breakdown.main.push({ name: tag.name, type: 'None', score: 0 });
            }
        }

        // Score Optional
        for (const tagId of optionalTags) {
            const tag = subject.optionalTags.find(t => t.id === tagId);
            if (santaBanned.has(tagId)) {
                // Banned tag in optional does NOT ban the subject, but counts as 0?
                // Usually "Banned" means "I do not want to draw this".
                // If it's in optional, it might just be ignored.
                // But for safety, let's mark it as Banned type.
                // Does it ban the subject? The prompt says "Banned Tag in Main" was the check.
                // So only Main tags ban the subject.
                breakdown.optional.push({ name: tag.name, type: 'Banned', score: 0 });
            } else if (santaPrefer.has(tagId)) {
                subjectScore += optVal;
                breakdown.optScore += optVal;
                breakdown.optional.push({ name: tag.name, type: 'Prefer', score: optVal });
                details.matchedTags.prefer.push(tag.name);
            } else if (santaWilling.has(tagId)) {
                subjectScore += (optVal * 0.5);
                breakdown.optScore += (optVal * 0.5);
                breakdown.optional.push({ name: tag.name, type: 'Willing', score: (optVal * 0.5) });
                details.matchedTags.willing.push(tag.name);
            } else {
                breakdown.optional.push({ name: tag.name, type: 'None', score: 0 });
            }
        }

        if (subjectIsBanned) {
            subjectScore = 0;
            breakdown.mainScore = 0;
            breakdown.optScore = 0;
        }

        details.subjectScores.push({
            name: subject.name,
            score: subjectScore,
            breakdown,
            rank: isRanked ? subjects.indexOf(subject) + 1 : null,
            isBanned: subjectIsBanned
        });
    }

    // Calculate Total
    if (!isRanked) {
        details.totalScore = details.subjectScores.reduce((a, b) => a + b.score, 0);
    } else {
        const N = details.subjectScores.length;
        if (N > 0) {
            for (let i = 0; i < N; i++) {
                const rank = i + 1;
                const weight = (200 / (N + 1)) * (N - rank + 1);
                details.totalScore += details.subjectScores[i].score * (weight / 100.0);
            }
        }
    }

    // Dedupe tags
    details.matchedTags.prefer = [...new Set(details.matchedTags.prefer)];
    details.matchedTags.willing = [...new Set(details.matchedTags.willing)];

    return details;
}
