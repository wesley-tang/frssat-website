import * as React from 'react';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

export default function AutocompleteInput(props) {
    return (
        <div className="autoCompleteBox" style={{ width: 90 + '%' }}>
            <Autocomplete
                multiple
                autoHighlight
                id="tags-filled"
                options={props.tags}
                getOptionLabel={(option) => option.name}
                {...props.autocomplPropPassThru || {}}
                onChange={props.updateTags}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                            variant="outlined"
                            label={option.name}
                            {...getTagProps({ index })}
                            {...props.chipPropPassThru || {}}
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="filled"
                        label={props.title}
                        placeholder="Preference Tag"
                    />
                )}
            />
        </div>
    );
}
