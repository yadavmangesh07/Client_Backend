import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const useIdleTimeout = (timeoutMs: number = 3600000) => { // Default: 1 Hour
    // 👇 FIX: Tell TypeScript this ref can hold a number or null
    const timeoutRef = useRef<number | null>(null); 
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem('token'); 
        // localStorage.removeItem('user'); // Uncomment if you store user data
        navigate('/login');
    };

    const resetTimer = () => {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
        }
        // 👇 The window.setTimeout explicitly returns a number in the browser
        timeoutRef.current = window.setTimeout(logout, timeoutMs);
    };

    useEffect(() => {
        const activityEvents = [
            'mousemove', 
            'keydown', 
            'click', 
            'scroll'
        ];

        resetTimer();

        activityEvents.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        return () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
            activityEvents.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, []); 
};