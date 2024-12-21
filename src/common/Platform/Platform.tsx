import React, { createContext, useContext } from 'react';
import { WHITELISTED_HOSTS } from 'stremio/common/CONSTANTS';
import useShell from './useShell';
import { name, isMobile } from './device';

interface PlatformContext {
    name: string;
    isMobile: boolean;
    openExternal: (url: string) => void;
}

const PlatformContext = createContext<PlatformContext>({} as PlatformContext);

type Props = {
    children: JSX.Element;
};

const PlatformProvider = ({ children }: Props) => {
    const shell = useShell();

    const openExternal = (url: string) => {
        try {
            const finalUrl = url;

            if (shell.active) {
                shell.send('open-external', finalUrl);
            } else {
                window.open(finalUrl, '_blank');
            }
        } catch (e) {
            console.error('Failed to parse external url:', e);
        }
    };

    return (
        <PlatformContext.Provider value={{ openExternal, name, isMobile }}>
            {children}
        </PlatformContext.Provider>
    );
};

const usePlatform = () => {
    return useContext(PlatformContext);
};

export {
    PlatformProvider,
    usePlatform
};
