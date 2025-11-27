import React from 'react';
import Box from "@mui/material/Box";
import IconButton from '@mui/material/IconButton';
import Stack from "@mui/material/Stack";

export default function ImageCarousel({ images, selectedIndex, onIndexChange }) {
    if (!images || images.length === 0) {
        return null;
    }

    const handlePrev = () => {
        const totalImages = images.length;
        const newIndex = (selectedIndex - 1 + totalImages) % totalImages;
        onIndexChange(newIndex);
    };

    const handleNext = () => {
        const totalImages = images.length;
        const newIndex = (selectedIndex + 1) % totalImages;
        onIndexChange(newIndex);
    };

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 2, overflow: 'hidden' }}>
            {/* Previous Button */}
            {images.length > 1 && (
                <IconButton
                    onClick={handlePrev}
                    sx={{
                        position: 'absolute',
                        left: 10,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                        zIndex: 10,
                        width: 48,
                        height: 48,
                        borderRadius: '50%'
                    }}
                >
                    <span style={{ fontSize: '1.5rem' }}>&lt;</span>
                </IconButton>
            )}

            {images[selectedIndex] ? (
                <img
                    src={images[selectedIndex]}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    alt={`View ${selectedIndex + 1}`}
                />
            ) : (
                <Box sx={{
                    width: '100%',
                    minHeight: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f0f0f0',
                    color: '#888',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                }}>
                    Add an Image
                </Box>
            )}

            {/* Next Button */}
            {images.length > 1 && (
                <IconButton
                    onClick={handleNext}
                    sx={{
                        position: 'absolute',
                        right: 10,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                        zIndex: 10,
                        width: 48,
                        height: 48,
                        borderRadius: '50%'
                    }}
                >
                    <span style={{ fontSize: '1.5rem' }}>&gt;</span>
                </IconButton>
            )}

            {/* Thumbnails */}
            {images.length > 1 && (
                <Stack direction="row" spacing={2} sx={{
                    position: 'absolute',
                    bottom: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    maxWidth: '90%',
                    overflowX: 'auto',
                    padding: '5px',
                    zIndex: 10,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: '8px'
                }}>
                    {images.map((link, index) => (
                        link ? (
                            <img
                                key={index}
                                src={link}
                                style={{
                                    height: '50px',
                                    cursor: 'pointer',
                                    border: selectedIndex === index ? '2px solid #1976d2' : '2px solid transparent',
                                    borderRadius: '4px',
                                    opacity: selectedIndex === index ? 1 : 0.7
                                }}
                                onClick={() => onIndexChange(index)}
                                alt={`Thumb ${index + 1}`}
                            />
                        ) : (
                            <Box
                                key={index}
                                onClick={() => onIndexChange(index)}
                                sx={{
                                    height: '50px',
                                    width: '50px',
                                    cursor: 'pointer',
                                    border: selectedIndex === index ? '2px solid #1976d2' : '2px solid transparent',
                                    borderRadius: '4px',
                                    opacity: selectedIndex === index ? 1 : 0.7,
                                    backgroundColor: '#ddd',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    color: '#555'
                                }}
                            >
                                New
                            </Box>
                        )
                    ))}
                </Stack>
            )}
        </Box>
    );
}
