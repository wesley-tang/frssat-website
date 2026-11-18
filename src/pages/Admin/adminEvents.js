import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import { useActiveEventContext } from '../../context/EventContext';

const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
};

const statusColor = (status) => {
    switch (status) {
        case 'signups_open':
            return 'success';
        case 'setup':
            return 'info';
        case 'signups_closed':
            return 'warning';
        case 'concluded':
            return 'secondary';
        default:
            return 'default';
    }
};

export default function AdminEvents() {
    const navigate = useNavigate();
    const { activeEvent, refreshActiveEvent } = useActiveEventContext();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [creating, setCreating] = useState(false);

    const fetchEvents = useCallback(() => {
        setLoading(true);
        setError('');
        axios.get('/api/events')
            .then(response => {
                setEvents(response.data.events || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch events:', err);
                setError('Failed to load events. Please try again.');
                setLoading(false);
            });
    }, []);

    const handleCreateEvent = () => {
        if (!activeEvent || activeEvent.status !== 'concluded') return;

        if (!window.confirm(`Create a new event based on "${activeEvent.title}"?\n\nIt will start in setup. Dates will be advanced one year and tags will be copied. Thread URLs will start empty.`)) {
            return;
        }

        const adminKey = localStorage.getItem('adminKey');
        setCreating(true);
        axios.post('/api/admin/event/create', {}, {
            headers: { 'x-admin-key': adminKey }
        })
            .then(response => {
                navigate(`/admin/dashboard/${response.data.event._id}`);
            })
            .catch(err => {
                console.error('Failed to create event:', err);
                alert(err.response?.data?.error || 'Failed to create event.');
                setCreating(false);
            });
    };

    useEffect(() => {
        const adminKey = localStorage.getItem('adminKey');
        if (!adminKey) {
            navigate('/admin');
            return;
        }
        fetchEvents();
        refreshActiveEvent().catch(err => {
            console.error('Failed to refresh active event:', err);
        });
    }, [navigate, fetchEvents, refreshActiveEvent]);

    const canCreateEvent = activeEvent?.status === 'concluded';

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            Events
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Select an event to open its dashboard.
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Current event status: {activeEvent?.status || 'unknown'}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={canCreateEvent ? '' : 'The current event must be concluded before a new event can be created.'}>
                            <span>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    disabled={!canCreateEvent || creating}
                                    onClick={handleCreateEvent}
                                >
                                    {creating ? 'Creating...' : 'Create New Event'}
                                </Button>
                            </span>
                        </Tooltip>
                        <Button startIcon={<RefreshIcon />} onClick={fetchEvents} disabled={loading}>
                            Refresh
                        </Button>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : events.length === 0 ? (
                    <Alert severity="info">No events found.</Alert>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Event</TableCell>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Year</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Signups Deadline</TableCell>
                                    <TableCell>End Date</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {events.map(event => {
                                    const isCurrent = activeEvent && activeEvent._id === event._id;
                                    return (
                                        <TableRow key={event._id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="subtitle1">
                                                        {event.title || event._id}
                                                    </Typography>
                                                    {isCurrent && (
                                                        <Chip label="Current" color="primary" size="small" />
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>{event._id}</TableCell>
                                            <TableCell>{event.year || '—'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={(event.status || 'unknown').toUpperCase()}
                                                    color={statusColor(event.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{formatDate(event.signUpDeadLine)}</TableCell>
                                            <TableCell>{formatDate(event.endDate)}</TableCell>
                                            <TableCell align="right">
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<EditIcon />}
                                                    onClick={() => navigate(`/admin/dashboard/${event._id}`)}
                                                >
                                                    Manage
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Container>
    );
}
