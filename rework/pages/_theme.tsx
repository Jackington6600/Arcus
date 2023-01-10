import React, { Component, PropsWithChildren, useEffect, useState } from "react";
import cookie from 'cookie'

export const COOKIE_NAME_THEME = 'THEME';
const COOKIE_NAME_BROWSER_THEME = 'BROWSER_PREFERRED_THEME';

// Theme values must conform to the bootstrap theme names
// https://getbootstrap.com/docs/5.3/customize/color-modes/#dark-mode
export enum Theme {
  Light = 'Light',
  Dark = 'Dark',
}

export const ThemeContext = React.createContext(Theme.Light);
export const SetThemeContext = React.createContext<(theme: Theme) => void>(((_: Theme) => { throw new Error("ThemeContext.Provider not set"); }));

type Props = PropsWithChildren<{
  initialTheme?: Theme;
}>;

type State = {
  theme: Theme;
  browserTheme?: Theme;
};

const prefersDarkModeMediaQuery = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : undefined

function getBrowserTheme(): Theme | undefined {
  if (prefersDarkModeMediaQuery) {
    if (prefersDarkModeMediaQuery.matches) {
      return Theme.Dark;
    } else {
      return Theme.Light;
    }
  }
}


export class ThemeComponent extends Component<Props, State> {
  private _darkModeEventListener?: (e: Event) => void = undefined

  constructor(props: Props) {
    super(props);

    const initialTheme: Theme = this.props.initialTheme || Theme.Light;

    this.state = {
      theme: initialTheme
    }
  }

  private updateTheme() {
    console.log('updateTheme', this.state)
    document.documentElement.dataset['bsTheme'] = this.state.theme.toLowerCase();
    const options = { path: '/', sameSite: 'strict', maxAge: 60 * 60 * 24 * 365 } as const;
    document.cookie = cookie.serialize(COOKIE_NAME_THEME, this.state.theme, options)
    document.cookie = cookie.serialize(COOKIE_NAME_BROWSER_THEME, this.state.browserTheme || '', options)
  }

  componentDidMount(): void {
    const cookieBrowserTheme = Theme[cookie.parse(document.cookie)[COOKIE_NAME_BROWSER_THEME]]
    const browserTheme = getBrowserTheme()

    console.log(this.props.initialTheme, cookieBrowserTheme, browserTheme, cookieBrowserTheme !== browserTheme, this.props.initialTheme === cookieBrowserTheme)
    const theme = (this.props.initialTheme && cookieBrowserTheme !== browserTheme && this.props.initialTheme === cookieBrowserTheme ? undefined : this.props.initialTheme) || browserTheme || Theme.Light;
    console.log(theme)

    this.setState({
      theme,
      browserTheme
    })

    if (prefersDarkModeMediaQuery) {
      this._darkModeEventListener = (_) => this.setState({ browserTheme: getBrowserTheme() })
      prefersDarkModeMediaQuery.addEventListener("change", this._darkModeEventListener)
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if (prevState.browserTheme && this.state.browserTheme && prevState.browserTheme !== this.state.browserTheme && this.state.theme === prevState.browserTheme) {
      this.setState({ theme: this.state.browserTheme })
    }
    if (prevState.theme !== this.state.theme || prevState.browserTheme !== this.state.browserTheme) {
      this.updateTheme();
    }
  }

  componentWillUnmount(): void {
    if (prefersDarkModeMediaQuery && this._darkModeEventListener) {
      prefersDarkModeMediaQuery.removeEventListener("change", this._darkModeEventListener)
    }
  }

  render() {
    return (
      <ThemeContext.Provider value={this.state.theme}>
        <SetThemeContext.Provider value={(theme: Theme) => this.setState({ theme })}>
          {this.props.children}
        </SetThemeContext.Provider>
      </ThemeContext.Provider>
    );
  }
}
