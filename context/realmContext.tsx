import React, { Context, FC } from 'react'

type Config = {
    chainId: number,
    contract: `0x${string}`,
    goldContract: `0x${string}` | null,
    castleContract: `0x${string}` | null,
}

export const SettingsStateContext = React.createContext<Config | null>(null);

export const SettingsProvider: FC<{ data: Config, children?: React.ReactNode }> = ({ children, data }) => {
    return (
        <SettingsStateContext.Provider value={data}>
            {children}
        </SettingsStateContext.Provider>
    );
}

export function useSettingsState() {
    const data = React.useContext<Config>(SettingsStateContext as Context<Config>);

    if (data === undefined) {
        throw new Error('useSettingsState must be used within a SettingsProvider');
    }

    return data;
}
