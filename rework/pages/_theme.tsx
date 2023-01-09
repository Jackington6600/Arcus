import React, { Component, PropsWithChildren, useEffect, useState } from "react";
import { cookies } from 'next/headers';

export const COOKIE_NAME_THEME = 'THEME_NAME';

// Theme values must conform to the bootstrap theme names
// https://getbootstrap.com/docs/5.3/customize/color-modes/#dark-mode
export enum Theme {
  Light = 'Light',
  Dark = 'Dark',
}

export const ThemeContext = React.createContext(Theme.Light);
export const SetThemeContext = React.createContext<(theme: Theme) => void>(((_: Theme) => { throw new Error("ThemeContext.Provider not set"); }));

type Props = PropsWithChildren<{
  initialTheme?: string;
}>;

type State = {
  theme: Theme;
};

export class ThemeComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    var initialTheme: Theme = this.props.initialTheme && Theme[this.props.initialTheme] || Theme.Light;
    this.state = {
      theme: initialTheme
    }
  }

  private updateTheme() {
    document.documentElement.dataset['bsTheme'] = this.state.theme.toLowerCase();
    document.cookie = `${COOKIE_NAME_THEME}=${this.state.theme}; SameSite=Strict`;
  }

  componentDidMount(): void {
    this.updateTheme();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if (this.state.theme !== prevState.theme) {
      this.updateTheme();
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
