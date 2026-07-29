import { useEffect, useRef } from 'react';
import {
    THEME_CHANNEL_NAME,
    MESSAGE_TYPES,
    THEME_STORAGE_KEY,
    getAllCSSVariables,
    type ThemeMessage,
    type ColorUpdatePayload,
    type InitialStatePayload,
} from '../../utils/themeEditorConfig';

/**
 * ThemeListener - React island component for receiving theme updates
 * 
 * This component listens to BroadcastChannel messages from the Theme Editor
 * and applies CSS variable changes in real-time to the document.
 * Also handles persistence via sessionStorage for navigation.
 */
export default function ThemeListener() {
    const channelRef = useRef<BroadcastChannel | null>(null);

    useEffect(() => {
        // Restore any persisted theme from sessionStorage on mount
        restorePersistedTheme();

        // Create BroadcastChannel
        channelRef.current = new BroadcastChannel(THEME_CHANNEL_NAME);

        // Handle incoming messages
        channelRef.current.onmessage = (event: MessageEvent<ThemeMessage>) => {
            const { type, payload } = event.data;

            switch (type) {
                case MESSAGE_TYPES.REQUEST_INITIAL_STATE:
                    // Editor is requesting current colors - respond with DOM values
                    sendInitialState();
                    break;

                case MESSAGE_TYPES.UPDATE_COLOR:
                    // Apply single color update
                    if (payload) {
                        const { variable, value } = payload as ColorUpdatePayload;
                        applyColor(variable, value);
                        persistTheme(variable, value);
                    }
                    break;

                case MESSAGE_TYPES.RESET_THEME:
                    // Clear session storage and reload page to get fresh Sanity values
                    sessionStorage.removeItem(THEME_STORAGE_KEY);
                    // Remove all inline style overrides
                    document.documentElement.removeAttribute('style');
                    // Reload the page to get fresh values from Sanity
                    window.location.reload();
                    break;
            }
        };

        // Cleanup on unmount
        return () => {
            channelRef.current?.close();
        };
    }, []);

    /**
     * Reads current CSS variable values from DOM and sends to Editor
     */
    function sendInitialState() {
        const colors: Record<string, string> = {};
        const allVars = getAllCSSVariables();
        const computedStyle = getComputedStyle(document.documentElement);

        for (const { cssVar } of allVars) {
            const value = computedStyle.getPropertyValue(cssVar).trim();
            if (value) {
                colors[cssVar] = value;
            }
        }

        const message: ThemeMessage = {
            type: MESSAGE_TYPES.INITIAL_STATE,
            payload: { colors } as InitialStatePayload,
        };

        channelRef.current?.postMessage(message);
    }

    /**
     * Applies a single color to the document root
     */
    function applyColor(variable: string, value: string) {
        document.documentElement.style.setProperty(variable, value);
    }

    /**
     * Persists a color change to sessionStorage
     */
    function persistTheme(variable: string, value: string) {
        try {
            const stored = sessionStorage.getItem(THEME_STORAGE_KEY);
            const colors: Record<string, string> = stored ? JSON.parse(stored) : {};
            colors[variable] = value;
            sessionStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(colors));
        } catch (e) {
            // Ignore storage errors
        }
    }

    /**
     * Restores persisted theme from sessionStorage on page load
     */
    function restorePersistedTheme() {
        try {
            const stored = sessionStorage.getItem(THEME_STORAGE_KEY);
            if (stored) {
                const colors: Record<string, string> = JSON.parse(stored);
                for (const [variable, value] of Object.entries(colors)) {
                    document.documentElement.style.setProperty(variable, value);
                }
            }
        } catch (e) {
            // Ignore storage errors
        }
    }

    // This component renders nothing - it's purely for side effects
    return null;
}
