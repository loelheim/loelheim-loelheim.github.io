---
title: 개츠비로 블로그 시작하기 - 커스터마이징 (4)
description: 개츠비로 시작하는 블로그, 태그 기능을 추가하자
tags: ['gatsby','개츠비','blog','블로그','tag','tags','태그','category','카테고리']
date: 2021-11-29T23:05:43.028Z
---

### 1. 태그를 위해 구현해 둔 기능 살펴보기

이번 포스팅을 작성했을 때 사용한 스크립트를 잠깐 살펴보자.

```shell
loel@loels-MacBook-Pro > npm run post

> loel@0.1.0 post
> node scripts/frontman

? title: 개츠비로 블로그 시작하기 - 커스터마이징 (4)
? description: 개츠비로 시작하는 블로그, 태그 기능을 추가하자
? pathname (alphanumeric except some special characters):  06_gatsby_customization_4_tag
? tags (multiple tags concatenated with comma):  gatsby, 개츠비, blog, 블로그, tag, tags, 태그, category, 카테고리

 > title: 개츠비로 블로그 시작하기 - 커스터마이징 (4)
 > description: 개츠비로 시작하는 블로그, 태그 기능을 추가하자
 > tags: gatsby,개츠비,blog,블로그,tag,tags,태그,category,카테고리
 > date: 2021-11-29T23:05:43.028Z

 🚀  now your new post is ready !
```

이미 [이전 포스트](/2021_11/03_gatsby_customization_1_writing/)의 템플릿에서 태그 목록을 지정할 수 있도록 스크립트를 작성했었다.

이 태그를 글 목록에 노출하고 태그를 선택하면 해당 태그가 포함된 글만 볼 수 있도록 할 예정이다.

### 2. 태그 컴포넌트 추가

#### 컴포넌트 코드 작성

```javascript
import * as React from "react"
import { Link } from "gatsby"

const Tags = ({ tags }) => {
  return (
    <div style={{ marginBottom: "40px" }}>
      {tags.map(tag => (
        <Link className="tag" key={tag} to={`/tags?tag=${tag}`}>{tag}</Link>
      ))}
    </div>
  )
}

export default Tags
```

태그 목록을 제공하면 각 태그와 함께 눌렀을 때 이동할 링크를 연결해서 제공하는 컨테이너 역할을 한다.

#### 컴포넌트 디자인

```css
:root {
  --tag-color: #f7f8fc;
  --tag-highlight-color: darkgrey;
}

.tag {
  padding: 4px 8px;
  border-radius: 10px;
  border-style: solid;
  border-color: darkgrey;
  border-width: 2px;
  margin-right: 5px;
  line-height: 2.5;
  background-color: var(--tag-color);
  color: var(--tag-highlight-color);
  white-space: nowrap;
}

.tag:link {
  text-decoration: none;
}

.tag:hover {
  background-color: var(--tag-highlight-color);
  color: var(--tag-color);
  transform: scale(1.2);
}
```

보는데 큰 불편함이 없는 선에서 간단하게 디자인했다.

#### 태그로 검색된 포스트 목록 페이지 작성

검색 기능을 구현할 때와 마찬가지로, 블로그의 레이아웃을 비슷하게 가져가려고 한다. 디자인에 대해 크게 고민할 필요도 없어지고 일관된 디자인이 추후에 컴포넌트를 추가할 때에도 큰 도움이 된다 생각해서 추가적인 디자인은 가급적이면 안하려고 한다.

우선은 `src/pages/tags.js` 파일을 만들고 아래 내용을 추가하자.

```javascript
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

  const result = allMarkdownRemark.nodes.filter((node) => node.frontmatter.tags.indexOf(tag) >= 0)

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
```

대부분은 `src/pages/search.js`와 동일하고 태그를 기준으로 필터링하는 부분만 약간의 차이가 있다. 이로써 태그와 관련된 기능 구현을 모두 마쳤다.

```javascript
const result = allMarkdownRemark.nodes.filter((node) => node.frontmatter.tags.indexOf(tag) >= 0)
```

### 3. 쿼리가 좀 이상한데 ?

사실 이 쿼리는 상당히 비효율적이다. 모든 데이터를 가져온 이후에 필터링을 하기 때문에 풀 스캔이 발생하는데 일반적인 케이스라면 쿼리를 작성할 때 필터링 조건을 추가했을 것이다.

가령 이런 형태처럼 변수를 추가해서 데이터를 조회하는 시점에 필터링 하는 것을 기대했다.

```javascript
const { allMarkdownRemark } = useStaticQuery(graphql`
  query($tag: String!) {
    allMarkdownRemark(
        sort: { fields: [frontmatter___date], order: DESC }
        filter: {frontmatter: {tags: {in: [$tag]}}}
    ) {
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
```

위와 같이 변수를 지정하고 값을 전달하면 당연히 될 거라고 생각했는데, `개츠비`에서 변수를 전달할 수 있는 메서드를 찾을 수 없었다. (찾으면 공유 좀 부탁드립니다 ...)

이 방법이 어렵다면 약간의 꼼수(?)지만 템플릿 리터럴을 사용해보는 방법도 있을거라 생각했다. 하지만 그렇게 작업하면 아래와 같은 오류가 발생한다.

> Error: .../src/pages/search.js: BabelPluginRemoveGraphQLQueries: String interpolations are not allowed in graphql fragments. Included fragments should be referenced as \`...MyModule_foo\`.

요약하면 플러그인을 통한 쿼리에서는 템플릿 리터럴을 제공하지 않아서 발생하는 문제였고, 말 그대로 메서드 이름 자체가 `StaticQuery`이기 때문에 발생하는 문제로 보인다.

이 문제는 페이지를 생성하는 부분에서 `pageContext`에 전달하면 가능하다고는 하는데, 쿼리를 호출할 때 바인딩이 자유롭지 않다는 점에서 상당한 제약이 있을 것 같다. 나름 `리액트`를 사용하면서 상당히 자유롭게 개발을 한다고 생각했는데 막상 이런 부분에서 막히니깐 의외로 맥이 빠진다고 해야하나 ...