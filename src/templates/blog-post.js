import React, { useEffect } from "react"
import { Link, graphql } from "gatsby"
import { formatTime } from "../util/formatter"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import TableOfContents from "../components/toc"
import Tags from "../components/tag"

const onScroll = () => {
  const items = document.querySelectorAll(".table-of-contents a")

  const headers = [
    ...document.querySelectorAll(".blog-post h3"),
    ...document.querySelectorAll(".blog-post h4"),
  ]

  const filtered = headers.filter(
    header => header.getBoundingClientRect().top <= 30
  )

  if (filtered.length > 0) {
    const maxKey = Object.keys(filtered).reduce((k1, k2) =>
      filtered[k1].getBoundingClientRect().top >
      filtered[k2].getBoundingClientRect().top
        ? k1
        : k2
    )
    const currentHeader = filtered[maxKey].innerText

    items.forEach(item => {
      if (item.innerText === currentHeader) {
        item.classList.add("active")
      } else {
        item.classList.remove("active")
      }
    })
  } else {
    items.forEach(item => item.classList.remove("active"))
  }
}

const BlogPostTemplate = ({ data, location }) => {
  const post = data.markdownRemark
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const { previous, next } = data

  useEffect(() => {
    document.addEventListener("scroll", onScroll)
    return () => document.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <Layout location={location} title={siteTitle}>
      <Seo
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
      />
      <article
        className="blog-post"
        itemScope
        itemType="http://schema.org/Article"
      >
        <header>
          <h1 itemProp="headline">{post.frontmatter.title}</h1>
          <p>{formatTime(post.frontmatter.date)}</p>
        </header>
        <section
          dangerouslySetInnerHTML={{ __html: post.html }}
          itemProp="articleBody"
        />
        <hr />
        <footer>
          <Tags tags={post.frontmatter.tags} />
          <Bio />
        </footer>
      </article>
      <nav className="blog-post-nav">
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </nav>
      <TableOfContents contents={post.tableOfContents} />
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query ($id: String!, $previousPostId: String, $nextPostId: String) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      html
      tableOfContents
      frontmatter {
        title
        date
        description
        tags
      }
    }
    previous: markdownRemark(id: { eq: $previousPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
    next: markdownRemark(id: { eq: $nextPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`
