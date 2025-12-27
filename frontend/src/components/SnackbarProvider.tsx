import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type SnackbarType = 'info' | 'success' | 'error';

type Placement = 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';

interface SnackbarMessage {
    id: string;
    text: string;
    type: SnackbarType;
    duration: number;
    closing?: boolean;
}

interface SnackbarContextValue {
    show: (text: string, type?: SnackbarType, duration?: number) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

interface ProviderProps {
    children: React.ReactNode;
    placement?: Placement;
    newestOnTop?: boolean;
}

const EXIT_ANIMATION_MS = 200;

export const SnackbarProvider: React.FC<ProviderProps> = ({ children, placement = 'bottom-center', newestOnTop = true }) => {
    const [messages, setMessages] = useState<SnackbarMessage[]>([]);

    const removeImmediate = useCallback((id: string) => {
        setMessages((s) => s.filter((m) => m.id !== id));
    }, []);

    const closeMessage = useCallback((id: string) => {
        // mark closing to trigger exit animation, then remove after a timeout
        setMessages((s) => s.map((m) => (m.id === id ? { ...m, closing: true } : m)));
        window.setTimeout(() => removeImmediate(id), EXIT_ANIMATION_MS);
    }, [removeImmediate]);

    const show = useCallback((text: string, type: SnackbarType = 'info', duration = 4000) => {
        const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        const msg: SnackbarMessage = { id, text, type, duration };
        setMessages((s) => (newestOnTop ? [msg, ...s] : [...s, msg]));

        // auto-dismiss: call closeMessage (animated)
        window.setTimeout(() => closeMessage(id), duration);
    }, [closeMessage, newestOnTop]);

    // compute container classes based on placement
    const containerPositionClasses = (() => {
        switch (placement) {
            case 'bottom-right':
                return 'fixed right-6 bottom-6 items-end';
            case 'bottom-left':
                return 'fixed left-6 bottom-6 items-start';
            case 'top-center':
                return 'fixed left-1/2 top-6 transform -translate-x-1/2 items-center';
            case 'top-right':
                return 'fixed right-6 top-6 items-end';
            case 'top-left':
                return 'fixed left-6 top-6 items-start';
            case 'bottom-center':
            default:
                return 'fixed left-1/2 bottom-6 transform -translate-x-1/2 items-center';
        }
    })();

    return (
        <SnackbarContext.Provider value={{ show }}>
            {children}

            {/* snackbar container */}
            <div className={`${containerPositionClasses} z-50 w-full max-w-[90vw] md:max-w-lg pointer-events-none`}>
                <div className="flex flex-col gap-3 w-full">
                    {messages.map((m) => {
                        const isClosing = !!m.closing;
                        return (
                            <div
                                key={m.id}
                                className={`pointer-events-auto w-full flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-200 ease-out
                                                                        ${isClosing ? 'opacity-0 translate-y-3 scale-95' : 'opacity-100 translate-y-0 scale-100'}
                                                                        ${m.type === 'success' ? 'bg-green-600 text-white' : ''}
                                                                        ${m.type === 'error' ? 'bg-red-600 text-white' : ''}
                                                                        ${m.type === 'info' ? 'bg-slate-800 text-white' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                        {m.type === 'success' && <CheckCircle className="w-5 h-5" />}
                                        {m.type === 'error' && <AlertCircle className="w-5 h-5" />}
                                        {m.type === 'info' && <Info className="w-5 h-5" />}
                                    </div>
                                    <div className="text-sm leading-tight">{m.text}</div>
                                </div>

                                <button
                                    aria-label="Dismiss"
                                    onClick={() => closeMessage(m.id)}
                                    className="ml-auto text-white/90 hover:text-white/100 rounded focus:outline-none"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </SnackbarContext.Provider>
    );
};

export function useInternalSnackbar() {
    const ctx = useContext(SnackbarContext);
    if (!ctx) throw new Error('useInternalSnackbar must be used within SnackbarProvider');
    return ctx;
}

export default SnackbarProvider;
