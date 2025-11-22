import React from 'react';
import { Stepper, Step, StepLabel, Button, Tooltip, Box } from '@mui/material';

export const WizardStepper = ({ steps, activeStep, handleStepClick, isStepDisabled, isNextDisabled }) => {
    return (
        <Box sx={{ width: '100%', mt: 4, mb: 4 }}>
            <Box sx={{ maxWidth: '970px', margin: '0 auto' }}>
                <Stepper activeStep={activeStep} alternativeLabel nonLinear>
                    {steps.map((step, index) => {
                        const disabled = isStepDisabled ? isStepDisabled(index) : false;
                        return (
                            <Step key={step.label} completed={index < activeStep}>
                                <StepLabel
                                    onClick={() => !disabled && handleStepClick(index)}
                                    sx={{
                                        cursor: disabled ? 'default' : 'pointer',
                                        '& .MuiStepLabel-label': {
                                            color: disabled ? 'text.disabled' : 'inherit'
                                        }
                                    }}
                                    error={index === activeStep && isNextDisabled}
                                >
                                    {step.label}
                                </StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>
            </Box>
        </Box>
    );
};

export const WizardButtons = ({ steps, activeStep, handleBack, handleNext, isNextDisabled, nextTooltip, isFinishStep }) => {
    if (isFinishStep) return null;

    return (
        <Box sx={{ width: '100%', mt: 4, mb: 8 }}>
            <Box sx={{ maxWidth: '970px', margin: '0 auto', px: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Button
                        color="inherit"
                        disabled={false}
                        onClick={handleBack}
                        sx={{ mr: 1 }}
                        variant="outlined"
                    >
                        Back
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />

                    <Tooltip title={isNextDisabled ? nextTooltip : ""} arrow>
                        <span>
                            <Button
                                onClick={handleNext}
                                disabled={isNextDisabled}
                                variant="contained"
                                color="success"
                            >
                                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                            </Button>
                        </span>
                    </Tooltip>
                </Box>
            </Box>
        </Box>
    );
};
