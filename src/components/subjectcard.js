import { Component } from "react";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import DragHandleIcon from '@mui/icons-material/DragHandle';

export class SubjectCard extends Component {
	renderImage() {
		if (this.props.subject.imageUrl !== undefined && (this.props.subject.imageUrl.endsWith("png") || this.props.subject.imageUrl.endsWith("jpg") || this.props.subject.imageUrl.endsWith("gif"))) {
			return (
				<CardMedia
					component="img"
					alt="subject image"
					height="140"
					image={this.props.subject.imageUrl}
				/>
			);
		}
		return null;
	}

	renderDescription() {
		if (this.props.subject.imageUrl !== undefined && (this.props.subject.imageUrl.endsWith("png") || this.props.subject.imageUrl.endsWith("jpg") || this.props.subject.imageUrl.endsWith("gif"))) {
			return null;
		}
		return (
			<Typography variant="body2" color="text.secondary" sx={{ marginBottom: '8px' }}>
				{this.props.subject.info}
			</Typography>
		);
	}

	getSx() {
		if (this.props.subject.imageUrl === undefined || !(this.props.subject.imageUrl.endsWith("png") || this.props.subject.imageUrl.endsWith("jpg") || this.props.subject.imageUrl.endsWith("gif"))) {
			return { sx: { height: (this.props.noRanking ? 100 : 70) + '%' } }
		}
	}

	getChips() {
		if (!this.props.subject.mainTags) {
			return (
				<Typography variant="body2" sx={{ color: 'error.main', fontWeight: 'bold' }}>
					Tags need update! Tap to fix.
				</Typography>
			);
		}

		let chips = [];
		const mainTags = this.props.subject.mainTags || [];
		const optionalTags = this.props.subject.optionalTags || [];
		const allTags = [...mainTags.map(t => ({ ...t, type: 'main' })), ...optionalTags.map(t => ({ ...t, type: 'optional' }))];

		allTags.forEach((tag, index) => {
			chips.push(
				<Chip
					key={index}
					label={tag.name.replace(/\s/g, '').substring(0, 3)}
					size="small"
					variant={tag.type === 'main' ? "filled" : "outlined"}
					sx={{
						fontWeight: tag.required ? '600' : 'normal',
						backgroundColor: tag.type === 'main' ? '#bdbdbd' : undefined
					}}
				/>
			)
		});

		return (
			<div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', marginBottom: '-8px' }}>
				{chips}
			</div>
		);
	}

	getOrdinal(n) {
		n += 1;
		let s = ["th", "st", "nd", "rd"];
		let v = n % 100;
		const suffix = (s[(v - 20) % 10] || s[v] || s[0]);
		return (
			<span>
				{n}<sup>{suffix}</sup>
			</span>
		);
	}

	renderRanker() {
		if (this.props.noRanking) {
			return null;
		}

		return (
			<CardActions
				disableSpacing
				{...this.props.dragHandleProps}
				sx={{
					justifyContent: 'center',
					padding: '8px',
					backgroundColor: '#f5f5f5',
					cursor: 'grab',
					borderTop: '1px solid #e0e0e0',
					'&:active': { cursor: 'grabbing' }
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'text.secondary' }}>
					<DragHandleIcon color="action" />
					<Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'baseline' }}>
						{this.getOrdinal(this.props.subject.position)}
					</Typography>
					<DragHandleIcon color="action" />
				</div>
			</CardActions>
		)
	}

	render() {
		return (
			<Card sx={{ width: 225, minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
				<CardActionArea {...this.getSx()} onClick={this.props.openForEditing}>
					{this.renderImage()}
					< CardContent >
						<Typography gutterBottom variant="h5" component="div" style={{ hyphens: 'auto', overflowWrap: 'break-word' }}>
							{this.props.subject.name}
						</Typography>
						<p style={{
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							display: '-webkit-box',
							WebkitLineClamp: '5',
							WebkitBoxOrient: 'vertical'
						}}>
							{this.renderDescription()}
						</p>
						{this.getChips()}
					</CardContent >
				</CardActionArea >
				{this.renderRanker()}
			</Card >
		);
	}
}