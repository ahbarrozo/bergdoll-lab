/**
 *  A dedicated store for the Toaster component
 *
 *  Usage examples :
 *  - toaster.show('Hello world');
 *  - toaster.show('Error occurred', 'error', 5000);
 *  - toaster.hide();
 */
import { writable } from 'svelte/store';

export type ToastType = 'error' | 'info' | 'success' | 'warning';

interface ToastState {
    display: boolean;
    message: string;
    type: ToastType;
    timeout: number;
}

const createToasterStore = () => {
    const initialState: ToastState = {
        display: false,
        message: '',
        type: 'info',
        timeout: 3000
    };
    
    const { subscribe, set, update } = writable<ToastState>(initialState);
    
    let timer: ReturnType<typeof setTimeout> | null = null;
    
    return {
        subscribe,     
        show: (message: string, type: ToastType = 'info', timeout: number = 3000) => {
            // Clear existing timer
            if (timer) clearTimeout(timer);
            
            // Show the toast
            set({ display: true, message, type, timeout });
            
            // Set auto-hide timer
            timer = setTimeout(() => {
                update(state => ({ ...state, display: false }));
            }, timeout);
        },
        
        hide: () => {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            update(state => ({ ...state, display: false }));
        },
        
        // For testing or initialization
        reset: () => set(initialState)
    };
};

export const toaster = createToasterStore();
