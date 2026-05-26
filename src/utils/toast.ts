import { toast } from 'react-toastify';

// Configuração padrão dos toasts
const defaultOptions = {
    position: 'top-right' as const,
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    closeButton: true,
    pauseOnHover: true,
    pauseOnFocusLoss: true,
    draggable: false,
    theme: 'colored' as const,
    enableMultiContainer: false,
};

// Toast de sucesso
export const showSuccess = (message: string, options?: any) => {
    toast.success(message, { 
        ...defaultOptions, 
        autoClose: options?.autoClose !== undefined ? options.autoClose : 3000,
        ...options 
    });
};

const recentErrors = new Map<string, number>();
const ERROR_DEDUPE_MS = 4000;

// Toast de erro
export const showError = (message: string, options?: any) => {
    const now = Date.now();
    const last = recentErrors.get(message);
    if (last && now - last < ERROR_DEDUPE_MS) {
        return;
    }
    recentErrors.set(message, now);

    toast.error(message, {
        ...defaultOptions,
        autoClose: options?.autoClose !== undefined ? options.autoClose : 5000, // Erros ficam mais tempo
        ...options
    });
};

// Toast de aviso
export const showWarning = (message: string, options?: any) => {
    toast.warning(message, { 
        ...defaultOptions, 
        autoClose: options?.autoClose !== undefined ? options.autoClose : 3000,
        ...options 
    });
};

// Toast de informação
export const showInfo = (message: string, options?: any) => {
    toast.info(message, { 
        ...defaultOptions, 
        autoClose: options?.autoClose !== undefined ? options.autoClose : 3000,
        ...options 
    });
};

// Toast customizado
export const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    switch (type) {
        case 'success':
            showSuccess(message);
            break;
        case 'error':
            showError(message);
            break;
        case 'warning':
            showWarning(message);
            break;
        default:
            showInfo(message);
    }
};

// Toast de carregamento
export const showLoading = (message: string) => {
    return toast.loading(message, {
        ...defaultOptions,
        autoClose: false,
    });
};

// Atualizar toast de loading para sucesso/erro
export const updateLoadingToast = (toastId: string, message: string, type: 'success' | 'error' = 'success') => {
    toast.update(toastId, {
        render: message,
        type: type === 'success' ? 'success' : 'error',
        isLoading: false,
        autoClose: 3000,
    });
};
