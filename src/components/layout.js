import * as React from "react"

import Toolbar from "../components/Toolbar"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <header className="global-header">
        <Toolbar />
      </header>
      <main>{children}</main>
      <footer>
        Copyright © {new Date().getFullYear()} {title} All rights reserved.{" "}
        <br />
        Built with {` `} <a href="https://www.gatsbyjs.com">Gatsby</a>
      </footer>
    </div>
  )
}

export default Layout
