import * as React from "react"
import { Link } from "gatsby"

const Tags = ({ tags }) => {
  return (
    <div style={{ marginBottom: "40px" }}>
      {tags.map(tag => (
        <Link className="tag" key={tag} to={`/tags?tag=${tag}`}>
          {tag}
        </Link>
      ))}
    </div>
  )
}

export default Tags
