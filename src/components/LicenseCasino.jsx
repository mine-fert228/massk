import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button } from '@mui/material';

const sectorsCount = 24;
const sectorAngle = 360 / sectorsCount; // 5.625 градусов

// Чередуем цвета: 0 - черное, 1 - красное, 2 - черное, ...
const sectors = Array.from({ length: sectorsCount }, (_, i) => ({
    color: i % 2 === 0 ? '#212121' : '#b71c1c',
    label: i % 2 === 0 ? 'Чёрное' : 'Красное',
}));

function playFartSound() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(150, ctx.currentTime);

    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
}

export default function LicenseCasino() {
    const [userChoice, setUserChoice] = useState(null);
    const [result, setResult] = useState(null);
    const [spinning, setSpinning] = useState(false);
    const [message, setMessage] = useState('');
    const [rotation, setRotation] = useState(0);
    const animationRef = useRef(null);

    useEffect(() => {
        if (spinning) {
            let start = null;
            let currentRotation = rotation;

            function animate(timestamp) {
                if (!start) start = timestamp;
                const elapsed = timestamp - start;

                const deceleration = Math.min(elapsed / 4000, 1);
                const speed = (1 - deceleration) * 50;

                currentRotation += speed;
                setRotation(currentRotation);

                if (deceleration < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                } else {
                    // Итоговый сектор, где остановилась рулетка
                    const finalIndex = Math.floor(((currentRotation % 360) / sectorAngle)) % sectorsCount;
                    const finalSector = sectors[finalIndex];
                    setResult(finalSector.label);
                    setSpinning(false);

                    if (userChoice === finalSector.label) {
                        setMessage('Угадал! Звук пердежа! 💨');
                        playFartSound();
                    } else {
                        setMessage('Не угадал, попробуй ещё раз!');
                    }
                }
            }

            animationRef.current = requestAnimationFrame(animate);

            return () => cancelAnimationFrame(animationRef.current);
        }
    }, [spinning]);

    const startSpin = (choice) => {
        if (spinning) return;

        setUserChoice(choice);
        setResult(null);
        setMessage('');
        setSpinning(true);
    };

    // Создаем фон с 64 секторами через conic-gradient
    const gradient = `conic-gradient(${sectors
        .map((s, i) => `${s.color} ${i * sectorAngle}deg ${i * sectorAngle + sectorAngle}deg`)
        .join(', ')})`;

    return (
        <Box sx={{ mt: 3, p: 3, bgcolor: '#111', borderRadius: 2, color: '#eee', textAlign: 'center' }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                Выбери цвет и крути рулетку!
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3 }}>
                {['Чёрное', 'Красное'].map((color) => (
                    <Button
                        key={color}
                        variant="contained"
                        onClick={() => startSpin(color)}
                        disabled={spinning}
                        sx={{
                            bgcolor: color === 'Красное' ? '#b71c1c' : '#212121',
                            color: '#fff',
                            '&:hover': {
                                bgcolor: color === 'Красное' ? '#f44336' : '#000',
                            },
                            width: 120,
                        }}
                    >
                        {color}
                    </Button>
                ))}
            </Box>

            <Box
                sx={{
                    mx: 'auto',
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    border: '6px solid #eee',
                    position: 'relative',
                    overflow: 'hidden',
                    background: gradient,
                    transform: `rotate(${rotation}deg)`,
                    transition: spinning ? 'none' : 'transform 1s ease-out',
                    marginBottom: 2,
                }}
            >
                {/* Центральная стрелка */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '-20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '15px solid transparent',
                        borderRight: '15px solid transparent',
                        borderBottom: '25px solid #ffeb3b',
                        zIndex: 10,
                    }}
                />
            </Box>

            {result && (
                <Typography variant="h6" sx={{ mb: 1 }}>
                    Выпало: <span style={{ color: result === 'Красное' ? '#f44336' : '#ccc', fontWeight: 'bold' }}>{result}</span>
                </Typography>
            )}

            {message && (
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                    {message}
                </Typography>
            )}
        </Box>
    );
}
