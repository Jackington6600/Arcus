import NextDocument, { Html, Head, Main, NextScript, DocumentProps, DocumentInitialProps, DocumentContext } from 'next/document';
import { COOKIE_NAME_THEME } from './_theme';
import cookie from 'cookie'

type AppDocumentProps = {
  initialTheme?: string;
};

export default class AppDocument extends NextDocument<AppDocumentProps> {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const cookieHeader = ctx.req?.headers.cookie
    const cookies = cookieHeader ? cookie.parse(cookieHeader) : {}
    const initialThemeName = cookies[COOKIE_NAME_THEME]?.toLowerCase() || null;
    return { ...await super.getInitialProps(ctx), initialTheme: initialThemeName } as any
  }

  constructor(props: AppDocumentProps & DocumentProps) {
    super(props)
  }

  render(): JSX.Element {
    return (
      <Html data-bs-theme={this.props.initialTheme}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
