import * as React from "react"
import { Link, useStaticQuery, graphql } from "gatsby"
import { formatTime } from "../util/formatter"

import Layout from "../components/layout"

const regexToRefine = /[^@0-9a-zA-Z가-힣 _-]/g

const refineQuery = query => {
  const tokens = query
    .replaceAll(regexToRefine, " ")
    .split(" ")
    .map(token => token.toLowerCase())

  return tokens.filter(token => {
    return token
  })
}

const SearchComponent = ({ location }) => {
  const params = new URLSearchParams(location.search)
  const query = params.get("query")

  if (!query) {
    return (
      <Layout location={location}>
        <div>검색 결과가 없습니다.</div>
      </Layout>
    )
  }

  const tokens = new Set(refineQuery(query))

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

  const posts = allMarkdownRemark.nodes

  posts.forEach(post => {
    const { title, description, tags } = post.frontmatter
    const words = [
      ...new Set(
        [...refineQuery(title), ...refineQuery(description), ...tags].map(
          word => word.toLowerCase()
        )
      ),
    ]

    let score = 0

    for (const token of tokens) {
      for (const word of words) {
        if (token.indexOf(word) >= 0 || word.indexOf(token) >= 0) {
          score += 1
        }
      }
    }

    post.score = score
  })

  posts.sort((post1, post2) => {
    if (post1.score === post2.score) {
      return post1.date > post2.date ? -1 : 0
    } else {
      return post1.score > post2.score ? -1 : 1
    }
  })

  const result = posts.filter(post => post.score > 0)

  if (!result?.length) {
    return (
      <Layout location={location}>
        <div>검색 결과가 없습니다.</div>
      </Layout>
    )
  }

  return (
    <Layout location={location}>
      <div>
        <div>`{query}`에 대한 검색 결과입니다.</div>

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

export default SearchComponent
