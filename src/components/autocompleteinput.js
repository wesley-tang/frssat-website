import * as React from 'react';

import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

export default function AutocompleteInput(props) {
	return (
		<div className="autoCompleteBox" style={{ width: props.width || '90%' }}>
			<Autocomplete
				multiple
				autoHighlight
				id="tags-filled"
				options={props.tags}
				getOptionLabel={(option) => option.name + (option.required ? "*" : "")}
				{...props.autocomplPropPassThru || {}}
				onChange={props.updateTags}
				error
				renderTags={(value, getTagProps) =>
					value.map((option, index) => (
						<Chip
							variant={props.chipVariant || "outlined"}
							// Add hover tooltip or modal prompt in this chip here (would that be too small?)
							label={option.name}
							{...getTagProps({ index })}
							{...props.chipPropPassThru || {}}
							sx={{ fontWeight: (props.boldRequired && option.required) ? '600' : 'normal' }}
						/>
					))
				}
				renderInput={(params) => (
					<TextField
						{...params}
						variant={props.inputVariant || "filled"}
						label={props.title}
						placeholder="Tag name"
					/>
				)}
			/>
		</div>
	);
}
