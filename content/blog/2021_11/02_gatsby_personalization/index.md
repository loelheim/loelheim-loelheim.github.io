---
title: 개츠비로 블로그 시작하기 - 개인화
description: 개츠비로 시작하는 블로그, 블로그에 내 정보를 담아보자
tags: ['gatsby','개츠비','blog','블로그']
date: 2021-11-24T17:33:21.338Z
---

### 1. 들어가기에 앞서

이번 커스터마이징은 기본 소스의 구조를 파악해볼겸 스타터를 통해 만든 기본 템플릿에서 변경할 부분을 찾아서 수정한다.
기능적으로 필요한 부분은 별로 없겠지만, 블로그의 메타 정보나 사용자 정보를 변경하는 것이기 때문에 해두는 것이 좋을 것 같다.

자세히는 몰라도 `리액트`, `GraphQL`은 알고 있기 때문에 간단한 수정으로 해결 가능했다.
각 항목에 대해서는 나중에 기회가 된다면 자세히 다룰 예정이기 때문에 여기서는 문법 설명은 따로 안할 예정이다.
그거까지 설명하려면 제 풀에 지쳐서 또 블로그 쓰다가 포기할 지 모르기 때문에 ...

### 2. 라이센스 변경

`BSD`로도 충분하지만, 2차 라이선스에 대해서 굳이 닫아두고 싶은 생각은 없다.
나도 여기저기 블로그나 레퍼런스 보면서 정리하는 주제에 ... `LICENSE` 파일의 내용을 `MIT` 라이센스 내용으로 변경했다.

### 3. 사용자화

`package.json`에는 기본적인 블로그 소유자에 대한 정보가 포함되어 있다.
기본 정보는 어렵지도 않으니 가능하면 변경하도록 하자. `나 블로그 관리 잘 안해요`라고 어필하려면 그대로 둬도 좋고.

```javascript
{
    "name": "loel",
    ...
    "description": "loelheim.io",
    ...
    "author": "loel <loelheim.io@gmail.com>",
    "bugs": {
        "url": "https://github.com/loelheim/loelheim.github.io/issues"
    },
    ...
    "homepage": "https://loelheim.github.io", 
    "keywords": [
        "develop", "gatsby"
    ],
    "license": "MIT",
    "repository": {
       "type": "html",
       "url": "https://loelheim.github.io"
    },
}
```

나는 트위터를 사용하지 않는다. 당장은 어떤 소셜 네트워크도 연결할 생각이 없어서 관련된 데이터를 지우려고 한다.
해당 정보는 `gatsby-node.js`의 `createSchemaCustomization`에서 관리되는데, 관련 스키마 중 `Social`이 포함된 항목과 선언을 지웠다.
또한 `src/components/seo.js`에도 `Social`가 포함되어 있으니 함께 지워주는게 좋다.

만약에 인스타그램이나 페이스북 등의 정보를 추가하고 싶다면 위의 내용과 `gatsby-config.js`의 `siteMetadata`를 수정하면 된다.

`gatsby-config.js` 파일에도 개인적인 내용을 수정할 수 있다.
추측이긴 하지만 대략적인 모양새가 `createSchemaCustomization`에서 선언한 타입을 따라가는 것 같다.
참고로 이전 버전에서는 `gatsby-meta-config.js` 파일이 분리되어서 따로 있었던 것 같은데 최신 버전 (4.2.0) 기준으로는 통합된 것 같다.

`siteMetadata`의 정보와 함께 스타터에서 제공하는 데이터들은 일괄 변경하도록 하자.

```javascript
module.exports = {
  siteMetadata: {
    title: `loelheim`,
    author: {
      name: `loel`,
      summary: `Backend developer`,
    }, 
    description: `loelheim.io`,
    siteUrl: `https://loelheim.github.io/`,
  },
  ...
  plugins: [
    .. 
    {
        resolve: `gatsby-plugin-feed`,
        options: {
            query: `...`,
            feeds: [
                {
                    serialize: ...,
                    query: ...,
                    output: "/rss.xml",
                    title: "RSS Feed",
                },
            ],
        },
    },
    {
        resolve: `gatsby-plugin-manifest`,
        options: {
            name: `loelheim`,
            short_name: `loel`,
            start_url: `/`,
            ...
        },
    },
    `gatsby-plugin-react-helmet`,
    ...
  ]
}
```

`src/components/bio.js`에는 `gatsby-config.js`에 포함된 작성자의 정보를 기반으로 사용자 정보를 제공한다.
`<Bio />`의 설명 문구를 취향에 맞게 수정하고, 그에 따라 필요없는 정보를 `GQL`에서 제외했다.
당장에는 프로필 정보로 사용할만한 이미지가 없는데, 경로를 직접 수정해도 되고 같은 이름으로 덮어 써도 될 것 같다.

```jsx

import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

const Bio = () => {
  // siteMetadata 하위의 social 항목 제거
  const data = useStaticQuery(graphql`
    query BioQuery {
      site {
        siteMetadata {
          author {
            name
            summary
          }
        }
      }
    }
  `)

  // Set these values by editing "siteMetadata" in gatsby-config.js
  const author = data.site.siteMetadata?.author
  // 주석 처리 or 제거
  // const social = data.site.siteMetadata?.social

  return (
    <div className="bio">
      <StaticImage
        className="bio-avatar"
        layout="fixed"
        formats={["auto", "webp", "avif"]}
        src="../images/profile-pic.png"
        width={50}
        height={50}
        quality={95}
        alt="Profile picture"
      />
      {author?.name && (
        <p>
          <!-- 변경 -->
          Written by <strong>{author.name}</strong> <br/>{author?.summary || null}
        </p>
      )}
    </div>
  )
}

