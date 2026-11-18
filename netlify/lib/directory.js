/**
 * Generates the public participant/subject directory BBCode.
 *
 * Callers must pass verified signups only. This helper re-checks `verified`
 * so an accidental unverified record can never make it into the directory.
 */
export function generateDirectory(signups) {
    const validSignups = (signups || []).filter(s => s.verified && s.username && s.postUrl);

    if (validSignups.length === 0) {
        return null;
    }

    const getPostId = (url) => {
        if (!url) return 0;
        const match = url.match(/#post_(\d+)/) || url.match(/#(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
    };

    // Sort by post ID to preserve forum post order.
    validSignups.sort((a, b) => getPostId(a.postUrl) - getPostId(b.postUrl));

    let output = "";

    // 1. Participants
    output += "[b][size=4]PARTICIPANTS:[/size][/b]\n\n";

    const genPartDir = (list) => {
        return list.map(s => `[url=${s.postUrl}]${s.username}[/url]`).join(" • ");
    };

    output += "[b]By Post Order:[/b]\n";
    output += genPartDir(validSignups) + "\n\n";

    const sortedSignups = [...validSignups].sort((a, b) =>
        a.username.toLowerCase().localeCompare(b.username.toLowerCase())
    );
    output += "[b]Alphabetical:[/b]\n";
    output += genPartDir(sortedSignups) + "\n\n";

    output += `Total Participants: [b]${validSignups.length}[/b]\n\n`;

    // 2. Subjects
    output += "\n[b][size=4]SUBJECTS:[/size][/b]\n\n";

    let allSubjects = [];
    validSignups.forEach(s => {
        if (s.subjects) {
            s.subjects.forEach(sub => {
                allSubjects.push({
                    name: sub.name,
                    url: s.postUrl,
                    tags: sub.mainTags || []
                });
            });
        }
    });

    const genSubDir = (tagId) => {
        const filtered = allSubjects.filter(s => s.tags.some(t => t.id === tagId));
        filtered.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
        return filtered.map(s => `[url=${s.url}]${s.name}[/url]`).join(" • ");
    };

    output += "[b]Dragon Subjects:[/b]\n";
    output += genSubDir(1) + "\n\n";

    output += "[b]Humanoid Subjects:[/b]\n";
    output += genSubDir(2) + "\n\n";

    output += "[b]Anthropomorphic Subjects:[/b]\n";
    output += genSubDir(3) + "\n\n";

    output += "[b]Feral Subjects:[/b]\n";
    output += genSubDir(4) + "\n\n";

    output += `\nTotal Subjects: [b]${allSubjects.length}[/b]`;

    return output;
}
