import { useCallback } from 'react';
import { useInternalSnackbar } from '../components/SnackbarProvider';

export type SnackbarType = 'info' | 'success' | 'error';

export function useSnackbar() {
    const ctx = useInternalSnackbar();

    const showInfo = useCallback((text: string, duration?: number) => ctx.show(text, 'info', duration), [ctx]);
    const showSuccess = useCallback((text: string, duration?: number) => ctx.show(text, 'success', duration), [ctx]);
    const showError = useCallback((text: string, duration?: number) => ctx.show(text, 'error', duration), [ctx]);

    return {
        show: ctx.show,
        showInfo,
        showSuccess,
        showError,
    };
}

export default useSnackbar;
