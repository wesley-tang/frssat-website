const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const FILES = [
    { year: 2024, path: '2024 Art Submissions - submissions.csv', type: 'new' },
    { year: 2023, path: '2023 Art Submissions - submissions.csv', type: 'new' },
    { year: 2022, path: '2022 Art Submissions - submissions.csv', type: 'new' },
    { year: 2021, path: '2021 Art Submissions (Responses) - Form Responses 1.csv', type: 'old' },
    { year: 2020, path: '2020 Art Submissions (Responses) - Form Responses 1.csv', type: 'old' },
    { year: 2018, path: '2018 SUBMISSIONS - Responses.csv', type: '2018' }
];

const TAG_OBJECTS = {
    'FR Dragon': { name: "FR Dragon", id: 1 },
    'Dragon': { name: "FR Dragon", id: 1 },
    'Humanoid': { name: "Humanoid", id: 2 },
    'Human': { name: "Humanoid", id: 2 },
    'Human/Gijinka/Humanoid': { name: "Humanoid", id: 2 },
    'Anthropomorphic': { name: "Anthropomorphic", id: 3 },
    'Anthro/Furry': { name: "Anthropomorphic", id: 3 },
    'Feral': { name: "Feral", id: 4 },
    'Non-FR Feral': { name: "Feral", id: 4 }
};

const OLD_COLUMN_MAPPING = {
    'What is YOUR OWN username?': 'username',
    "What is YOUR RECIPIENT'S username?": 'recipient',
    'Paste the link to your artwork here:': 'imageUrl',
    'Please pick the category that best describes your artwork:': 'category',
    'Check this box if you would like to remain anonymous:': 'anonymous',
    '(optional) A little message for your recipient! [max 300 characters]': 'message',
    '(optional) Anything you would like the organizers to know!': 'note'
};

const OLD_2018_COLUMN_MAPPING = {
    'What is -your- username?': 'username',
    'What is the username of your -recipient-?': 'recipient',
    'Full Sized Artwork': 'imageUrl',
    'Did you draw Human or Dragon art?': 'category'
};

function parseCSV(content) {
    const records = [];
    let currentRecord = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const nextChar = content[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentField += '"';
                i++; // Skip escaped quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentRecord.push(currentField);
            currentField = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            // Handle CRLF or LF
            if (char === '\r' && nextChar === '\n') {
                i++;
            }

            // Only add record if it's not empty (handling trailing newlines)
            // But be careful: a record could be just empty fields which is valid but we want to push what we have
            currentRecord.push(currentField);
            if (currentRecord.length > 1 || currentRecord[0] !== '') {
                records.push(currentRecord);
            }

            currentRecord = [];
            currentField = '';
        } else {
            currentField += char;
        }
    }

    // Push last record if exists
    if (currentField || currentRecord.length > 0) {
        currentRecord.push(currentField);
        records.push(currentRecord);
    }

    // Convert to objects using headers
    const headers = records[0];
    return records.slice(1).map(values => {
        const entry = {};
        headers.forEach((header, index) => {
            // Clean header name (sometimes BOM or whitespace issues)
            const cleanHeader = header.trim();
            entry[cleanHeader] = values[index] || '';
        });
        return entry;
    });
}

function getTagObject(categoryString) {
    if (!categoryString) return [];
    const tag = TAG_OBJECTS[categoryString.trim()];
    if (!tag) {
        // Only warn if it's not empty (empty categories are common/handled)
        if (categoryString.trim() !== '') {
            console.warn(`Warning: Unknown category "${categoryString}"`);
        }
        return [];
    }
    return [tag];
}

