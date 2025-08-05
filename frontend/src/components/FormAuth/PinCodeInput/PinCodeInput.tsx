import React, { useRef, useEffect, type KeyboardEvent, useState } from 'react';
import './PinCodeInput.scss';

interface PinCodeInputProps {
    onLogin: (pin: string) => void;
}

const PinCodeInput: React.FC<PinCodeInputProps> = ({ onLogin }) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [code, setPinCode] = useState<string[]>(['', '', '', '']);

    // Инициализируем массив refs
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, 4);
    }, []);

    // Фокусируем первый инпут при монтировании
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index: number, value: string) => {
        if (value && !/^[0-9]$/.test(value)) return;

        const newPin = [...code];
        newPin[index] = value;
        setPinCode(newPin);

        // Переход к следующему полю
        if (value && index < 3) {
            setTimeout(() => inputRefs.current[index + 1]?.focus(), 0);
        }

        // Проверка заполненности
        if (newPin.every(d => d !== '') && index === 3) {
            onLogin(newPin.join(''));
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').slice(0, 4);
        const newPin = [...code];

        pasteData.split('').forEach((char, i) => {
            if (i < 4 && /^[0-9]$/.test(char)) {
                newPin[i] = char;
            }
        });

        setPinCode(newPin);

        const lastFilledIndex = newPin.findIndex((digit) => digit === '');
        const focusIndex = lastFilledIndex === -1 ? 3 : Math.min(lastFilledIndex - 1, 3);
        inputRefs.current[focusIndex]?.focus();

        if (pasteData.length === 4) {
            onLogin(newPin.join(''));
        }
    };

    return (
        <>
            <h2>Введите пин-код</h2>
            <div className="pin-code-container">
                {code.map((digit, index) => (
                    <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        ref={(el) => {
                            inputRefs.current[index] = el;
                        }}
                        className="pin-code-input"
                    />
                ))}
            </div>
        </>
    );
};

export default PinCodeInput;