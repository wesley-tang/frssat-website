import React, { useEffect, useState, useCallback } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { DataGrid } from '@mui/x-data-grid';
import {
    Button, Chip, TextField, Paper, Typography, Box, Grid,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    FormControlLabel, Checkbox
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [signups, setSignups] = useState([]);
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
    const [directoryText, setDirectoryText] = useState("");

    const fetchData = useCallback((adminKey) => {
        setLoading(true);
        axios.get('/api/admin/data', {
            headers: { 'x-admin-key': adminKey }
        })
            .then(response => {
                setSignups(response.data.signups);
                setActiveEvent(response.data.activeEvent);
                setEventForm(response.data.activeEvent);
                setTitleEditValue(response.data.activeEvent.title);
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

    const handleDryRun = () => {
        const adminKey = localStorage.getItem("adminKey");
        axios.post('/api/admin/match/dry-run', {}, {
            headers: { 'x-admin-key': adminKey }
        })
            .then(response => {
                alert("Dry run triggered (check console/network for now)");
                console.log(response.data);
            })
            .catch(error => {
                console.error("Error triggering dry run:", error);
                alert("Failed to trigger dry run");
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

        setDirectoryText(output);
        setDirectoryModalOpen(true);
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
        { field: 'id', headerName: 'ID', width: 70 },
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
                return (params && params.row && params.row.highTier) ? 'A' : 'B';
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

    const rows = signups.map((s, index) => ({
        id: index + 1,
        ...s
    }));

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container" style={{ paddingTop: '20px', paddingBottom: '50px' }}>

            {/* Header Section: Title, ID, Status */}
            {activeEvent && (
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
                                    <IconButton color="success" onClick={handleSaveTitle}><CheckIcon /></IconButton>
                                    <IconButton color="error" onClick={handleCancelTitleEdit}><CancelIcon /></IconButton>
                                </>
                            ) : (
                                <>
                                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                        {activeEvent.title}
                                    </Typography>
                                    <IconButton size="small" onClick={() => setIsEditingTitle(true)}><EditIcon /></IconButton>
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
                    </Box>
                </Paper>
            )}

            {/* Event Info Section */}
            {activeEvent && (
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
            )}

            {/* Tag Management Section */}
            {activeEvent && (
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
            )}

            {/* Tools Section */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>Tools</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="contained" color="secondary" onClick={handleDryRun}>
                        Run Matching Dry Run
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleGenerateDirectory}>
                        Generate Directory
                    </Button>
                </Box>
            </Paper>

            {/* Signups Grid */}
            <Paper elevation={3} sx={{ height: 600, width: '100%', p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h5" gutterBottom>Signups ({signups.length})</Typography>
                    <Button
                        startIcon={<RefreshIcon />}
                        onClick={() => fetchData(localStorage.getItem("adminKey"))}
                        variant="outlined"
                    >
                        Refresh
                    </Button>
                </Box>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 20, 50]}
                    checkboxSelection
                    disableSelectionOnClick
                />
            </Paper>

            {/* Tag Editor Modal */}
            <Dialog open={tagModalOpen} onClose={handleCloseTagModal} maxWidth="sm" fullWidth>
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
            </Dialog>

            {/* Signup Detail Modal */}
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
            </Dialog>

            {/* Directory Modal */}
            <Dialog open={directoryModalOpen} onClose={() => setDirectoryModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Directory Output</DialogTitle>
                <DialogContent>
                    <TextField
                        multiline
                        rows={20}
                        fullWidth
                        value={directoryText}
                        variant="outlined"
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDirectoryModalOpen(false)}>Close</Button>
                    <Button
                        onClick={() => {
                            navigator.clipboard.writeText(directoryText);
                            alert("Copied to clipboard!");
                        }}
                        variant="contained"
                    >
                        Copy to Clipboard
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
