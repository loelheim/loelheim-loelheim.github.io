---
title: 개츠비로 블로그 시작하기 - 커스터마이징 (3)
description: 개츠비로 시작하는 블로그, 검색 기능을 추가하자
tags: ['gatsby','개츠비','blog','블로그','검색']
date: 2021-11-29T10:35:08.573Z
---

### 1. 검색 기능을 구현하는 방법

[공식 홈페이지](https://www.gatsbyjs.com/docs/how-to/adding-common-features/adding-search/)에서는 다양한 방법으로 검색을 추가하는 방법을 소개하고 있다.

일반적으로 블로그를 위해서 별도의 서버 API까지 구성해서 제공할 만큼 여유로운(?) 사람은 많지 않다고 생각해서 서버를 따로 구성하는 방법은 고려하지 않을 예정이다.

아무래도 로컬에서 제공하는 방법은 성능이나 최적화 부분에서는 한계가 있다고 생각하므로, 여유가 된다면 다른 방식도 적용해보면 어떨까 싶다.

#### 직접 구현하는 방법

- title, description 등에서 질의어가 포함되는지 체크하는 방식으로 직접 구현하는 방법

#### 별도의 라이브러리를 사용하여 구현하는 방법

- js-search

    - 정적 데이터로부터 검색할 데이터를 가져와 내부적으로 인덱싱하는 방식으로 보임
    - 검색 결과를 노출하기 위한 별도 컴포넌트는 제공하지 않아 구현 필요

#### 플러그인을 사용하여 구현하는 방법

- gatsby-plugin-local-search

    - `flexsearch`, `Lunr` 등 다양한 엔진을 지원
    - 공식 홈페이지에서는 가장 빠르고 메모리 사용량이 적은 `flexsearch`를 추천 (성능 비교 : [링크](https://github.com/nextapps-de/flexsearch#performance-benchmark-ranking))
    - [별도의 플러그인](https://github.com/angeloashmore/react-use-flexsearch)으로 검색 결과를 보여주는 폼도 제공

- gatsby-plugin-elasticlunr-search

    - `elasticlunr`가 데이터를 토큰화하고 분석하여 검색 결과를 제공
    - [검색하다 찾은 블로그](https://yohanpro.com/posts/gatsby-search)에서 한글이 지원되지 않는다는 이야기를 듣고 적용 포기

벤치마크와 결과 노출을 위한 플러그인 제공, 별도 언어를 위한 커스터마이징 옵션이 제공된다는 점에서 `flexsearch`를 사용하지 않을 이유가 없다. 다만 적용해보려고 하니 고민이 되는 부분이 있어서 그냥 직접 구현해보기로 했다.

- 동작에는 이슈가 없지만, 플러그인의 의존성이 `gatsby: >= 2.20.0`로 매우 낮음
- 지금 하는 작업들이 국내에 최신 메이저 버전 기준으로 세팅하는 설명이 충분하지 않다고 생각해 정리하는 중
- `flexsearch` 자체는 자주 업데이트되나, 플러그인은 최근 변경 사항이 없고 예시대로 적용하면 문제 발생

사실 마지막 이유가 가장 걸렸다. `path` 정보를 받는 방법은 파일을 생성하는 시점에 세팅하는 것이 가장 좋은 방법이라 `frontman` 스크립트를 일부 변경하고 스키마를 추가해야 했다.
중간까지 진행해보다가 롤백을 했었는데 아마도 그렇게 한다면 모든 과정이 튜토리얼대로 잘 적용될 것이라 보인다.

### 2. 간단한 검색

간단하게 내가 생각하는 정의를 정리해보자면 다음과 같다.

> 찾고자 하는 질의어를 입력하면, 질의어와 부합하는 항목을 결과로 제공한다

사실 내 블로그에서 검색을 직접 하기보다는 검색 엔진 최적화로 들어오는 경우가 대부분일 것이고, 이후에 태그를 추가하여 같은 분류의 글은 확인할 수 있도록 남길 예정이기 때문에 검색이 갖는 의미가 크진 않을 것 같다.

때문에 정확한 검색을 지원하는 것은 나중의 일로 던져놓고 단어 위주의 검색으로 검색 기능을 해결하고자 한다. 참고로 본문을 인덱싱 하기에는 환경적인 어려움이 있어서 간단한 정보만 찾을 예정이다.

- 입력

    - 단어 : 공백 제거 후 검색에 사용
    - 문장 : 공백 단위로 자른 단어를 모아 처리

- 검색 대상

    - frontmatter : title, description, tags에 하나라도 포함되는 것이 있으면 노출

또한 검색 기능을 어떤 방식으로 구현할 것인지도 고민해봐야 한다.

현재 블로그에는 검색 버튼이나 검색 창을 둘만한 위치가 마땅하지 않다. 게다가 메인 화면과 포스트 상세 화면의 레이아웃도 약간의 차이가 있어서 공통화하기 어려운 부분도 있다.

이 때문에 상단 레이아웃을 공통화하여 첫 화면과 포스트 상세, 검색 결과 화면에서 모두 일관된 화면을 제공하도록 하려고 한다.

### 3. 직접 구현해보자

#### 커스텀 툴바 레이아웃 추가

먼저 상단 레이아웃을 공통화하여 사용하려고 한다.

일관된 레이아웃이 뭔가 보기에도 좋아보이고 화면 구성할 때 고려해야 하는 것도 줄어들기 때문이다.

레이아웃에는 블로그 이름과 검색 버튼 정도만 노출해도 충분하지 않을까 싶다.

우선 검색 아이콘을 추가하기 위해 폰트를 좀 설치했다.

```shell
npm install --save @fortawesome/fontawesome-svg-core
npm install --save @fortawesome/free-solid-svg-icons
npm install --save @fortawesome/react-fontawesome
```

이후에 `src/components/toolbar.js`를 아래와 같이 구성했다.

```javascript
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
        <Link to="/">{props.title || "loelheim"}</Link>
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
```

`useState`로 함수형 컴포넌트에서도 상태를 관리할 수 있게끔 했고, 선언한 `query`를 `<Input />`에 연동했다. 값이 바뀌면 해당 값이 상태에 저장되도록 할당했고, 엔터가 입력거나 아이콘을 누르면 검색이 되도록 이벤트 리스너를 등록했다.


#### 관련 CSS 추가

```css
.toolbar .title {
  position: relative;
  display: inline;
  font-size: xx-large;
}

.menu {
  float: right;
}

.menu > * {
  margin-left: 10px;
}

.menu > * {
  font-size: xx-large;
}

.search-box {
  border-color: grey;
  border-radius: 30px;
  border-style: solid;
  border-width: 2px;
  float: left;
}

.search-box:hover > .search-text {
  width: 300px;
  margin-left: 20px;
}

.search-button {
  width: 30px;
  height: 30px;
  background: none;
  border-radius: 50%;
  align-items: center;
  display: flex;
  justify-content: center;
  transition: all .4s;
}

.search-text {
  background: none;
  border: none;
  float: left;
  font-size: 16px;
  line-height: 30px;
  outline: none;
  padding: 0;
  transition: .4s;
  width: 0;
}
```

CSS는 여기저기 내용을 찾으면서 지금 현 상태에 어울리는 형태로 작업해서 약간 부족할 수 있으나, 깔끔하게 나오는 것 같아서 이정도로만 마무리하려고 한다.

#### 검색화면 추가

`src/pages/{페이지 이름}`으로 컴포넌트를 제공하면 `{주소}/{페이지 이름}` 형태로 접근 가능하도록 구성되어 있다. 위에서 검색 시, ``navigate(`/search?query=${query}`)``로 페이지를 이동하도록 구성했기 때문에, `src/pages/search.js`를 만들고 이 곳에 검색 결과를 구현할 예정이다.

```javascript
import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"

import Layout from "../components/layout"

const SearchComponent = ({ location }) => {

    const params = new URLSearchParams(location.search)
    const query = params.get('query')

    // TODO : 검색 기능 구현

    return (
        <Layout location={location}>
            <div>
            {query}
            </div>
        </Layout>
    )
}

export default SearchComponent
```

간단하게 요청 파라미터로 전달된 값을 받아온 후, 질의어를 정제한 다음 모든 문서와 비교하여 매칭이 되는 포스트를 `{query}` 대신 넣어주면 검색 기능은 끝난다.

#### 검색 기능 구현

완성된 코드는 다음과 같다.

```javascript
import * as React from "react"
import { Link, useStaticQuery, graphql } from "gatsby"
import { formatTime } from "../util/formatter"

import Layout from "../components/layout"

const regexToRefine = /[^@0-9a-zA-Z가-힣 _-]/g

const refineQuery = (query) => {

  const tokens = query.replaceAll(regexToRefine, " ").split(" ").map((token) => token.toLowerCase())

  return tokens.filter(token => {
    return token
  })
}

const SearchComponent = ({ location }) => {
  const params = new URLSearchParams(location.search)
  const query = params.get("query")
  const tokens = new Set(refineQuery(query))

  // 블로그 데이터 조회
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

  // 점수 계산
  posts.forEach((post) => {

    const { title, description, tags } = post.frontmatter
    const words = [...new Set([...refineQuery(title), ...refineQuery(description), ...tags].map((word) => word.toLowerCase()))]

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

  // 점수 기준 렌더링 및 기준 미달 제거
  const result = posts
    .filter(post => post.score > 0)
    .sort((post1, post2) => {
      if (post1.score === post2.score) {
        return post1.date > post2.date ? -1 : 0
      } else {
        return post1.score > post2.score ? -1 : 1
      }
    })

  // 결과 렌더링
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
```

구현한 내용에 대해서 하나씩 살펴보자.

```javascript
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
```

블로그 데이터 조회는 여느 쿼리와 비슷하게 `GraphQL`을 사용하며, 검색을 위해 필요한 `frontmatter` 필드를 추가한 것 외에는 크게 다를 것이 없다.

```javascript
const regexToRefine = /[^@0-9a-zA-Z가-힣 _-]/g

const refineQuery = (query) => {

  const tokens = query.replaceAll(regexToRefine, " ").split(" ").map((token) => token.toLowerCase())

  return tokens.filter(token => {
    return token
  })
}

const SearchComponent = ({ location }) => {

  posts.forEach((post) => {

    const { title, description, tags } = post.frontmatter
    const words = [...new Set([...refineQuery(title), ...refineQuery(description), ...tags].map((word) => word.toLowerCase()))]

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

  const result = posts.filter((post) => post.score > 0)
}
```

모든 포스트마다 검색에 사용할 단어를 추출하고 소문자로 변경한 다음 중복을 제거한 다음, 검색어 질의와 비교하여 포함되는게 있다면 1점 가산하는 방식으로 단순하게 계산했다. 아무래도 검색의 의도를 파악하기에 어려운 부분은 있더라도 쉽고 단순하게 구현 가능한 방법일 것이다.

만약 점수가 같다면 최신 데이터를 순차적으로 가져오도록 정렬했고, 0점인 항목은 제거하도록 했다.

```javascript
const SearchComponent = ({ location }) => {

  // 결과 렌더링
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
```

결과 렌더링은 `src/pages/index.js`의 내용을 거의 그대로 가져왔다. 모듈화를 해서 구성해도 좋은데, 혹시나 추후에 커스터마이징 할 여지가 있을까 싶어서 우선은 그대로 두었다.


### 4. 플러그인을 사용하게 된다면

이대로 끝내기에는 약간 아쉬워서 플러그인이 어떻게 동작할지를 살펴보았다.

우선 구현에 필요한 의존성을 설치해야 했기 때문에, 설치를 했고 이후에 관련 설정을 추가했다. [플러그인 설명 페이지](https://www.gatsbyjs.com/plugins/gatsby-plugin-local-search/)에 나온 대로 `gatsby-config.js`을 열고 아래와 같이 수정해보자.

```shell
npm install --save gatsby-plugin-local-search
```

```javascript
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-plugin-local-search',
      options: {

        name: 'pages',
        engine: 'flexsearch',
        engineOptions: 'speed',
        query: `
          {
            allMarkdownRemark {
              nodes {
                id
                frontmatter {
                  title
                  description
                  tags
                }
                rawMarkdownBody
              }
            }
          }
        `,

        ref: 'id',
        index: ['title', 'description', 'body', 'tags'],
        store: ['id', 'title', 'description'],
        normalizer: ({ data }) =>
          data.allMarkdownRemark.nodes.map((node) => ({
            id: node.id,
            title: node.frontmatter.title,
            description: node.frontmatter.description,
            tags: node.frontmatter.tags,
            body: node.rawMarkdownBody,
          })),
      },
    },
  ],
}

```

설정이 마무리된 후, 다음 쿼리를 날리면 아래 형태의 JSON이 나온다.

```
{
  localSearchPages {
    index
    store
  }
}
```

```javascript
{
  "data": {
    "localSearchPages": {
      "index": [
        [
          {
            "0":["f84ec0e5-c2a8-5b1e-99c4-62eb393a97e6","d0229a72-199f-5206-8a55-d87c76514208"],
            "n":["b2c7e184-b869-5c3c-9d28-4b72a0653bef"],
            ...
          }
        ]
      ],
      "store": {
        "f84ec0e5-c2a8-5b1e-99c4-62eb393a97e6": {
          "id": "f84ec0e5-c2a8-5b1e-99c4-62eb393a97e6",
          "title": "개츠비로 블로그 시작하기 - 커스터마이징 (2)",
          "description": "개츠비로 시작하는 블로그, 포스트에 목차를 추가하자"
        },
        "b1b8261f-595f-58e0-9cdd-ab41d00780da": {
          "id": "b1b8261f-595f-58e0-9cdd-ab41d00780da",
          "title": "개츠비로 블로그 시작하기 - 커스터마이징 (1)",
          "description": "개츠비로 시작하는 블로그, 글쓰기 기능을 추가해보자"
        },
        "d0229a72-199f-5206-8a55-d87c76514208": {
          "id": "d0229a72-199f-5206-8a55-d87c76514208",
          "title": "개츠비로 블로그 시작하기 - 개인화",
          "description": "개츠비로 시작하는 블로그, 블로그에 내 정보를 담아보자"
        },
        "fa584ab1-81a8-57ea-828c-a0b01e782191": {
          "id": "fa584ab1-81a8-57ea-828c-a0b01e782191",
          "title": "개츠비로 블로그 시작하기 - 설치 및 구동",
          "description": "개츠비로 시작하는 블로그, 실제로 설치해보고 작업 환경에서 돌려보자"
        },
        "ace6b2a0-ffbc-596d-9b02-296349141e2d": {
          "id": "ace6b2a0-ffbc-596d-9b02-296349141e2d",
          "title": "개츠비로 블로그 시작하기 - 커스터마이징 (3)",
          "description": "개츠비로 시작하는 블로그, 검색 기능을 추가하자"
        },
        "b2c7e184-b869-5c3c-9d28-4b72a0653bef": {
          "id": "b2c7e184-b869-5c3c-9d28-4b72a0653bef",
          "title": "개츠비로 블로그 시작하기 - 플랫폼 선정",
          "description": "개츠비로 시작하는 블로그, 어떤 플랫폼이 좋을까?"
        }
      }
    }
  },
  "extensions": {}
}
```

아마 `store`에 대한 정보는 결과로 제공받을 항목을 `id`를 키로 하는 `store` 객체에 보관되고, 토큰화 된 단어는 `index`에 저장된다. 보이는 형식은 객체 타입이지만 실제로는 문자열 형태로 저장되어 있는데 아마도 로직에서 관련 데이터를 `JSON.parse()`로 처리한 후, 별도의 로직으로 점수를 계산하여 결과를 도출하지 않을까 추측해본다.

### 5. 만약 별도의 검색 서버를 사용한다면 ?

아마도 서버를 사용하게 된다면 이렇게 구성할 것 같다.

- 웹훅을 걸어 블로그 레포지토리에 푸시를 감지하면 별도 서버에서 원문 데이터를 다운로드
- 원본 데이터를 색인, 검색할 수 있도록 `Sphinx`나 `ElasticSearch`에 추가
- 별도 API 서버를 띄워서 연결하고 블로그에서 제공할 수 있도록 구성

말은 쉬운데 제한된 환경에서 검색 기능을 제공하려니 아쉬운게 많았나보다.

### Reference

- https://yohanpro.com/posts/gatsby-search