export default Bio
```

### 4. 레이아웃 수정

하단에 붙은 카피라이트 문구 및 `개츠비`의 도움을 받았다는 부분을 갱신하기 위해 다음을 추가했다.

- `useStaticQuery`, `graphql` 선언문을 추가한다.
- `src/components/bio.js`와 동일하게 `GraphQL` 쿼리를 추가한다.
- 렌더링 부분을 수정하여 원하는 형식으로 변경한다.

```jsx
import * as React from "react"
import { Link, useStaticQuery, graphql } from "gatsby"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  const data = useStaticQuery(graphql`
    query SiteQuery {
      site {
        siteMetadata {
          author {
            name
          }
        }
      }
    }  
  `)
  const author = data.site.siteMetadata?.author

  let header

  if (isRootPath) {
    header = (
      <h1 className="main-heading">
        <Link to="/">{title}</Link>
      </h1>
    )
  } else {
    header = (
      <Link className="header-link-home" to="/">
        {title}
      </Link>
    )
  }

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <header className="global-header">{header}</header>
      <main>{children}</main>
      <footer>
        Copyright © {new Date().getFullYear()} {author?.name || title} All rights reserved. <br />
        Built with {` `} <a href="https://www.gatsbyjs.com">Gatsby</a>
      </footer>
    </div>
  )
}

export default Layout
```

이미 `src/components/bio.js`에서 `BioQuery`라는 항목을 선언했기 때문에 동일하게 복사해서 넣으면 충돌 에러가 발생한다.
때문에 우선 일시적으로 `BioQuery` 대신 `SiteQuery`로 이름을 변경했다.
만약 이렇게 중복되는 쿼리가 발생한다면 별도로 모아서 사용하는 것이 좋을 것 같다.

### 5. 날짜 포맷 변경

현재 날짜 포맷은 뭔가 한국인에게 친절하지도 않다.
이를 위해서 별도의 포맷을 위한 메서드를 구성하고 목록과 상세 페이지에 반영해보자.

우선 의존성을 먼저 추가하자.

```shell
npm install --save moment
npm install --save moment-timezone
```

이후에 `src/util/formatter/index.js` 파일을 추가하고 포맷 변경을 위한 메서드를 추가하자.
나 같은 경우에는 설정된 값이 한국 시간 기준으로 출력될 수 있도록 타임존을 변경하고 포맷을 다음과 같이 설정하도록 했다.

```javascript
import Moment from "moment"
import "moment-timezone"

export const formatTime = (date) => {
  return Moment(date, Moment.ISO_8601).tz("Asia/Seoul").format("YYYY년 MM월 DD일 HH:mm:ss")
}
```

포맷 변경을 위한 메서드가 만들어졌으니 포스트 템플릿에 반영해보자.
`src/templates/blog-post.js` 파일을 열고 `post.frontmatter.date`를 출력하는 부분을 메서드로 감싸주고 하단의 스키마를 수정해서 포맷한 결과가 아닌 원본 그대로를 받도록 수정한다.

```javascript
import { formatTime } from "../util/formatter"

...

const BlogPostTemplate = ({ data, location }) => {
  
  const { previous, next } = data

  return (
    <Layout location={location} title={siteTitle}>
      <Seo />
      <article>
        <header>
          <h1 itemProp="headline">{post.frontmatter.title}</h1>
          <p>{formatTime(post.frontmatter.date)}</p>
        </header>
        ...
      </article>
    </Layout>
  )
}

export const pageQuery = graphql`
  query (
    $id: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    markdownRemark(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date // date(formatString: "MMMM DD, YYYY")에서 변경
        description
      }
    }
    ...
  }
`
```

목록 페이지인 `src/pages/index.js`도 유사한 방식으로 수정하면 날짜가 보기 편하게 변경된다.

### 6. 스타일 및 폰트 수정

기본적으로 세팅된 스타일은 그다지 내 취향은 아니다.
CSS에 대해서는 거의 아는 바가 없지만 간략하게 몇 가지를 수정해보려고 한다.

전반적인 스타일은 `src/style.css`에서 수정할 수 있으며, 컨텐츠의 크기와 폰트를 다음과 같이 변경했다.

```css
@import url(http://fonts.googleapis.com/earlyaccess/notosanskr.css);

...

:root {
  ...
  --maxWidth-wrapper: var(--maxWidth-3xl);
  ...
  //   --fontFamily-sans: Montserrat, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  // --fontFamily-serif: "Merriweather", "Georgia", Cambria, "Times New Roman", Times, serif;
  // --font-body: var(--fontFamily-serif);
  // --font-heading: var(--fontFamily-sans);
  // 
  --fontFamily:  -apple-system, BlinkMacSystemFont, "Noto Sans KR", "Helvetica Neue", "Roboto", "Segoe UI", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", sans-serif;
  --font-body: var(--fontFamily);
  --font-heading: var(--fontFamily);
}
```

세리프 폰트 구분은 따로 하지 않았으며, `--font-heading`, `--font-body` 모두 동일하게 적용했다.
참고로 맥에서는 기본 시스템으로 너무 예쁘게 잘 나왔는데 다른 환경에서 어떻게 보일지 몰라서 `Noto Sans KR` 폰트를 추가했다.

### 7. 미사용 파일 제거

타입스크립트를 사용하지 않는다면 `src/pages/using-typescript.tsx`를 지워도 된다.
또한 `content/blog` 하위에는 샘플로 제공되는 포스트 파일들이 제공되는데 굳이 남길 이유가 없다면 지우도록 하자.


이제 기본적인 사용자화가 얼추 끝났다.
다음 포스트에서는 플러그인을 활용하여 블로그를 커스터마이징 해보자.