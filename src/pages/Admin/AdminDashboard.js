import React, { useEffect, useState, useCallback } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { DataGrid } from '@mui/x-data-grid';
import {
    Button, Chip, TextField, Paper, Typography, Box, Grid, Dialog, DialogTitle, DialogContent, DialogActions,
    FormControlLabel, Checkbox, Tabs, Tab, Modal, Container, Slider, InputAdornment, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import CheckIcon from '@mui/icons-material/Check';
import RefreshIcon from '@mui/icons-material/Refresh';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ReplayIcon from '@mui/icons-material/Replay';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import { IconButton, Tooltip, Alert, CircularProgress } from '@mui/material';
import { runMatching } from '../../utils/matching';
import ImageCarousel from '../../components/ImageCarousel';

const MatchingSettingsDialog = ({ open, onClose, options, setOptions, maxSubjects }) => {
    const [localOptions, setLocalOptions] = useState(options);

    useEffect(() => {
        if (open) {
            // Ensure starting values are at least equal to minimums on open
            setLocalOptions(prev => ({
                ...options,
                startingScore: Math.max(options.startingScore, options.minScore),
                startingQuality: Math.max(options.startingQuality, options.minQuality)
            }));
        }
    }, [open, options]);

    const handleChange = (field, value) => {
        setLocalOptions(prev => {
            const newOptions = { ...prev, [field]: value };

            // Enforce constraints
            if (field === 'minScore' && newOptions.startingScore < value) {
                newOptions.startingScore = value;
            }
            if (field === 'startingScore' && newOptions.minScore > value) {
                newOptions.minScore = value;
            }
            if (field === 'minQuality' && newOptions.startingQuality < value) {
                newOptions.startingQuality = value;
            }
            if (field === 'startingQuality' && newOptions.minQuality > value) {
                newOptions.minQuality = value;
            }

            return newOptions;
        });
    };

    const handleClose = () => {
        setOptions(localOptions);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Matching Settings</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2, width: '100%' }}>

                    {/* Starting Score */}
                    <Box sx={{ width: '100%' }}>
                        <Typography gutterBottom>Starting Score</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Slider
                                    value={localOptions.startingScore}
                                    onChange={(e, val) => handleChange('startingScore', val)}
                                    min={0}
                                    max={maxSubjects * 100}
                                    valueLabelDisplay="auto"
                                />
                            </Box>
                            <TextField
                                value={localOptions.startingScore}
                                onChange={(e) => handleChange('startingScore', Number(e.target.value))}
                                type="number"
                                size="small"
                                sx={{ width: 80 }}
                            />
                        </Box>
                    </Box>

                    {/* Minimum Score */}
                    <Box sx={{ width: '100%' }}>
                        <Typography gutterBottom>Minimum Score</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Slider
                                    value={localOptions.minScore}
                                    onChange={(e, val) => handleChange('minScore', val)}
                                    min={0}
                                    max={maxSubjects * 100}
                                    valueLabelDisplay="auto"
                                />
                            </Box>
                            <TextField
                                value={localOptions.minScore}
                                onChange={(e) => handleChange('minScore', Number(e.target.value))}
                                type="number"
                                size="small"
                                sx={{ width: 80 }}
                            />
                        </Box>
                    </Box>

                    {/* Starting Quality */}
                    <Box sx={{ width: '100%' }}>
                        <Typography gutterBottom>Starting Quality (%)</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Slider
                                    value={localOptions.startingQuality}
                                    onChange={(e, val) => handleChange('startingQuality', val)}
                                    min={0}
                                    max={100}
                                    valueLabelDisplay="auto"
                                />
                            </Box>
                            <TextField
                                value={localOptions.startingQuality}
                                onChange={(e) => handleChange('startingQuality', Number(e.target.value))}
                                type="number"
                                size="small"
                                sx={{ width: 80 }}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Minimum Quality */}
                    <Box sx={{ width: '100%' }}>
                        <Typography gutterBottom>Minimum Quality (%)</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Slider
                                    value={localOptions.minQuality}
                                    onChange={(e, val) => handleChange('minQuality', val)}
                                    min={0}
                                    max={100}
                                    valueLabelDisplay="auto"
                                />
                            </Box>
                            <TextField
                                value={localOptions.minQuality}
                                onChange={(e) => handleChange('minQuality', Number(e.target.value))}
                                type="number"
                                size="small"
                                sx={{ width: 80 }}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                }}
                            />
                        </Box>
                    </Box>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={localOptions.enableEmergency}
                                onChange={(e) => handleChange('enableEmergency', e.target.checked)}
                            />
                        }
                        label="Enable Emergency Matches (Ignore thresholds if needed)"
                    />

                    {/* Max Iterations */}
                    <Box sx={{ width: '100%' }}>
                        <Typography gutterBottom>Max Iterations</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Slider
                                    value={localOptions.maxIterations || 100}
                                    onChange={(e, val) => handleChange('maxIterations', val)}
                                    min={1}
                                    max={1000}
                                    valueLabelDisplay="auto"
                                />
                            </Box>
                            <TextField
                                value={localOptions.maxIterations || 100}
                                onChange={(e) => handleChange('maxIterations', Number(e.target.value))}
                                type="number"
                                size="small"
                                sx={{ width: 80 }}
                            />
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [signups, setSignups] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [activeEvent, setActiveEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    // Event Editing State
    const [eventForm, setEventForm] = useState({});
    const [isEditingEvent, setIsEditingEvent] = useState(false);

    // Title Editing State
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleEditValue, setTitleEditValue] = useState("");

    // Tag Editing State
    const [tagModalOpen, setTagModalOpen] = useState(false);
    const [currentTag, setCurrentTag] = useState(null);

    // Signup Detail Modal State
    const [signupModalOpen, setSignupModalOpen] = useState(false);
    const [selectedSignup, setSelectedSignup] = useState(null);

    // Directory Generation State
    const [directoryModalOpen, setDirectoryModalOpen] = useState(false);
    const [generatedDirectory, setGeneratedDirectory] = useState("");

    // Matching State
    const [tabValue, setTabValue] = useState(0);
    const [matches, setMatches] = useState([]);
    const [unmatchedSantas, setUnmatchedSantas] = useState([]);
    const [matchFilter, setMatchFilter] = useState('all'); // 'all', 'A', 'B'
    const [signupFilter, setSignupFilter] = useState('all'); // 'all', 'A', 'B'
    const [participantFilter, setParticipantFilter] = useState('all'); // 'all', 'not_submitted', 'not_received'
    const [selectedMatch, setSelectedMatch] = useState(null); // For details modal
    const [selectedSubmission, setSelectedSubmission] = useState(null); // For submission details modal
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [selectedNote, setSelectedNote] = useState(null); // For viewing notes
    const [matchingProgress, setMatchingProgress] = useState(null); // { iteration, total, tier }
    const [matchingOptions, setMatchingOptions] = useState({
        minScore: 100,
        minQuality: 30,
        startingScore: 200,
        startingQuality: 50,
        enableEmergency: false,
        maxIterations: 100
    });
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);

    const fetchData = useCallback((adminKey, background = false) => {
        if (!background) setLoading(true);
        axios.get('/api/admin/data', {
            headers: { 'x-admin-key': adminKey }
        })
            .then(response => {
                setSignups(response.data.signups);
                setSubmissions(response.data.submissions || []);
                setActiveEvent(response.data.activeEvent);
                setEventForm(response.data.activeEvent);
                setTitleEditValue(response.data.activeEvent.title);

                // Handle existing matches
                if (response.data.matches && response.data.matches.length > 0) {
                    const enrichedMatches = response.data.matches.map(m => {
                        // Find recipient signup to get subjects
                        // The matchup stores recipient.id which should match signup._id (as string or ObjectId)
                        const recipientSignup = response.data.signups.find(s =>
                            s._id === m.recipient.id || s.username === m.recipient.username
                        );
                        return {
                            ...m,
                            recipient: {
                                ...m.recipient,
                                subjects: recipientSignup ? recipientSignup.subjects : []
                            }
                        };
                    });
                    setMatches(enrichedMatches);
                    // If matches exist, we probably want to show them
                    setTabValue(1);
                }

                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                setLoading(false);
                if (error.response && error.response.status === 401) {
                    navigate("/admin");
                }
            });
    }, [navigate]);

    useEffect(() => {
        const adminKey = localStorage.getItem("adminKey");
        if (!adminKey) {
            navigate("/admin");
            return;
        }

        fetchData(adminKey);
    }, [navigate, fetchData]);

    const handleUpdateEvent = (updates) => {
        const adminKey = localStorage.getItem("adminKey");
        axios.post('/api/admin/event/update', updates, {
            headers: { 'x-admin-key': adminKey }
        })
            .then(response => {
                setActiveEvent(response.data.activeEvent);
                setEventForm(response.data.activeEvent);
                setTitleEditValue(response.data.activeEvent.title);
                setIsEditingEvent(false);
                setIsEditingTitle(false);
                alert("Event updated successfully");
            })
            .catch(error => {
                console.error("Error updating event:", error);
                alert("Failed to update event");
            });
    };

    const handleSaveEventInfo = () => {
        const updates = { ...eventForm };
        if (updates.signUpDeadLine) updates.signUpDeadLine = new Date(updates.signUpDeadLine).toISOString();
        if (updates.endDate) updates.endDate = new Date(updates.endDate).toISOString();

        handleUpdateEvent(updates);
    };

    const handleCancelEventEdit = () => {
        setEventForm(activeEvent);
        setIsEditingEvent(false);
    };

    const handleSaveTitle = () => {
        handleUpdateEvent({ title: titleEditValue });
    };

    const handleCancelTitleEdit = () => {
        setTitleEditValue(activeEvent.title);
        setIsEditingTitle(false);
    };

    // --- Tag Management ---

    const handleOpenTagModal = (tag) => {
        if (tag) {
            setCurrentTag({ ...tag });
        } else {
            setCurrentTag({
                name: "",
                id: "",
                description: "",
                exampleImageUrl: "",
                imageCredit: "",
                required: false
            });
        }
        setTagModalOpen(true);
    };

    const handleCloseTagModal = () => {
        setTagModalOpen(false);
        setCurrentTag(null);
    };

    const handleSaveTag = () => {
        if (!currentTag.name || !currentTag.id) {
            alert("Name and ID are required");
            return;
        }

        const currentTags = activeEvent.tags || [];
        const existingIndex = currentTags.findIndex(t => t.id === currentTag.id);
        let updatedTags;

        if (existingIndex >= 0) {
            updatedTags = [...currentTags];
            updatedTags[existingIndex] = currentTag;
        } else {
            updatedTags = [...currentTags, currentTag];
        }

        handleUpdateEvent({ tags: updatedTags });
        handleCloseTagModal();
    };

    const handleDeleteTag = (tagId) => {
        if (!window.confirm("Are you sure you want to delete this tag?")) return;
        const currentTags = activeEvent.tags || [];
        const updatedTags = currentTags.filter(tag => tag.id !== tagId);
        handleUpdateEvent({ tags: updatedTags });
        handleCloseTagModal();
    };

    // --- Matching ---

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleRunMatching = async () => {
        setMatchingProgress({ iteration: 0, total: matchingOptions.maxIterations || 100, tier: 'Starting...' });

        // Use setTimeout to allow UI to render the loading state before heavy computation starts
        setTimeout(async () => {
            try {
                const result = await runMatching(signups, matchingOptions, (iteration, total, tier) => {
                    setMatchingProgress({ iteration, total, tier });
                });

                setMatches(result.matches);
                setUnmatchedSantas(result.unmatchedSantas);
                setTabValue(1); // Switch to Matches tab
                setMatchingProgress(null);
            } catch (error) {
                console.error("Error running matching:", error);
                alert("Failed to run matching algorithm");
                setMatchingProgress(null);
            }
        }, 100);
    };

    const handleFinalizeMatchups = () => {
        if (!window.confirm("WARNING: This will LOCK IN matches and CLOSE SIGNUPS. This action cannot be easily undone. Are you sure?")) return;

        const adminKey = localStorage.getItem("adminKey");
        axios.post('/api/admin/match/execute', {
            matches: matches,
            finalize: true
        }, {
            headers: { 'x-admin-key': adminKey }
        })
            .then(response => {
                alert("Matchups Finalized and Signups Closed!");
                fetchData(adminKey); // Refresh data to update event status
            })
            .catch(error => {
                console.error("Error finalizing:", error);
                alert("Failed to finalize matchups");
            });
    };

    const handleGenerateDirectory = () => {
        // Filter for valid signups (must have username and postUrl)
        const validSignups = signups.filter(s => s.username && s.postUrl);

        if (validSignups.length === 0) {
            alert("No valid signups (with username and postUrl) to generate directory from.");
            return;
        }

        // Helper to extract Post ID for sorting
        const getPostId = (url) => {
            if (!url) return 0;
            const match = url.match(/#post_(\d+)/) || url.match(/#(\d+)/);
            return match ? parseInt(match[1]) : 0;
        };

        // Sort by Post ID to ensure correct "Post Order"
        validSignups.sort((a, b) => getPostId(a.postUrl) - getPostId(b.postUrl));

        let output = "";

        // 1. Participants
        output += "[b][size=4]PARTICIPANTS:[/size][/b]\n\n";

        const genPartDir = (list) => {
            return list.map(s => `[url=${s.postUrl}]${s.username}[/url]`).join(" • ");
        };

        // Post Order
        output += "[b]By Post Order:[/b]\n";
        output += genPartDir(validSignups) + "\n\n";

        // Alphabetical
        const sortedSignups = [...validSignups].sort((a, b) => a.username.toLowerCase().localeCompare(b.username.toLowerCase()));
        output += "[b]Alphabetical:[/b]\n";
        output += genPartDir(sortedSignups) + "\n\n";

        output += `Total Participants: [b]${validSignups.length}[/b]\n\n`;

        // 2. Subjects
        output += "\n[b][size=4]SUBJECTS:[/size][/b]\n\n";

        // Flatten subjects
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
            // Filter by tag ID (loose comparison for string/number safety)
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

        setGeneratedDirectory(output);
        setDirectoryModalOpen(true);
    };

    const handleCopyAndOpen = () => {
        navigator.clipboard.writeText(generatedDirectory);
        if (activeEvent?.signupThreadUrl) {
            window.open(activeEvent.signupThreadUrl, '_blank');
        } else {
            alert("Directory copied to clipboard! (No signup thread URL found)");
        }
    };

    const handleDownloadJson = () => {
        const jsonString = JSON.stringify(signups, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "signups_dump.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Helpers ---
    const handleOpenSignupModal = (signup) => {
        setSelectedSignup(signup);
        setSignupModalOpen(true);
    };

    const handleCloseSignupModal = () => {
        setSignupModalOpen(false);
        setSelectedSignup(null);
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return localDate.toISOString().slice(0, 16);
    };

    const columns = [

        { field: 'username', headerName: 'Username', width: 150 },
        {
            field: 'userId',
            headerName: 'User ID',
            width: 100,
            renderCell: (params) => (
                <a
                    href={`https://www1.flightrising.com/clan-profile/${params.value}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#1976d2', textDecoration: 'underline' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {params.value}
                </a>
            )
        },
        {
            field: 'tier',
            headerName: 'Tier',
            width: 80,
            renderCell: (params) => {
                return (params && params.row && params.row.highTier) ? 'Tier A' : 'Tier B';
            }
        },
        {
            field: 'postUrl',
            headerName: 'Forum Post',
            width: 120,
            renderCell: (params) => (
                params.value ? (
                    <a
                        href={params.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#1976d2', textDecoration: 'underline' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        View Post
                    </a>
                ) : 'N/A'
            )
        },
        {
            field: 'details',
            headerName: 'Details',
            width: 150,
            renderCell: (params) => (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenSignupModal(params.row)}
                >
                    View Details
                </Button>
            )
        },
        { field: 'updatedAt', headerName: 'Last Updated', width: 200 },
    ];

    const getScoreColor = (score) => {
        // Assuming score ranges from 0 to ~100 (or adjust maxScore based on your algorithm)
        const maxScore = 100;
        const normalized = Math.min(Math.max(score, 0), maxScore) / maxScore;
        // Red (0) to Green (120)
        const hue = normalized * 120;
        return `hsl(${hue}, 100%, 40%)`;
    };

    const filteredSignups = signups.filter(s => {
        if (signupFilter === 'all') return true;
        const isTierA = s.highTier;
        return signupFilter === 'A' ? isTierA : !isTierA;
    });

    const rows = filteredSignups.map((s, index) => ({
        id: index + 1,
        ...s
    }));

    // --- MATCHES COLUMNS ---
    const matchColumns = [
        {
            field: 'santaUsername',
            headerName: 'Santa',
            width: 150,
            valueGetter: (value, row) => row?.santa?.username || 'Unknown'
        },
        {
            field: 'recipientUsername',
            headerName: 'Recipient',
            width: 150,
            valueGetter: (value, row) => row?.recipient?.username || 'Unknown'
        },
        {
            field: 'tier',
            headerName: 'Tier',
            width: 80,
            valueGetter: (value, row) => row?.santa?.tier || 'N/A'
        },
        {
            field: 'subjectCount',
            headerName: 'Subjects',
            width: 80,
            renderCell: (params) => params.row.recipient?.subjects?.length || 0
        },
        {
            field: 'score',
            headerName: 'Score',
            width: 100,
            type: 'number',
            renderCell: (params) => {
                if (params.value == null) return 'N/A';
                return (
                    <span style={{ color: getScoreColor(params.value), fontWeight: 'bold' }}>
                        {params.value.toFixed(2)}
                    </span>
                );
            }
        },
        {
            field: 'quality',
            headerName: 'Quality',
            width: 100,
            renderCell: (params) => {
                const quality = params.value || 0;

                let color = 'error.main';
                if (quality >= 80) color = 'success.main';
                else if (quality >= 50) color = 'warning.main';

                return <Typography variant="body2" sx={{ color: color, fontWeight: 'bold' }}>{quality.toFixed(0)}%</Typography>;
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <Button size="small" onClick={() => setSelectedMatch(params.row)}>
                    View Details
                </Button>
            )
        }
    ];

    // --- SUBMISSIONS COLUMNS ---
    const submissionColumns = [
        { field: 'username', headerName: 'Santa', width: 150 },
        { field: 'recipient', headerName: 'Recipient', width: 150 },
        {
            field: 'tags',
            headerName: 'Tags',
            width: 120,
            renderCell: (params) => {
                const tags = params.value || [];
                const tagNames = tags.map(t => typeof t === 'string' ? t : t.name).join(', ');
                return (
                    <Tooltip title={tagNames}>
                        <Chip label={`${tags.length} Tags`} size="small" variant="outlined" />
                    </Tooltip>
                );
            }
        },
        {
            field: 'note',
            headerName: 'Note',
            width: 100,
            renderCell: (params) => (
                params.value ? (
                    <Button size="small" onClick={() => setSelectedNote(params.value)}>
                        View Note
                    </Button>
                ) : 'None'
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <Button size="small" onClick={() => {
                    setSelectedSubmission(params.row);
                    setCarouselIndex(0);
                }}>
                    View Details
                </Button>
            )
        },
        { field: 'uuid', headerName: 'UUID', width: 300 }
    ];

    // --- PARTICIPANTS COLUMNS ---
    const participantColumns = [
        { field: 'username', headerName: 'Username', width: 150 },
        {
            field: 'userId',
            headerName: 'User ID',
            width: 100,
            renderCell: (params) => (
                <a
                    href={`https://www1.flightrising.com/clan-profile/${params.value}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#1976d2', textDecoration: 'underline' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {params.value}
                </a>
            )
        },
        {
            field: 'hasSubmitted',
            headerName: 'Submitted?',
            width: 120,
            type: 'boolean',
            renderCell: (params) => (
                params.value ? <CheckIcon color="success" /> : <CancelIcon color="error" />
            )
        },
        {
            field: 'hasReceived',
            headerName: 'Received?',
            width: 120,
            type: 'boolean',
            renderCell: (params) => (
                params.value ? <CheckIcon color="success" /> : <CancelIcon color="error" />
            )
        }
    ];

    const filteredParticipants = signups.map((s, index) => {
        const hasSubmitted = submissions.some(sub => sub.username === s.username);
        const hasReceived = submissions.some(sub => sub.recipient === s.username);
        return {
            id: index + 1,
            username: s.username,
            userId: s.userId,
            hasSubmitted,
            hasReceived
        };
    }).filter(p => {
        if (participantFilter === 'all') return true;
        if (participantFilter === 'not_submitted') return !p.hasSubmitted;
        if (participantFilter === 'not_received') return !p.hasReceived;
        return true;
    });

    const filteredMatches = matches.filter(m => {
        if (matchFilter === 'all') return true;
        return m.santa.tier === (matchFilter === 'A' ? 'Tier A' : 'Tier B');
    });

    if (loading) return <div>Loading...</div>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <MatchingSettingsDialog
                open={settingsModalOpen}
                onClose={() => setSettingsModalOpen(false)}
                options={matchingOptions}
                setOptions={setMatchingOptions}
                maxSubjects={activeEvent?.config?.maxSubjects || 5}
            />

            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h4" gutterBottom>
                    Admin Dashboard
                </Typography>

                {/* EVENT STATUS & INFO */}
                {activeEvent && (
                    <>
                        <Paper elevation={3} sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f5f5f5' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {isEditingTitle ? (
                                        <>
                                            <TextField
                                                value={titleEditValue}
                                                onChange={(e) => setTitleEditValue(e.target.value)}
                                                variant="standard"
                                                InputProps={{ style: { fontSize: '2.125rem', fontWeight: 'bold', color: '#1976d2' } }}
                                            />
                                            <Button color="success" onClick={handleSaveTitle}><CheckIcon /></Button>
                                            <Button color="error" onClick={handleCancelTitleEdit}><CancelIcon /></Button>
                                        </>
                                    ) : (
                                        <>
                                            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                {activeEvent.title}
                                            </Typography>
                                            <Button size="small" onClick={() => setIsEditingTitle(true)}><EditIcon /></Button>
                                        </>
                                    )}
                                </Box>
                                <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                                    ID: <strong>{activeEvent._id}</strong>
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="overline" display="block" gutterBottom>
                                    Current Status
                                </Typography>
                                <Chip
                                    label={activeEvent.status.toUpperCase()}
                                    color={activeEvent.status === 'signups_open' ? 'success' : 'warning'}
                                    sx={{ fontSize: '1.2rem', padding: '20px 10px' }}
                                />
                                <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    {activeEvent?.status === 'setup' && (
                                        <Button variant="contained" color="success" onClick={() => handleUpdateEvent({ status: 'signups_open' })}>
                                            Open Signups
                                        </Button>
                                    )}
                                    {activeEvent?.status === 'signups_open' && (
                                        <Button variant="contained" color="warning" onClick={() => handleUpdateEvent({ status: 'signups_closed' })}>
                                            Close Signups (Manual)
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </Paper>

                        {/* Event Info Section */}
                        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h5">Event Details</Typography>
                                <Box>
                                    {isEditingEvent ? (
                                        <>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                startIcon={<CancelIcon />}
                                                onClick={handleCancelEventEdit}
                                                sx={{ mr: 1 }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                startIcon={<SaveIcon />}
                                                onClick={handleSaveEventInfo}
                                            >
                                                Save Changes
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            startIcon={<EditIcon />}
                                            onClick={() => setIsEditingEvent(true)}
                                        >
                                            Edit Details
                                        </Button>
                                    )}
                                </Box>
                            </Box>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Signups Deadline"
                                        type="datetime-local"
                                        value={formatDateForInput(eventForm.signUpDeadLine)}
                                        onChange={(e) => setEventForm({ ...eventForm, signUpDeadLine: e.target.value })}
                                        disabled={!isEditingEvent}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Event End Date"
                                        type="datetime-local"
                                        value={formatDateForInput(eventForm.endDate)}
                                        onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                                        disabled={!isEditingEvent}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Main Thread URL"
                                        value={eventForm.mainThreadUrl || ""}
                                        onChange={(e) => setEventForm({ ...eventForm, mainThreadUrl: e.target.value })}
                                        disabled={!isEditingEvent}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Signup Thread URL"
                                        value={eventForm.signupThreadUrl || ""}
                                        onChange={(e) => setEventForm({ ...eventForm, signupThreadUrl: e.target.value })}
                                        disabled={!isEditingEvent}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Tag Management Section */}
                        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h5">Tags</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleOpenTagModal(null)}
                                >
                                    Add Tag
                                </Button>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {activeEvent.tags && activeEvent.tags.map((tag) => (
                                    <Chip
                                        key={tag.id}
                                        label={tag.name}
                                        onClick={() => handleOpenTagModal(tag)}
                                        onDelete={() => handleDeleteTag(tag.id)}
                                        color={tag.required ? "secondary" : "primary"}
                                        variant="outlined"
                                        sx={{ cursor: 'pointer' }}
                                    />
                                ))}
                            </Box>
                        </Paper>
                    </>
                )
                }

                {/* TABS */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label={`Signups (${signups.length})`} />
                        <Tab label={`Matches (${matches.length})`} disabled={matches.length === 0 && activeEvent?.status === 'signups_open'} />
                        <Tab label={`Submissions (${submissions.length})`} />
                        <Tab label="Participants" />
                    </Tabs>
                </Box>

                {/* TAB 0: SIGNUPS */}
                <div role="tabpanel" hidden={tabValue !== 0}>
                    {tabValue === 0 && (
                        <Box sx={{ mt: 2 }}>
                            {/* ACTIONS BAR */}
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <ToggleButtonGroup
                                        value={signupFilter}
                                        exclusive
                                        onChange={(e, newAlignment) => {
                                            if (newAlignment !== null) {
                                                setSignupFilter(newAlignment);
                                            }
                                        }}
                                        aria-label="signup filter"
                                        size="small"
                                    >
                                        <ToggleButton value="all" aria-label="all">
                                            All
                                        </ToggleButton>
                                        <ToggleButton value="A" aria-label="tier a">
                                            Tier A
                                        </ToggleButton>
                                        <ToggleButton value="B" aria-label="tier b">
                                            Tier B
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>
                                <Box>
                                    <Tooltip title="Refresh Data">
                                        <IconButton onClick={() => fetchData(localStorage.getItem("adminKey"), true)} color="primary">
                                            <RefreshIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Generate Directory">
                                        <IconButton onClick={handleGenerateDirectory} color="primary">
                                            <ListAltIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Get as JSON">
                                        <IconButton onClick={handleDownloadJson} color="primary">
                                            <DownloadIcon />
                                        </IconButton>
                                    </Tooltip>
                                    {activeEvent?.status === 'signups_open' && (
                                        <>
                                            <Tooltip title="Matching Settings">
                                                <IconButton onClick={() => setSettingsModalOpen(true)} color="primary">
                                                    <SettingsIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Button variant="contained" color="secondary" onClick={handleRunMatching} sx={{ ml: 2 }}>
                                                Run Matching
                                            </Button>
                                        </>
                                    )}
                                </Box>
                            </Box>

                            <div style={{ height: 600, width: '100%' }}>
                                <DataGrid
                                    rows={rows}
                                    columns={columns}
                                    pageSize={10}
                                    rowsPerPageOptions={[10, 25, 50, 100]}
                                    disableSelectionOnClick
                                    sx={{
                                        '& .MuiDataGrid-columnHeaders': {
                                            fontWeight: 'bold',
                                        },
                                    }}
                                />
                            </div>
                        </Box>
                    )}
                </div>

                {/* TAB 1: MATCHES */}
                <div role="tabpanel" hidden={tabValue !== 1}>
                    {tabValue === 1 && (
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ mb: 2 }}>
                                {unmatchedSantas.length > 0 && (
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        <strong>Unmatched Santas ({unmatchedSantas.length}):</strong> {unmatchedSantas.map(s => s.username).join(', ')}
                                    </Alert>
                                )}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <ToggleButtonGroup
                                            value={matchFilter}
                                            exclusive
                                            onChange={(e, newAlignment) => {
                                                if (newAlignment !== null) {
                                                    setMatchFilter(newAlignment);
                                                }
                                            }}
                                            aria-label="match filter"
                                            size="small"
                                        >
                                            <ToggleButton value="all" aria-label="all">
                                                All
                                            </ToggleButton>
                                            <ToggleButton value="A" aria-label="tier a">
                                                Tier A
                                            </ToggleButton>
                                            <ToggleButton value="B" aria-label="tier b">
                                                Tier B
                                            </ToggleButton>
                                        </ToggleButtonGroup>
                                    </Box>

                                    <Box>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Tooltip title="Matching Settings">
                                                <IconButton onClick={() => setSettingsModalOpen(true)} color="primary" disabled={activeEvent?.status === 'signups_closed'}>
                                                    <SettingsIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                onClick={handleRunMatching}
                                                startIcon={<ReplayIcon />}
                                                disabled={activeEvent?.status === 'signups_closed'}
                                            >
                                                {matches.length > 0 ? "Re-run Matching" : "Run Matching"}
                                            </Button>

                                            {matches.length > 0 && (
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    onClick={handleFinalizeMatchups}
                                                    disabled={activeEvent?.status === 'signups_closed'}
                                                >
                                                    Finalize Matchups
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>

                            <div style={{ height: 600, width: '100%', position: 'relative' }}>
                                {matchingProgress && (
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        bgcolor: 'rgba(255, 255, 255, 0.7)',
                                        zIndex: 10,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <CircularProgress size={60} />
                                        <Typography variant="h6" sx={{ mt: 2 }}>
                                            Matching attempt {matchingProgress.iteration}/{matchingProgress.total} for {matchingProgress.tier}
                                        </Typography>
                                    </Box>
                                )}
                                <DataGrid
                                    initialState={{
                                        sorting: {
                                            sortModel: [{ field: 'quality', sort: 'asc' }],
                                        },
                                    }}
                                    rows={filteredMatches}
                                    columns={matchColumns}
                                    getRowId={(row) => row.santa.id}
                                    pageSize={25}
                                    rowsPerPageOptions={[25, 50, 100]}
                                    disableSelectionOnClick
                                    sx={{
                                        '& .MuiDataGrid-columnHeaders': {
                                            fontWeight: 'bold',
                                        },
                                    }}
                                />
                            </div>
                        </Box>
                    )}
                </div>

                {/* TAB 2: SUBMISSIONS */}
                <div role="tabpanel" hidden={tabValue !== 2}>
                    {tabValue === 2 && (
                        <Box sx={{ mt: 2, opacity: activeEvent?.status !== 'signups_closed' ? 0.5 : 1, pointerEvents: activeEvent?.status !== 'signups_closed' ? 'none' : 'auto' }}>
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">
                                    Art Submissions ({submissions.length})
                                    {activeEvent?.status !== 'signups_closed' && " (Available after signups close)"}
                                </Typography>
                                <Button
                                    startIcon={<RefreshIcon />}
                                    onClick={() => fetchData(localStorage.getItem("adminKey"), true)}
                                    variant="outlined"
                                >
                                    Refresh
                                </Button>
                            </Box>
                            <div style={{ height: 600, width: '100%' }}>
                                <DataGrid
                                    rows={submissions.map((s, i) => ({ id: s._id || i, ...s }))}
                                    columns={submissionColumns}
                                    pageSize={10}
                                    rowsPerPageOptions={[10, 25, 50]}
                                    disableSelectionOnClick
                                    sx={{
                                        '& .MuiDataGrid-columnHeaders': {
                                            fontWeight: 'bold',
                                        },
                                    }}
                                />
                            </div>
                        </Box>
                    )}
                </div>

                {/* TAB 3: PARTICIPANTS */}
                <div role="tabpanel" hidden={tabValue !== 3}>
                    {tabValue === 3 && (
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                                <ToggleButtonGroup
                                    value={participantFilter}
                                    exclusive
                                    onChange={(e, newAlignment) => {
                                        if (newAlignment !== null) {
                                            setParticipantFilter(newAlignment);
                                        }
                                    }}
                                    aria-label="participant filter"
                                    size="small"
                                >
                                    <ToggleButton value="all" aria-label="all">
                                        All
                                    </ToggleButton>
                                    <ToggleButton value="not_submitted" aria-label="artists left to draw">
                                        Artists Left to Draw
                                    </ToggleButton>
                                    <ToggleButton value="not_received" aria-label="recipients left to receive">
                                        Recipients Left to Receive
                                    </ToggleButton>
                                </ToggleButtonGroup>

                                <Box sx={{ flexGrow: 1 }} />
                                <Button
                                    startIcon={<RefreshIcon />}
                                    onClick={() => fetchData(localStorage.getItem("adminKey"), true)}
                                    variant="outlined"
                                >
                                    Refresh
                                </Button>
                            </Box>
                            <div style={{ height: 600, width: '100%' }}>
                                <DataGrid
                                    rows={filteredParticipants}
                                    columns={participantColumns}
                                    pageSize={25}
                                    rowsPerPageOptions={[25, 50, 100]}
                                    disableSelectionOnClick
                                    sx={{
                                        '& .MuiDataGrid-columnHeaders': {
                                            fontWeight: 'bold',
                                        },
                                    }}
                                />
                            </div>
                        </Box>
                    )}
                </div>
            </Paper>

            {/* DIRECTORY MODAL */}
            <Modal
                open={directoryModalOpen}
                onClose={() => setDirectoryModalOpen(false)}
                aria-labelledby="directory-modal-title"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 800,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}>
                    <Typography id="directory-modal-title" variant="h6" component="h2" gutterBottom>
                        Generated Directory BBCode
                    </Typography>
                    <TextField
                        multiline
                        fullWidth
                        rows={20}
                        value={generatedDirectory}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={handleCopyAndOpen} variant="contained" color="primary" sx={{ mr: 1 }}>
                            Copy & Open Thread
                        </Button>
                        <Button onClick={() => setDirectoryModalOpen(false)}>Close</Button>
                    </Box>
                </Box>
            </Modal>

            {/* MATCH DETAILS MODAL */}
            <Modal
                open={!!selectedMatch}
                onClose={() => setSelectedMatch(null)}
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 600,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}>
                    {selectedMatch && (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Match Details
                            </Typography>
                            <Typography><strong>Santa:</strong> {selectedMatch.santa.username}</Typography>
                            <Typography><strong>Recipient:</strong> {selectedMatch.recipient.username}</Typography>
                            <Typography><strong>Score:</strong> {selectedMatch.score.toFixed(2)}</Typography>

                            <Typography><strong>Pass:</strong> {selectedMatch.pass}</Typography>

                            <Paper variant="outlined" sx={{ p: 2, mt: 2, mb: 2 }}>
                                <Typography variant="subtitle1" gutterBottom><strong>Santa's Preferences</strong></Typography>
                                <Box sx={{ mb: 1 }}>
                                    <Typography variant="caption" color="primary">Prefer:</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selectedMatch.santa.prefsByTier?.prefer?.map(t => <Chip key={t.id} label={t.name} size="small" color="success" variant="outlined" />) || "None"}
                                    </Box>
                                </Box>
                                <Box sx={{ mb: 1 }}>
                                    <Typography variant="caption" color="text.primary">Willing:</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selectedMatch.santa.prefsByTier?.willing?.map(t => <Chip key={t.id} label={t.name} size="small" sx={{ borderColor: 'text.primary', color: 'text.primary' }} variant="outlined" />) || "None"}
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="error">Banned:</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selectedMatch.santa.prefsByTier?.banned?.map(t => <Chip key={t.id} label={t.name} size="small" color="error" variant="outlined" />) || "None"}
                                    </Box>
                                </Box>
                            </Paper>

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1"><strong>Breakdown:</strong></Typography>
                                {selectedMatch.details?.subjectScores.map((sub, idx) => (
                                    <Box key={idx} sx={{ ml: 2, mb: 2 }}>
                                        <Typography variant="subtitle2" sx={{
                                            fontWeight: 'bold',
                                            color: sub.isBanned ? 'error.main' : 'text.primary',
                                            textDecoration: sub.isBanned ? 'line-through' : 'none'
                                        }}>
                                            {sub.rank ? `${sub.rank}. ` : ''}{sub.name} ({sub.score.toFixed(1)}/100)
                                        </Typography>

                                        {/* Main Tags */}
                                        <Box sx={{ ml: 2, mt: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Main Tags ({sub.breakdown?.mainScore.toFixed(1)}/{sub.breakdown?.mainMax})
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {sub.breakdown?.main?.map((tag, i) => (
                                                    <Typography key={i} variant="body2" sx={{
                                                        color: tag.type === 'Banned' ? 'error.main' : (sub.isBanned ? 'text.disabled' : (tag.type === 'Prefer' ? 'success.main' : (tag.type === 'Willing' ? 'text.primary' : 'text.disabled'))),
                                                        fontWeight: (tag.type === 'Banned' || tag.type === 'Prefer' || tag.type === 'Willing') ? 'bold' : 'normal',
                                                        textDecoration: (tag.type === 'Banned' || tag.type === 'None' || sub.isBanned) ? 'line-through' : 'none'
                                                    }}>
                                                        {tag.name}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        </Box>

                                        {/* Optional Tags */}
                                        {sub.breakdown?.optional?.length > 0 && (
                                            <Box sx={{ ml: 2, mt: 1 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Optional Tags ({sub.breakdown?.optScore.toFixed(1)}/{sub.breakdown?.optMax})
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {sub.breakdown?.optional?.map((tag, i) => (
                                                        <Typography key={i} variant="body2" sx={{
                                                            color: tag.type === 'Banned' ? 'error.main' : (sub.isBanned ? 'text.disabled' : (tag.type === 'Prefer' ? 'success.main' : (tag.type === 'Willing' ? 'text.primary' : 'text.disabled'))),
                                                            fontWeight: (tag.type === 'Banned' || tag.type === 'Prefer' || tag.type === 'Willing') ? 'bold' : 'normal',
                                                            textDecoration: (tag.type === 'Banned' || tag.type === 'None' || sub.isBanned) ? 'line-through' : 'none'
                                                        }}>
                                                            {tag.name}
                                                        </Typography>
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                            </Box>

                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button onClick={() => setSelectedMatch(null)}>Close</Button>
                            </Box>
                        </>
                    )}
                </Box>
            </Modal>

            {/* SUBMISSION DETAILS MODAL */}
            <Dialog
                open={!!selectedSubmission}
                onClose={() => setSelectedSubmission(null)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Submission Details</DialogTitle>
                <DialogContent>
                    {selectedSubmission && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <Box sx={{ height: 500, bgcolor: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
                                <ImageCarousel
                                    images={[selectedSubmission.imageUrl, ...(selectedSubmission.altLinks || [])].filter(Boolean)}
                                    selectedIndex={carouselIndex}
                                    onIndexChange={setCarouselIndex}
                                />
                            </Box>
                            <TextField
                                fullWidth
                                label="Current Image URL"
                                value={[selectedSubmission.imageUrl, ...(selectedSubmission.altLinks || [])].filter(Boolean)[carouselIndex] || ""}
                                InputProps={{ readOnly: true }}
                                variant="filled"
                                size="small"
                            />

                            <Box>
                                <Typography variant="subtitle2">Message:</Typography>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa' }}>
                                    <Typography style={{ whiteSpace: 'pre-wrap' }}>{selectedSubmission.message || "None"}</Typography>
                                </Paper>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2">Tags:</Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                    {selectedSubmission.tags && selectedSubmission.tags.map((t, i) => {
                                        const label = typeof t === 'string' ? t : t.name;
                                        return <Chip key={i} label={label} size="small" />;
                                    })}
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedSubmission(null)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* NOTE DETAILS MODAL */}
            <Dialog
                open={!!selectedNote}
                onClose={() => setSelectedNote(null)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Note to Staff</DialogTitle>
                <DialogContent>
                    <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: '#fff3e0' }}>
                        <Typography style={{ whiteSpace: 'pre-wrap' }}>{selectedNote}</Typography>
                    </Paper>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedNote(null)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* SIGNUP DETAILS MODAL */}
            <Dialog open={signupModalOpen} onClose={handleCloseSignupModal} maxWidth="md" fullWidth>
                <DialogTitle>Signup Details: {selectedSignup?.username}</DialogTitle>
                <DialogContent>
                    {selectedSignup && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>General Info</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}><Typography><strong>User ID:</strong> {selectedSignup.userId}</Typography></Grid>
                                    <Grid item xs={6}><Typography><strong>Tier:</strong> {selectedSignup.highTier ? 'A' : 'B'}</Typography></Grid>
                                    <Grid item xs={6}><Typography><strong>Backup Santa:</strong> {selectedSignup.backupSanta ? 'Yes' : 'No'}</Typography></Grid>
                                    <Grid item xs={6}><Typography><strong>No Ranking:</strong> {selectedSignup.noRanking ? 'Yes' : 'No'}</Typography></Grid>
                                    <Grid item xs={12}>
                                        <Typography><strong>Forum Post:</strong> <a href={selectedSignup.postUrl} target="_blank" rel="noopener noreferrer">Link</a></Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography><strong>Additional Info:</strong> {selectedSignup.additionalInfo || 'None'}</Typography>
                                    </Grid>
                                </Grid>
                            </Paper>

                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>Drawing Preferences</Typography>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="primary">Prefer:</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selectedSignup.prefsByTier?.prefer?.map(t => <Chip key={t.id} label={t.name} size="small" color="primary" variant="outlined" />) || "None"}
                                    </Box>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="success.main">Willing:</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selectedSignup.prefsByTier?.willing?.map(t => <Chip key={t.id} label={t.name} size="small" color="success" variant="outlined" />) || "None"}
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="error">Banned:</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selectedSignup.prefsByTier?.banned?.map(t => <Chip key={t.id} label={t.name} size="small" color="error" variant="outlined" />) || "None"}
                                    </Box>
                                </Box>
                            </Paper>

                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>Subjects ({selectedSignup.subjects?.length || 0})</Typography>
                                {selectedSignup.subjects?.map((subject, idx) => (
                                    <Box key={idx} sx={{ mb: 2, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={3}>
                                                {subject.imageUrl && (
                                                    <img
                                                        src={subject.imageUrl}
                                                        alt={subject.name}
                                                        style={{ width: '100%', height: 'auto', borderRadius: 4, maxHeight: 150, objectFit: 'cover' }}
                                                    />
                                                )}
                                            </Grid>
                                            <Grid item xs={12} sm={9}>
                                                <Typography variant="subtitle1"><strong>{subject.name}</strong></Typography>
                                                <Typography variant="body2" color="text.secondary" paragraph>{subject.info}</Typography>
                                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                    {subject.mainTags?.map(t => <Chip key={t.id} label={t.name} size="small" />)}
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                ))}
                            </Paper>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSignupModal}>Close</Button>
                </DialogActions>
            </Dialog >

            {/* Tag Editor Modal */}
            < Dialog open={tagModalOpen} onClose={handleCloseTagModal} maxWidth="sm" fullWidth >
                <DialogTitle>{currentTag?.id ? "Edit Tag" : "New Tag"}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Name"
                            value={currentTag?.name || ""}
                            onChange={(e) => setCurrentTag({ ...currentTag, name: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="ID (Unique)"
                            value={currentTag?.id || ""}
                            onChange={(e) => setCurrentTag({ ...currentTag, id: e.target.value })}
                            fullWidth
                            helperText="Must be unique, lowercase, no spaces (e.g., 'fr_dragon')"
                        />
                        <TextField
                            label="Description"
                            value={currentTag?.description || ""}
                            onChange={(e) => setCurrentTag({ ...currentTag, description: e.target.value })}
                            fullWidth
                            multiline
                            rows={3}
                        />
                        <TextField
                            label="Example Image URL"
                            value={currentTag?.exampleImageUrl || ""}
                            onChange={(e) => setCurrentTag({ ...currentTag, exampleImageUrl: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Image Credit"
                            value={currentTag?.imageCredit || ""}
                            onChange={(e) => setCurrentTag({ ...currentTag, imageCredit: e.target.value })}
                            fullWidth
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={currentTag?.required || false}
                                    onChange={(e) => setCurrentTag({ ...currentTag, required: e.target.checked })}
                                />
                            }
                            label="Required Tag (Users must select at least one required tag)"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    {currentTag?.id && (
                        <Button onClick={() => handleDeleteTag(currentTag.id)} color="error" startIcon={<DeleteIcon />}>
                            Delete
                        </Button>
                    )}
                    <Button onClick={handleCloseTagModal}>Cancel</Button>
                    <Button onClick={handleSaveTag} variant="contained" color="primary">
                        Save Tag
                    </Button>
                </DialogActions>
            </Dialog >
        </Container >
    );
}
