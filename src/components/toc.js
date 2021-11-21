import * as React from "react"

const TableOfContents = props => {
  return (
    <div
      className="table-of-contents"
      style={{
        right: "calc(10vw)",
        position: "fixed",
        top: "180px",
      }}
      dangerouslySetInnerHTML={{ __html: props.contents }}
    ></div>
  )
}

export default TableOfContents
