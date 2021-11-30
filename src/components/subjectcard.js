import { Component } from "react";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

export class SubjectCard extends Component {
    renderImage() {
        if (this.props.subject.imageUrl !== undefined && (this.props.subject.imageUrl.endsWith("png") || this.props.subject.imageUrl.endsWith("jpg"))) {
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
        if (this.props.subject.imageUrl !== undefined && (this.props.subject.imageUrl.endsWith("png") || this.props.subject.imageUrl.endsWith("jpg") || this.props.subject.imageUrl.endsWith("gift"))) {
            return null;
        }
        return (
            <Typography variant="body2" color="text.secondary">
                {this.props.subject.info}
            </Typography>
        );
    }

    getSx() {
        if (this.props.subject.imageUrl === undefined || !(this.props.subject.imageUrl.endsWith("png") || this.props.subject.imageUrl.endsWith("jpg") || this.props.subject.imageUrl.endsWith("gift"))) {
            return { sx: { height: (this.props.noRanking ? 100 : 70) + '%' } }
        }
    }

    getChips() {
        let chips = [];

        this.props.subject.tags.forEach(tag => {
            chips.push(
                <Chip label={tag.name} size="small" />
            )
        });

        return chips;
    }

    renderRanker() {
        if (this.props.noRanking) {
            return null;
        }

        return (
            <CardActions>
                <div className="container">
                    <div className="row">
                        <div className="col d-flex justify-content-start">
                            <IconButton disabled={this.props.subject.position === 0} onClick={this.props.handleUpvoteClick}>
                                <ArrowCircleUpIcon fontSize="large" color={this.props.subject.position === 0 ? "disabled" : "primary"} />
                            </IconButton>
                        </div>
                        <Typography gutterBottom variant="h5" component="div">
                            {this.getOrdinal(this.props.subject.position)}
                        </Typography>
                        <div className="col d-flex justify-content-end">
                            <IconButton disabled={this.props.subject.position === this.props.numOfCards - 1} onClick={this.props.handleDownvoteClick}>
                                <ArrowCircleDownIcon fontSize="large" color={this.props.subject.position === this.props.subject.numOfCards - 1 ? "warning" : "inherit"} />
                            </IconButton>
                        </div>
                    </div>
                </div>
            </CardActions>
        )
    }

    getOrdinal(n) {
        n += 1;
        let s = ["th", "st", "nd", "rd"];
        let v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    render() {
        return (
            <Card sx={{ width: 225, minHeight: 200 }}>
                <CardActionArea {...this.getSx()} onClick={this.props.openForEditing}>
                    {this.renderImage()}
                    <CardContent >
                        <Typography gutterBottom variant="h5" component="div">
                            {this.props.subject.name}
                        </Typography>
                        <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: 150 }}>
                            {this.renderDescription()}
                        </p>
                        <Stack spacing={1}>
                            {this.getChips()}
                        </Stack>
                    </CardContent>
                </CardActionArea>
                {this.renderRanker()}
            </Card>
        );
    }
}