import { useEffect, useState } from 'react';
import './ShowError.scss';

interface ShowErrorProps {
    msg: { id: number; message: string } | null;
}

const ShowError: React.FC<ShowErrorProps> = ({ msg }) => {
    const [error, setError] = useState<string | null>(null);
    const [fadeOut, setFadeOut] = useState<boolean>(false);

    useEffect(() => {
        if (!msg) return;

        setError(msg.message);
        setFadeOut(false);

        const fadeTimeout = setTimeout(() => setFadeOut(true), 4000);
        const removeTimeout = setTimeout(() => {
            setError(null);
            setFadeOut(false);
        }, 5000);

        return () => {
            clearTimeout(fadeTimeout);
            clearTimeout(removeTimeout);
        };
    }, [msg?.id]);

    return (
        <div className='show-error'>
            {error && (
                <div className={`show-error__error ${fadeOut ? "fade-out" : ""}`}>
                    {error}
                </div>
            )}
        </div>
    )
}

export default ShowError;
