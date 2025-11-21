import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { SignupContextProvider, useSignupContext } from '../../context/SignupContext';
import { Box } from '@mui/material';
import { WizardStepper, WizardButtons } from './WizardNavigation';

// Import Steps
import { Info as AdditionalInfo } from './AdditionalInfo'; // Renamed file, component still Info
import { Preferences } from './preferences';
import { Subjects } from './subjects';
import { Tier } from './tier';
import { Backup } from './backup';
import Finish from './finish';

const steps = [
    { path: 'preferences', label: 'Preferences', component: Preferences },
    { path: 'subjects', label: 'Subjects', component: Subjects },
    { path: 'tier', label: 'Tier', component: Tier },
    { path: 'backup', label: 'Backup Santa', component: Backup },
    { path: 'additional-info', label: 'Additional Info', component: AdditionalInfo },
    { path: 'finish', label: 'Finish', component: Finish }
];

const SignupWizardContent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { validation } = useSignupContext();

    // Determine active step based on URL
    const getCurrentStepIndex = () => {
        const path = location.pathname.split('/').pop();
        const index = steps.findIndex(step => step.path === path);
        return index === -1 ? 0 : index;
    };

    const activeStep = getCurrentStepIndex();

    // Validation Check
    const getStepValidation = (index) => {
        // Map step index to validation rules
        // This logic couples the wizard to specific steps, but we can keep it clean.
        const stepPath = steps[index]?.path;
        if (stepPath === 'preferences') return validation.errors.preferences;
        if (stepPath === 'subjects') return validation.errors.subjects;
        return null;
    };

    const currentError = getStepValidation(activeStep);
    const isNextDisabled = !!currentError;

    const handleNext = () => {
        if (activeStep < steps.length - 1) {
            navigate(`/signup/${steps[activeStep + 1].path}`);
        }
    };

    const handleBack = () => {
        if (activeStep > 0) {
            navigate(`/signup/${steps[activeStep - 1].path}`);
        } else {
            navigate('/');
        }
    };

    // Redirect to first step if at root /signup
    useEffect(() => {
        if (location.pathname === '/signup' || location.pathname === '/signup/') {
            navigate(`/signup/${steps[0].path}`, { replace: true });
        }
    }, [location, navigate]);

    const [maxReachedStep, setMaxReachedStep] = React.useState(0);

    useEffect(() => {
        if (activeStep > maxReachedStep) {
            setMaxReachedStep(activeStep);
        }
    }, [activeStep, maxReachedStep]);

    const isStepDisabled = (index) => {
        // Disable if trying to go forward when current step is invalid
        if (index > activeStep && isNextDisabled) return true;
        // Disable if trying to jump ahead of max reached step
        if (index > maxReachedStep) return true;
        return false;
    };

    const handleStepClick = (index) => {
        if (!isStepDisabled(index)) {
            navigate(`/signup/${steps[index].path}`);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <WizardStepper
                steps={steps}
                activeStep={activeStep}
                handleStepClick={handleStepClick}
                isStepDisabled={isStepDisabled}
                isNextDisabled={isNextDisabled}
            />

            <Box sx={{ flexGrow: 1 }}>
                <Routes>
                    {steps.map(step => (
                        <Route key={step.path} path={step.path} element={<step.component />} />
                    ))}
                    <Route path="*" element={<Navigate to={`/signup/${steps[0].path}`} replace />} />
                </Routes>
            </Box>

            <WizardButtons
                steps={steps}
                activeStep={activeStep}
                handleBack={handleBack}
                handleNext={handleNext}
                isNextDisabled={isNextDisabled}
                nextTooltip={currentError}
                isFinishStep={steps[activeStep].path === 'finish'}
            />
        </Box>
    );
};

export const SignupWizard = () => {
    return (
        <SignupContextProvider>
            <SignupWizardContent />
        </SignupContextProvider>
    );
};
