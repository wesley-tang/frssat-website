import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

/**
 * BBCodeEditor - A TextField with BBCode formatting toolbar
 * @param {Object} props
 * @param {string} props.value - The current text value
 * @param {function} props.onChange - Change handler (receives event)
 * @param {string} props.label - TextField label
 * @param {string} props.id - TextField id (required for selection handling)
 * @param {Object} props.textFieldProps - Additional TextField props
 */
export const BBCodeEditor = ({
    value,
    onChange,
    label = "Text",
    id = "bbcode-editor",
    textFieldProps = {}
}) => {
    const handleTagInsert = (tag) => {
        const textarea = document.getElementById(id);
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = value;
        const selectedText = text.substring(start, end);

        let replacement = "";

        if (tag === "img") {
            const url = window.prompt("Enter the image URL:");
            if (url) {
                replacement = `[img alt=""]${url}[/img]`;
            } else {
                return; // Cancelled
            }
        } else {
            replacement = `[${tag}]${selectedText}[/${tag}]`;
        }

        const newText = text.substring(0, start) + replacement + text.substring(end);

        // Create a synthetic event to maintain compatibility with onChange handlers
        const syntheticEvent = {
            target: {
                value: newText,
                id: id
            }
        };
        onChange(syntheticEvent);

        // Restore selection/cursor
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + replacement.length, start + replacement.length);
        }, 0);
    };

    return (
        <>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Tooltip title="Bold">
                    <IconButton onClick={() => handleTagInsert('b')}>
                        <FormatBoldIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Italic">
                    <IconButton onClick={() => handleTagInsert('i')}>
                        <FormatItalicIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Underline">
                    <IconButton onClick={() => handleTagInsert('u')}>
                        <FormatUnderlinedIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Quote">
                    <IconButton onClick={() => handleTagInsert('quote')}>
                        <FormatQuoteIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Image">
                    <IconButton onClick={() => handleTagInsert('img')}>
                        <AddPhotoAlternateIcon />
                    </IconButton>
                </Tooltip>
            </Box>
            <TextField
                id={id}
                label={label}
                value={value}
                onChange={onChange}
                fullWidth
                multiline
                {...textFieldProps}
            />
        </>
    );
};
