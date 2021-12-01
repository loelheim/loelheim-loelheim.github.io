---
title: 개츠비로 블로그 시작하기 - 커스터마이징 (2)
description: 개츠비로 시작하는 블로그, 포스트에 목차를 추가하자
tags: ['gatsby','개츠비','blog','블로그','목차','Table of Contents','ToC']
date: 2021-11-28T17:18:24.838Z
---

### 1. ToC - Table of Contents란

쉽게 말해서 목차라고 보면 된다. 블로그를 찾다보면, 측면 상단 혹은 하단에 목차가 뜨는 것을 확인할 수 있다.

이게 그렇게 중요한 것은 아닐지 몰라도 포스트를 읽다보면 내용이 어떻게 구성되어 있는지 혹은 내가 어디쯤을 읽고 있는지 알고 싶을 때가 있다. 목차를 제공하는 것이 읽는 분이나 나를 위해서 도움이 될 것 같아 추가한다.

### 2. 쉽게 적용하는 ToC

우선 아래 의존성을 추가하자.

```shell
npm install --save gatsby-remark-autolink-headers
npm install --save gatsby-remark-table-of-contents
```

그리고 `gatsby-config.js`에 아래 내용을 추가해주자.

추가해 줄 내용은 `gatsby-remark-table-of-contents`, `gatsby-remark-autolink-headers` 부분이다.
관련 [플러그인 설명](https://www.gatsbyjs.com/plugins/gatsby-remark-table-of-contents/)에 나온 정보를 거의 그대로 사용했고, 필요하다 생각했던 부분만 간단하게 바꿨다.

```javascript
module.exports = {
  ...
  plugins: [
    ...
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          ...
          {
            resolve: `gatsby-remark-table-of-contents`,
            options: {
              exclude: "Table of Contents",
              tight: false,
              ordered: false,
              fromHeading: 3,
              toHeading: 4,
              className: "table-of-contents"
            },
          },
          `gatsby-remark-autolink-headers`,
          ...
        ],
      },
    },
  ],
}
```

그럼 설정은 끝이다.
이제 각 포스트마다 아래 내용을 추가해주면 알아서 목차가 추가된다.

````
```toc
```
````

만약에 포스트을 추가할 때마다 자동으로 목차가 반영되도록 하려고 한다면, `frontman` 스크립트의 템플릿을 수정하면 된다.
CSS로 위치나 디자인만 수정한다면 그런대로 쓸만하지 않나 싶다.

### 3. 그래도 뭔가 이건 좀 .. 

적용해보니 단순해서 좋긴 한데, 미리 찾아본 [블로그](https://blueshw.github.io/2020/05/30/table-of-contents/)에서는 뭔가 나이스한 디자인으로 구현하고 있다. (사실 CSS가 문제라는걸 모르는데 왜 외면하는 것인가 ...)

어쨋거나 저 방법도 적용해보고 싶어서 고민을 좀 해봤다.

- 우선 `GraphQL`로도 HTML 형태의 `ToC`를 뽑아내는 것은 가능
- 포스트 템플릿에 질의한 결과를 바탕으로 컴포넌트를 구성하면 비슷한 구조는 물론 인터랙션까지 구현 가능

일단은 가능한 것 같아 보이니 좀 살펴보도록 하자.

### 4. 직접 구현해보자

#### 커스텀 컴포넌트 추가

우선 위에서 추가했던 ` ```toc``` ` 블록은 제거하고 커스텀 컴포넌트를 만들어 사용할 것이다.
`src/components/toc.js` 파일을 추가하고 아래 내용을 입력하자.

```javascript
import * as React from "react"

const TableOfContents = (props) => {

    return (
        <div
            className="table-of-contents"
            style={{
                right: 'calc(10vw)',
                position: 'fixed',
                top: '180px',
            }}
            dangerouslySetInnerHTML={{ __html: props.contents }}>

        </div>
    )
}

export default TableOfContents
```

`<TableOfContents />`는 외부로부터 전달받은 `ToC` 정보를 주입하기 위한 컨테이너 역할을 하며 인터랙션을 위해 클래스를 미리 지정해둔다.

#### 포스트 레이아웃 수정

다음은 `src/templates/blog-post.js`의 내용을 수정하여 포스트의 레이아웃을 수정하자.

```javascript
import React, { useEffect } from "react"
...
import TableOfContents from "../components/toc"

const onScroll = () => {

  const items = document.querySelectorAll('.table-of-contents a')
  
  const headers = [
      ...document.querySelectorAll('.blog-post h3'),
      ...document.querySelectorAll('.blog-post h4')
  ]

  const filtered = headers.filter((header) => header.getBoundingClientRect().top <= 30)

  if (filtered.length > 0) {

      const maxKey = Object.keys(filtered).reduce((k1, k2) => filtered[k1].getBoundingClientRect().top > filtered[k2].getBoundingClientRect().top ? k1 : k2)
      const currentHeader = filtered[maxKey].innerText

      items.forEach((item) => {
          if (item.innerText === currentHeader) {
              item.classList.add('active')
          } else {
              item.classList.remove('active')
          }
      })
  } else {
    items.forEach((item) => item.classList.remove('active'))
  }
}

const BlogPostTemplate = ({ data, location }) => {
  
  ...
  
  useEffect(() => {
    document.addEventListener('scroll', onScroll)
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <Layout>
      <Seo/>
      <article>...</article>
      <nav>...</nav>
      <TableOfContents
        contents={post.tableOfContents}
        />
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query (
    $id: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    ...
    markdownRemark(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      html
      tableOfContents
      frontmatter {
        title
        date
        description
      }
    }
    ...
  }
`
```

주요 변경 사항을 요약해보면 다음과 같다.

- import 추가

  - 컴포넌트가 사용이 종료되는 시점에 리스너를 해제할 수 있도록 돕는 `useEffect` Hook API 호출
  - 목차 정보를 주입하기 위한 `<TableOfContents />` 커스텀 컴포넌트

- 구현

  - 스크롤 위치에 따라 `ToC`의 포커싱 인터랙션을 처리해 줄 이벤트 리스너인 `onScroll` 구현
  - `BlogPostTemplate`에 이벤트 리스너 등록 및 해제 로직을 바인딩 하기 위해 `useEffect` 호출

- 스펙 변경

  - 쿼리에 `tableOfContents` 항목 추가

### 5. 변경 사항 자세히 보기

#### 쿼리 변경 사항

먼저 쿼리를 자세히 보면 `markdownRemark` 하위에 `tableOfContents`를 추가했는데, `ToC`로 구성할 항목을 HTML 형태로 반환하는 것을 확인할 수 있다.

```
query {
  markdownRemark(id : { eq: "b2c7e184-b869-5c3c-9d28-4b72a0653bef" }) {
		tableOfContents
  }
}

{
  "data": {
    "markdownRemark": {
      "tableOfContents": "<ul>\n<li>\n<p><a href=\"#1-%EB%93%A4%EC%96%B4%EA%B0%80%EA%B8%B0%EC%97%90-%EC%95%9E%EC%84%9C\">1. 들어가기에 앞서</a></p>\n</li>\n<li>\n<p><a href=\"#2-%EA%B0%9C%EC%B8%A0%EB%B9%84%EB%9E%80\">2. 개츠비란</a></p>\n</li>\n<li>\n<p><a href=\"#3-%EC%9E%A5%EB%8B%A8%EC%A0%90-%EB%B6%84%EC%84%9D\">3. 장단점 분석</a></p>\n<ul>\n<li><a href=\"#%EC%9E%A5%EC%A0%90\">장점</a></li>\n<li><a href=\"#%EB%8B%A8%EC%A0%90\">단점</a></li>\n</ul>\n</li>\n<li>\n<p><a href=\"#4-%EC%84%A0%ED%83%9D-%EA%B8%B0%EC%A4%80\">4. 선택 기준</a></p>\n</li>\n</ul>"
    }
  },
  "extensions": {}
}
```

이는  ` ```toc``` ` 블록의 내용과 동일하며 커스텀 컴포넌트의 내용을 채워넣을 목적으로 사용한다. 별도 컴포넌트로 분리한 이유는 위치나 마크업 등 설정을 조금 자유롭게 하기 위함이다.

#### onScroll 이벤트

```javascript
const onScroll = () => {

  const items = document.querySelectorAll('.table-of-contents a')
  
  const headers = [
      ...document.querySelectorAll('.blog-post h3'),
      ...document.querySelectorAll('.blog-post h4')
  ]

  const filtered = headers.filter((header) => header.getBoundingClientRect().top <= 30)

  if (filtered.length > 0) {

      const maxKey = Object.keys(filtered).reduce((k1, k2) => filtered[k1].getBoundingClientRect().top > filtered[k2].getBoundingClientRect().top ? k1 : k2)
      const currentHeader = filtered[maxKey].innerText

      items.forEach((item) => {
          if (item.innerText === currentHeader) {
              item.classList.add('active')
          } else {
              item.classList.remove('active')
          }
      })
  } else {
    items.forEach((item) => item.classList.remove('active'))
  }
}
```

`items`는 `ToC`의 항목을 의미하며, `headers`는 본문 내의 헤더 목록을 의미한다. 스크롤 로직의 주요 포인트는 가장 최근에 지난 헤더의 내용과 `ToC` 항목 중 내용이 일치하는 대상의 클래스만 활성화하고 나머지는 비활성화하는 것이다.

`headers`의 `getBoundingClientRect().top`가 임계점 (여기서는 30) 이하로 내려간 대상을 추출하고, 그 중에서 가장 큰 값을 출력하면 가장 최근에 지나간 헤더 노드를 추출할 수 있다. 임계점의 크기를 조절하면 해당 섹션이 읽혀지기 시작하는 지점을 변경할 수 있다.

`headers`와 `items`를 비교할 방법이 텍스트 비교밖에 없기 때문에 선정한 헤더의 내용을 저장해두고 `items`를 순회하면서 내용이 맞는 대상을 찾으면 된다.

#### 포스트 템플릿 수정

```javascript
const BlogPostTemplate = ({ data, location }) => {
  
  const post = data.markdownRemark
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const { previous, next } = data
  
  useEffect(() => {
    document.addEventListener('scroll', onScroll)
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <Layout>
      <Seo/>
      <article>...</article>
      <nav>...</nav>
      <TableOfContents
        contents={post.tableOfContents}
        />
    </Layout>
  )
}
```

달라진 부분이라면 `useEffect`라는 메서드가 호출되는 부분인데, `리액트`의 Hook API로 컴포넌트가 렌더링 된 이후에 수행할 로직 (스크롤 이벤트 등록)을 전달하고, 제거되기 전에 수행할 로직 (스크롤 이벤트 제거)을 전달하면 스크롤 이벤트가 정상적으로 등록/해지되는 것을 볼 수 있다.

이로써 `ToC`에 대한 커스터마이징까지 얼추 끝냈다.

### 6. CSS 스타일링

```css
.table-of-contents {
  padding-left: 0;
  border-left: 1px solid #efefef;
  position: sticky;
  top: 2rem;
  align-self: start;
}

.table-of-contents a {
  text-decoration: none;
  display: block;
  padding: .125rem 0;
  color: #ccc;
  transition: all 50ms ease-in-out;
}

.table-of-contents a:hover,
.table-of-contents a:focus {
    color: #666;
}

.table-of-contents ul,
.table-of-contents ol {
  list-style: none;
  margin: 0;
  padding: 0;
}

.table-of-contents li {
  margin-left: 1rem;
}

.table-of-contents .active {
  color: #333;
  font-weight: 500;
}

@media screen and (max-width: 110rem) {
  .table-of-contents {
    display: none;
  }
}
```

화면 크기에 따라서 목차를 보여줄지 결정하는 미디어 쿼리 외에는 특별한 부분은 없다.

### 7. 추후에 하면 좋을 것들

위 스크롤 로직은 사용하는데에 큰 불편함은 없지만 마지막 헤더의 경우에는 스크롤을 할 수 있는 영역이 없을 수 있기 때문에 하이라이팅이 되지 않는 이슈가 있다.

사실 크게 중요하지 않다고 생각해서 별도의 예외처리를 하지는 않았는데 만약 이런 부분이 조금 불편하다면 마지막 노드에 대한 처리만 해준다면 정상적으로 동작할 것이다.

또한 위에서 수정한 쿼리를 보면 `timeToRead`도 컨텐츠의 내용에 맞게 내려주는 것을 볼 수 있다. 가능하다면 이 값과 현재 스크롤되는 위치 등을 계산해서 표기해주면 조금 더 읽는데 도움이 되지 않을까 싶다.

### Reference

- https://blueshw.github.io/2020/05/30/table-of-contents/