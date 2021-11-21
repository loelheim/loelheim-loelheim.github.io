import React, { useState } from "react"
import { Link, navigate } from "gatsby"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch } from "@fortawesome/free-solid-svg-icons"

const search = query => {
  if (query) {
    navigate(`/search?query=${query}`)
  }
}

const Toolbar = props => {
  const [query, setQuery] = useState("")

  return (
    <div className="toolbar">
      <h2 className="title">
        <Link to="/">{props.title || ""}</Link>
      </h2>

      <div className="menu">
        <div className="search-box">
          <input
            type="text"
            className="search-text"
            placeholder="search"
            value={query}
            onKeyDown={e => (e.key === "Enter" ? search(query) : "")}
            onChange={({ target: { value } }) => setQuery(value)}
          />
          <div className="search-button">
            <FontAwesomeIcon
              icon={faSearch}
              style={{ width: "15px" }}
              onClick={() => search(query)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Toolbar
