import * as React from "react"
import { Link, useStaticQuery, graphql } from "gatsby"
import { formatTime } from "../util/formatter"

import Layout from "../components/layout"

const TagComponent = ({ location, pageContext }) => {
  const params = new URLSearchParams(location.search)
  const tag = params.get("tag")

  const { allMarkdownRemark } = useStaticQuery(graphql`
    query {
      allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
        nodes {
          id
          fields {
            slug
          }
          frontmatter {
            date
            title
            description
            tags
          }
        }
      }
    }
  `)

  const result = allMarkdownRemark.nodes.filter(
    node => node.frontmatter.tags.indexOf(tag) >= 0
  )

  return (
    <Layout location={location}>
      <div>
        <div>`{tag}` 태그가 설정된 포스트 목록입니다.</div>

        <ol style={{ listStyle: `none` }}>
          {result.map(post => {
            const title = post.frontmatter.title || post.fields.slug

            return (
              <li key={post.fields.slug}>
                <article
                  className="post-list-item"
                  itemScope
                  itemType="http://schema.org/Article"
                >
                  <header>
                    <h2>
                      <Link to={post.fields.slug} itemProp="url">
                        <span itemProp="headline">{title}</span>
                      </Link>
                    </h2>
                    <small>{formatTime(post.frontmatter.date)}</small>
                  </header>
                  <section>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: post.frontmatter.description || post.excerpt,
                      }}
                      itemProp="description"
                    />
                  </section>
                </article>
              </li>
            )
          })}
        </ol>
      </div>
    </Layout>
  )
}

export default TagComponent
