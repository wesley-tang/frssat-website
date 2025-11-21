import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

import SubjectModal from "../../components/subjectmodal";
import { SubjectCard } from "../../components/subjectcard";

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Card from '@mui/material/Card';
import { CardActionArea } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { useActiveEventContext } from "../../context/EventContext";
import { useSignupContext } from "../../context/SignupContext";

import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragOverlay,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	horizontalListSortingStrategy,
	verticalListSortingStrategy,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableSubjectCard({ subject, index, ...props }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({ id: subject.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: props.isDragging ? 0 : 1,
	};

	return (
		<div ref={setNodeRef} style={style}>
			<SubjectCard
				subject={subject}
				index={index}
				{...props}
				dragHandleProps={{ ...attributes, ...listeners }}
			/>
		</div>
	);
}

export function Subjects() {
	const { state, dispatch } = useSignupContext();
	const { subjects, noRanking } = state;

	const [editing, setEditing] = useState(false);
	const { activeEvent, config } = useActiveEventContext();
	const [usableTags, setUsableTags] = useState(activeEvent.tags);
	const theme = useTheme();
	const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));

	const [subjectName, setSubjectName] = useState("");
	const [subjectImageUrl, setSubjectImageUrl] = useState("");
	const [subjectMainTags, setSubjectMainTags] = useState([]);
	const [subjectOptionalTags, setSubjectOptionalTags] = useState([]);
	const [subjectInfo, setSubjectInfo] = useState("");
	const [subjectHasImage, setSubjectHasImage] = useState(false);
	const [subjectPosition, setSubjectPosition] = useState(-1);
	const [subjectId, setSubjectId] = useState(null);
	const [draggedId, setDraggedId] = useState(null);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	useEffect(() => {
		if (activeEvent && activeEvent.tags) {
			setUsableTags(activeEvent.tags);
		}
	}, [activeEvent]);

	const updateSubjectsState = (newSubjects, newNoRanking) => {
		dispatch({
			type: "UPDATE_SUBJECTS",
			payload: {
				subjects: newSubjects !== undefined ? newSubjects : subjects,
				noRanking: newNoRanking !== undefined ? newNoRanking : noRanking
			}
		});
	};

	const handleDragStart = (event) => {
		setDraggedId(event.active.id);
	};

	const handleDragEnd = (event) => {
		const { active, over } = event;
		setDraggedId(null);

		if (active.id !== over.id) {
			const oldIndex = subjects.findIndex((item) => item.id === active.id);
			const newIndex = subjects.findIndex((item) => item.id === over.id);

			const newItems = arrayMove(subjects, oldIndex, newIndex);
			// Update positions in the objects themselves if needed
			const updatedItems = newItems.map((item, index) => ({ ...item, position: index }));

			updateSubjectsState(updatedItems, undefined);
		}
	};

	const handleChange = () => {
		const newNoRanking = !noRanking;
		updateSubjectsState(undefined, newNoRanking);
	};

	const updateNameInput = (event) => {
		setSubjectName(event.target.value);
	};

	const updateImageUrlInput = (event) => {
		const url = event.target.value;
		setSubjectImageUrl(url);
		setSubjectHasImage(url.endsWith("png") || url.endsWith("jpg") || url.endsWith("gif"));
	};

	const updateInfoInput = (event) => {
		setSubjectInfo(event.target.value);
	};

	const openModal = () => {
		setEditing(true);
		resetCurrentSubject();
	};

	const openForEditing = (subject) => {
		// Filter usable tags
		const baseTags = activeEvent.tags;

		// Calculate currently used tags (from both main and optional) to filter out
		const currentTags = [...(subject.mainTags || subject.tags || []), ...(subject.optionalTags || [])];

		let remainingTags = baseTags.filter(x => {
			for (const tag of currentTags) {
				if (tag.id === x.id) {
					return false;
				}
			}
			return true;
		});

		setEditing(true);
		setUsableTags(remainingTags);
		setSubjectName(subject.name);

		// Migration Logic
		if (subject.mainTags) {
			setSubjectMainTags(subject.mainTags);
			setSubjectOptionalTags(subject.optionalTags || []);
		} else {
			// Legacy: Move all to Main
			setSubjectMainTags(subject.tags || []);
			setSubjectOptionalTags([]);
		}

		setSubjectImageUrl(subject.imageUrl);
		setSubjectInfo(subject.info);
		setSubjectPosition(subject.position); // Keep track of original position/index
		setSubjectId(subject.id);
		setSubjectHasImage(subject.imageUrl ? subject.imageUrl.endsWith("png") || subject.imageUrl.endsWith("jpg") || subject.imageUrl.endsWith("gif") : false);
	};

	const handleClose = () => {
		setEditing(false);
		resetCurrentSubject();
	};

	const handleSave = () => {
		let newCard = {
			id: subjectId || uuidv4(),
			name: subjectName,
			imageUrl: subjectImageUrl ? subjectImageUrl : undefined,
			mainTags: subjectMainTags,
			optionalTags: subjectOptionalTags,
			info: subjectInfo,
			position: subjects.length // Default to end
		};

		let updatedSubjects;
		if (subjectPosition !== -1) {
			// Editing existing
			newCard = { ...newCard, position: subjectPosition };
			updatedSubjects = [...subjects];
			updatedSubjects[subjectPosition] = newCard;
		} else {
			// Adding new
			updatedSubjects = subjects.concat(newCard);
		}

		// Recalculate positions just in case
		updatedSubjects = updatedSubjects.map((s, i) => ({ ...s, position: i }));

		updateSubjectsState(updatedSubjects, undefined);
		handleClose();
	};

	const handleDelete = () => {
		if (subjectPosition !== -1) {
			const newSubjects = [...subjects];
			newSubjects.splice(subjectPosition, 1);
			// Update positions
			const updatedSubjects = newSubjects.map((s, i) => ({ ...s, position: i }));

			updateSubjectsState(updatedSubjects, undefined);
		}
		handleClose();
	};

	const updateMainTags = (e, newValues) => {
		// Re-derive usable tags based on selection
		const baseTags = activeEvent.tags;
		// Combine current selections from both boxes
		const currentSelected = [...newValues, ...subjectOptionalTags];
		const newUsable = baseTags.filter(tag => !currentSelected.some(s => s.id === tag.id));

		setUsableTags(newUsable);
		setSubjectMainTags(newValues);
	};

	const updateOptionalTags = (e, newValues) => {
		// Re-derive usable tags based on selection
		const baseTags = activeEvent.tags;
		// Combine current selections from both boxes
		const currentSelected = [...subjectMainTags, ...newValues];
		const newUsable = baseTags.filter(tag => !currentSelected.some(s => s.id === tag.id));

		setUsableTags(newUsable);
		setSubjectOptionalTags(newValues);
	};

	const resetCurrentSubject = () => {
		const baseTags = activeEvent.tags;
		setUsableTags(baseTags);
		setSubjectName("");
		setSubjectMainTags([]);
		setSubjectOptionalTags([]);
		setSubjectImageUrl("");
		setSubjectInfo("");
		setSubjectPosition(-1);
		setSubjectHasImage(false);
		setSubjectId(null);
	};

	return (
		<div className="subjectsPage">
			<SubjectModal
				editing={editing}
				usableTags={usableTags}
				name={subjectName}
				imageUrl={subjectImageUrl}
				mainTags={subjectMainTags}
				optionalTags={subjectOptionalTags}
				info={subjectInfo}
				hasImage={subjectHasImage}
				hideModal={handleClose}
				updateNameInput={updateNameInput}
				updateImageUrlInput={updateImageUrlInput}
				updateMainTags={updateMainTags}
				updateOptionalTags={updateOptionalTags}
				updateInfoInput={updateInfoInput}
				handleSave={handleSave}
				handleDelete={handleDelete}
			/>
			<div className="container-fluid" style={{ maxWidth: '970px' }}>
				<h1><strong>ADD THE SUBJECTS YOU WANT DRAWN</strong></h1>
			</div>
			<div className="container-fluid" style={{ maxWidth: '970px' }}>
				<div className="row justify-content-center" style={{ padding: '2%' }}>
					<p align="left">
						Please fill in the subjects that you wish to have drawn for this event.
						<strong> Drag and drop the cards to reorder them</strong>, from <strong>1 being your most
							wanted to {config.maxSubjects} being your least</strong>. You can disable ranking if you don't care or have no
						preference for which subject you want drawn. You may have up to {config.maxSubjects} subjects.
					</p>
					<p align="center" style={{ marginTop: '5%', marginBottom: '0%' }}>
						Tap on a card to edit it!
					</p>
				</div>
			</div>
			<div className="container-fluid">
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragStart={handleDragStart}
					onDragEnd={handleDragEnd}
				>
					<Stack
						direction={{ xs: 'column', lg: 'row' }}
						spacing={{ xs: 2 }}
						justifyContent="center"
						alignItems={{ xs: 'center', lg: 'flex-end' }}
					>
						<SortableContext
							items={subjects.map(s => s.id)}
							strategy={isLgUp ? horizontalListSortingStrategy : verticalListSortingStrategy}
						>
							{subjects.map((subject, index) => (
								<SortableSubjectCard
									key={subject.id}
									subject={subject}
									index={index}
									noRanking={noRanking}
									numOfCards={subjects.length}
									openForEditing={() => openForEditing(subject)}
									isDragging={draggedId === subject.id}
								/>
							))}
						</SortableContext>

						{subjects.length < config.maxSubjects && (
							<Card sx={{ minWidth: 150, maxWidth: 225, minHeight: 200 }}>
								<CardActionArea
									sx={{ minWidth: 150, maxWidth: 225, minHeight: 200, height: '100%' }}
									onClick={openModal}
								>
									<CardContent>
										<AddCircleOutlineIcon sx={{ fontSize: 50 }} />
										<Typography variant="body2" color="text.secondary">
											Add a Subject
										</Typography>
									</CardContent>
								</CardActionArea>
							</Card>
						)}
					</Stack>
					<DragOverlay>
						{draggedId ? (
							<SubjectCard
								subject={subjects.find(s => s.id === draggedId)}
								index={subjects.findIndex(s => s.id === draggedId)}
								noRanking={noRanking}
								numOfCards={subjects.length}
							/>
						) : null}
					</DragOverlay>
				</DndContext>
			</div>

			<div className="container-fluid" style={{ maxWidth: '970px' }}>
				<div className="row justify-content-center" style={{ maxWidth: 970 + 'px' }}>
					<FormGroup>
						<FormControlLabel control={<Checkbox onChange={event => handleChange(event)}
							checked={noRanking} />}
							label="Disable ranking/No preferences" />
					</FormGroup>
				</div>
			</div>
		</div>
	);
}
