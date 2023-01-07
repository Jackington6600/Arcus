import React from "react";

// Theme values must conform to the bootstrap theme names
// https://getbootstrap.com/docs/5.3/customize/color-modes/#dark-mode
export enum Theme {
    Light = 'light',
    Dark = 'dark',
}

export const ThemeContext = React.createContext({
    theme: Theme.Light,
    setTheme: ((_: Theme) => { throw new Error("ThemeContext.Provider not set"); }) as (theme: Theme) => void
});