function processFile(fileConfig) {
    const filePath = path.resolve(__dirname, '..', fileConfig.path);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return [];
    }

    const content = fs.readFileSync(filePath, 'utf8');
    // Remove BOM if present
    const cleanContent = content.replace(/^\uFEFF/, '');
    const records = parseCSV(cleanContent);
    const eventId = `frssat_${fileConfig.year}`;

    return records.map(record => {
        let submission = {
            eventId: eventId,
            altLinks: [],
            tags: []
        };

        if (fileConfig.type === 'new') {
            submission.uuid = record.uuid;
            submission.username = record.username;
            submission.recipient = record.recipient;
            submission.imageUrl = record.imageUrl ? record.imageUrl.trim() : '';
            submission.message = record.message;
            submission.note = record.note;
            submission.anonymous = (record.anonymous && record.anonymous.toLowerCase() === 'true');

            submission.tags = getTagObject(record.category);

            if (record.altLinks) {
                submission.altLinks = record.altLinks.split(',').map(link => link.trim()).filter(link => link !== '');
            }

        } else if (fileConfig.type === 'old') {
            // Old format mapping (2020-2021)
            submission.uuid = crypto.randomUUID();
            submission.username = record[Object.keys(OLD_COLUMN_MAPPING).find(k => OLD_COLUMN_MAPPING[k] === 'username')];
            submission.recipient = record[Object.keys(OLD_COLUMN_MAPPING).find(k => OLD_COLUMN_MAPPING[k] === 'recipient')];
            submission.imageUrl = record[Object.keys(OLD_COLUMN_MAPPING).find(k => OLD_COLUMN_MAPPING[k] === 'imageUrl')];
            if (submission.imageUrl) submission.imageUrl = submission.imageUrl.trim();
            submission.message = record[Object.keys(OLD_COLUMN_MAPPING).find(k => OLD_COLUMN_MAPPING[k] === 'message')];
            submission.note = record[Object.keys(OLD_COLUMN_MAPPING).find(k => OLD_COLUMN_MAPPING[k] === 'note')];

            const anonVal = record[Object.keys(OLD_COLUMN_MAPPING).find(k => OLD_COLUMN_MAPPING[k] === 'anonymous')];
            submission.anonymous = !!anonVal && anonVal.trim() !== '';

            const catString = record[Object.keys(OLD_COLUMN_MAPPING).find(k => OLD_COLUMN_MAPPING[k] === 'category')];
            submission.tags = getTagObject(catString);
        } else if (fileConfig.type === '2018') {
            // 2018 format mapping
            submission.uuid = crypto.randomUUID();
            submission.username = record[Object.keys(OLD_2018_COLUMN_MAPPING).find(k => OLD_2018_COLUMN_MAPPING[k] === 'username')];
            submission.recipient = record[Object.keys(OLD_2018_COLUMN_MAPPING).find(k => OLD_2018_COLUMN_MAPPING[k] === 'recipient')];
            submission.imageUrl = record[Object.keys(OLD_2018_COLUMN_MAPPING).find(k => OLD_2018_COLUMN_MAPPING[k] === 'imageUrl')];
            if (submission.imageUrl) submission.imageUrl = submission.imageUrl.trim();

            // Defaults for 2018
            submission.message = "";
            submission.note = "";
            submission.anonymous = false;

            const catString = record[Object.keys(OLD_2018_COLUMN_MAPPING).find(k => OLD_2018_COLUMN_MAPPING[k] === 'category')];
            submission.tags = getTagObject(catString);
        }

        return submission;
    }).filter(sub => sub.username && sub.username.trim() !== '' && sub.imageUrl && sub.imageUrl.trim() !== '');
}

function main() {
    let allSubmissions = [];

    FILES.forEach(fileConfig => {
        console.log(`Processing ${fileConfig.year}...`);
        const submissions = processFile(fileConfig);
        allSubmissions = allSubmissions.concat(submissions);
        console.log(`  Found ${submissions.length} submissions.`);
    });

    const outputPath = path.resolve(__dirname, '..', 'migrated_submissions.json');
    fs.writeFileSync(outputPath, JSON.stringify(allSubmissions, null, 2));
    console.log(`\nMigration complete. Wrote ${allSubmissions.length} submissions to ${outputPath}`);
}

main();
