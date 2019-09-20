import Head from 'next/head'
import Link from 'next/link'
import '../../styles/styles.sass'

export default ({ children }) => {
  return (
    <div>
      <Head>
        <title>Smart Stock</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
      </Head>

      <header>
        <nav className="navbar" role="navigation" aria-label="main navigation">
          <div className="navbar-brand">
            <a className="navbar-item">
              <img src="/static/logo.png" />
            </a>
          </div>
          <div id="navbarmenu" className="navbar-menu">
            <div className="navbar-start">
              <Link prefetch href="/">
                <a className="navbar-item">Home</a>
              </Link>
            </div>
            <div className="navbar-end">
              <div className="navbar-item">
              </div>
            </div>
          </div>
        </nav>
      </header>

      {children}

      <footer className="footer">
        <div className="content has-text-centered">
          <span>I'm the footer</span>
        </div>
      </footer>
    </div>
  )
}