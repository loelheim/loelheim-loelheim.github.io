---
title: 개츠비로 블로그 시작하기 - 커스터마이징 (1)
description: 개츠비로 시작하는 블로그, 글쓰기 기능을 추가해보자
tags: ['gatsby','개츠비','blog','블로그','글쓰기']
date: 2021-11-26T12:36:31.057Z
---

### 1. 들어가기에 앞서

지금까지 변경한 내용은 기본적인 파일을 수정하는 것에 불과하다.
하지만 스타터로 시작했음에도 불구하고 여전히 타 블로그 플랫폼에 비하면 제공하는 것이 너무나도 적다.

그래서 직접 코드를 추가해야만 제대로 된 기능을 사용할 수 있다.
간단하게 글 쓰기 위해 시작한 것이지만 오히려 커스터마이징을 위해 삽질하는 꼴이라니 ... 어쨋거나 시작한 이상 끝을 봐야겠다.

### 2. 블로그 템플릿

`templates/blog-post.js`는 포스트의 레이아웃을 지정하는 레이아웃 파일이다.
여기에 코드를 추가하여 원하는 형태의 페이지를 구성할 수 있다.

### 3. 추가할 기능 리스트업

작업하기 전에 내가 원하는 기능을 먼저 나열해보는 것이 좋을 것 같다.
이전에 봤던 스타터에서 참고하여 내가 추가하고자 하는 기능을 나열해봤다.

- 글쓰기 기능 추가
- TOC - Table of Contents
- 태그 관련 기능
- 댓글
- 검색

어떤 기능을 구현하려고 하더라도 글 작성이 되어야 다른 작업들이 가능하기 때문에 글쓰기 기능부터 추가하는 것이 좋을 것 같다.

### 4. 글쓰기 기능 분석

블로그 데이터는 `content/blog` 하위에 있으며, 두 가지 방식으로 구성 가능하다.

- `{블로그 제목}` 으로 폴더 이름을 정하고 하위에 `index.md` 파일을 추가하는 방식
- `{블로그 제목}.md` 단일 파일 방식

첨부 파일을 포스트마다 관리하려면 폴더 형태로 관리하는 방식이 조금 더 나아보인다.

이미 지웠을지도 모르겠지만 `content/blog`에 있던 샘플 포스트를 보다보면 `--- ~ ---` 사이에 포스트의 요약 정보를 표현하는 데이터가 존재한다. 예를 들면 이런 식이다.

```markdown
---
title: 개츠비로 블로그 시작하기 - 플랫폼 선정
description: 개츠비로 시작하는 블로그, 어떤 플랫폼이 좋을까?
date: 2021-11-23T16:24:42.627Z
---
```

해당 정보를 `Frontmatter`라고 하는 것 같다.
`gatsby-node.js`의 `createSchemaCustomization`에 선언된 `Frontmatter` 스키마로 형태가 정의되는데, 스키마를 확장하여 태그를 지정하고 그에 맞는 템플릿을 불러오도록 하는 경우도 있다.

블로그의 메타 데이터를 기록하는 것을 포함하여 제목을 여기서 새로 정의하는 것도 가능하다.
하지만 `Frontmatter`에서 제목을 수정하더라도 접근 경로는 파일명으로 접근 가능하니 이 부분은 알아두면 좋다.  

결국에 글쓰기 기능이라는 것은 아래 두 가지를 구현하면 된다.

- 블로그 작성에 필요한 폴더 추가 및 `index.md` 추가
- `Frontmatter`를 자동으로 추가해주는 스크립트 혹은 기능

참고로 공식 홈페이지에서 [관련 플러그인 라이브러리를 찾아보니](https://www.gatsbyjs.com/plugins/?=frontmatter) 마땅한 것은 없었고, 스타터를 여럿 분석하다보니 `Frontmatter`를 포함해서 글을 작성해주는 기능을 [gatsby-post-gen](https://github.com/JaeYeopHan/gatsby-post-gen) 라는 별도로 분리된 플러그인을 찾았다.
`개츠비`에 대한 의존성도 없어보였고, 해당 플러그인을 설치하고 관련 커맨드를 추가하면 쉽게 사용할 수 있다.

~~하지만 해당 플러그인은 추후에 구현할 태그에 대한 메타 정보를 추가하려면 수정이 필요했고, 카테고리의 물리적 경로와 메타 정보가 결합된 구조인 것 같아서 새로 만드는게 좋겠다고 생각했다.~~

원래 카테고리라는 필드를 새로 파서 할당하는 식으로 구성하려고 했는데, 블로그 컴파일 타임 시점 외에는 `개츠비`의 정보를 받아올 방법이 없었다. `GraphQL`로 다 되는줄 알았는데 구현해놓고 보니 아래 같은 에러가 뜬다.

```
/Users/loel/Documents/blog/loelheim/node_modules/gatsby/cache-dir/commonjs/gatsby-browser-entry.js:106
  throw new Error(`It appears like Gatsby is misconfigured. Gatsby related \`graphql\` calls ` + `are supposed to only be evaluated at compile time, and then compiled away. ` + `Unfortunately, something went wrong and the query was left in the compiled code.\n\n` + `Unless your site has a complex or custom babel/Gatsby configuration this is likely a bug in Gatsby.`);
        ^

Error: It appears like Gatsby is misconfigured. Gatsby related `graphql` calls are supposed to only be evaluated at compile time, and then compiled away. Unfortunately, something went wrong and the query was left in the compiled code.

Unless your site has a complex or custom babel/Gatsby configuration this is likely a bug in Gatsby.
    at graphql (/Users/loel/Documents/blog/loelheim/node_modules/gatsby/cache-dir/commonjs/gatsby-browser-entry.js:106:9)
    at inquiryCategory (/Users/loel/Documents/blog/loelheim/scripts/frontman/index.js:90:40)
    at /Users/loel/Documents/blog/loelheim/scripts/frontman/index.js:203:28
    at processTicksAndRejections (node:internal/process/task_queues:96:5)
```
뭔가 컴파일 처리가 된 시점에만 설정같은게 잘 동작하는 구조이며, 서버를 띄웠을 때 쿼리에 응답할 수 있는 것 같으니 아쉽지만 이 기능은 생략해야 할 것 같다.

참고로 전반적인 구조와 코드에 대해서는 후술하겠지만, 대략 이런 코드를 작성하려고 했었다. 쿼리는 에디터에서 잘 동작했었기 때문에 나름 아쉬웠다. 

```javascript
const inquiryCategory = async () => {

    const data = useStaticQuery(graphql`
        query {
          allMarkdownRemark {
            edges {
              node {
                frontmatter {
                  category
                }
              }
            }
          }
        }
    `)

    const categories = data.allMarkdownRemark.edges.map((edge) => edge.node.frontmatter.category)
    const choices = [CATEGORY_NEW, ...new Set(categories)]

    const { category } = await inquirer.prompt({
        type: 'list',
        name: 'category',
        choices
    })

    if (category !== CATEGORY_NEW) {

        const { newCategory } = await inquirer.prompt({
            type: 'input',
            name: 'newCategory',
            validate: (value) => {

                if (!value) {
                    return '⚠️  category is empty !'   
                }

                if (value === CATEGORY_NEW) {
                    return '⚠️  category is invalid !'   
                }

                if (categories.indexOf(value) !== -1) {
                    return '⚠️  same category already exists !'   
                }

                return true
            }
        })

        return newCategory
    }

    return category
}
```

어쨋거나 글쓰기 기능에 필요한 부분을 검토해보면 아래 프로세스와 같이 진행되면 될 것으로 보인다.

- `Frontmatter`를 구성하는 데이터를 입력받을 수 있도록 cli 형태로 구성한다.

    - 제목 (String) : 필수로 입력하도록 유도
    - 설명 (String?) : 빈 값이어도 통과
    - 파일명 (String) : 빈 값이면 제목을 활용하며, 파일 경로로 적합하지 않으면 재입력
    - 날짜 (String) : 포스트를 생성하는 시점에 자동 생성하여 ISO 포맷으로 생성
    - 태그 (Array<String>?) : `,` 단위로 분리하고 양 끝에 포함된 공백만 제거

- 입력받은 데이터와 포맷을 고려하여 새로운 포스트를 위한 폴더와 파일을 생성한다.
- cli 커맨드로 위 프로세스가 실행될 수 있도록 연결한다.

대략적으로 입력한 결과에 유형별로 검증 메서드를 인자로 제공하고 정제하는 과정을 거친 결과를 모아둔 후, 이 결과를 바탕으로 폴더랑 파일을 생성하고 `Frontmatter`를 추가하면 끝날 것 같다.

### 5. 글쓰기 기능 구현

모든 개발 작업에서 가장 어려운 부분은 `작명`이다.

일단 블로그에 필요한 가장 처음 단계에 해당하기도 하고, `Frontmatter`랑 비슷하게 이름 지으려고 하다보니 `Frontman`이 생각났다.
그래서 `scripts/frontman` 폴더를 추가하고 안에 `index.js` 파일을 추가했다.

그 다음에는 `npm` 커맨드를 추가했다.
`script` 블록에 `"post": "node scripts/frontman",`를 추가하면 `npm run post`로 `index.js`의 내용을 수행할 수 있다.

이제 `Frontmatter` 스키마에 정보를 추가할 차례다.

`gatsby-node.js`의 `createSchemaCustomization`에 있는 `createTypes`을 보면 관련 스키마가 정의되어 있는 것을 볼 수 있다. 여기에 `tags` 정보를 추가하면 끝이다.  

```
type Frontmatter {
  title: String
  description: String
  tags: [String]
  date: Date @dateformat
}
```

다음은 로직의 기본적인 뼈대를 보자. 필요한 정보들을 사용자에게 전달받아서 파일을 생성하는 단순한 구조라 보면 되겠다. 

```javascript
module.exports = (async () => {

    const now = new Date()
    const title = await inquiryTitle()
    const description = await inquiryDescription()
    const path = await inquiryPath(title, now)
    const tags = await inquiryTags()
    const date = now.toISOString()

    const frontmatter = {
        title,
        description,
        tags,
        date
    }

    createFrontmatter(path, frontmatter, now)
})()
```

다음은 제목을 입력받는 메서드인 `inqueryTitle`를 살펴보자.

```javascript
const inquiryTitle = async () => {

    const { title } = await inquirer.prompt({
         type: 'input',
         name: 'title',
         validate: (value) => {

            if (!value || value.trim() === '') {
                return '⚠️  title is empty !'
            }

            if (value === '.' || value === '..') {
                return '⚠️  title is invalid !'
            }

            return true
         }
    })

    return title.trim()
}
```

입력을 받기 위해서 `inquirer`를 사용했는데, 이미 `개츠비`에서 쓰고 있어서 별도로 의존성을 설치할 필요는 없었다.
이번 글쓰기 기능 추가를 위해 `inquirer`를 사용하는데 있어서 주로 관심을 가질만한 부분은 다음과 같다.

- type: 입력 형식을 의미하며 `input`, `list` 만으로도 충분히 구현 가능
- name: 입력할 데이터의 키 값을 의미하며, 받아온 결과를 `구조 분해 - destructuring`할 값으로 사용
- validate: 들어온 값을 검증할 목적으로 사용하며, `return true`를 받지 않는 경우에 대해서는 안내 메시지로 튕긴 후 재입력을 받도록 함
- default : 입력 시 기본 값을 지정
- choices: `type = list`일 때, 선택할 목록을 지정

모든 데이터가 위 내용으로 충분히 커버되기 때문에 이후에는 이와 관련된 로직을 따로 설명하진 않을 것이다.
`title`을 경로로 사용하게 된다면 `현재 폴더 - .`와 `상위 폴더 - ..`를 사용할 수 없기 때문에 이에 대한 로직만 추가했다. 

다음은 `description` 내용이며, 해당 정보는 필수가 아니기 때문에 별다른 로직이 없다.

```javascript
const inquiryDescription = async () => {

    const { description } = await inquirer.prompt({
        type: 'input',
        name: 'description'
   })

   return description?.trim()
}
```

그나마 작업을 하는데 공을 들였던(?) 파일 경로 설정이다.
기존 스타터는 제목을 정규화하고 불필요한 텍스트를 제거해서 파일으로 사용했는데, 나는 직접 입력받기로 했으며 아래 내용을 고려했었다.

- 직접 파일명을 지정하고 싶었으며, 귀찮을 것을 대비해 제목을 `default` 인자로 제공하여 기본값을 세팅하면 좋겠다
- 포스트마다 폴더 단위로 구성하고 그 안에 리소스가 있었으면 하는 생각이 들어 단일 파일 구조보다는 폴더 구조를 고려했다
- 이런 구조의 특성상 경로 중복 체크도 포함되면 좋겠단 생각이 들었다

```javascript
const inquiryPath = async (title, date) => {

    const { pathname } = await inquirer.prompt({
        type: 'input',
        name: 'pathname',
        default: title,
        message: 'pathname (alphanumeric except some special characters): ',
        validate: (value) => {

            if (!value) {
                return '⚠️  pathname is empty !'
            }

            if (!validPath(value)) {
                return '⚠️  pathname is invalid !'
            }

            const destination = buildDestinationPath(value, date)

            try {

                fs.accessSync(destination, fs.constants.R_OK | fs.constants.W_OK)
                return '⚠️  pathname is in use !'

            } catch(e) {
            }

            return true
        }
    })

    return refinePath(pathname)
}
```

alpha-numeric 값과 일부 값만 허용한다고 안내를 했으나 사실 정규식으로 허용하는 문자열을 상당히 제한했으며, 이는 `validPath`와 `refinePath`에 잘 녹여져 있다.
정규식에서는 숫자, 영어, 한글, 공백, 소괄호 및 하이픈만 허용하기로 했으며, 마지막에서 정제할 때 해당 문자를 모두 언더스코어로 대체하게끔 구성했다.

```javascript
const directory = '/content/blog'
const regexPath = /^[0-9a-zA-Z가-힣 \(\)\-_]+$/
const regexToRefine = /[^0-9a-zA-Z가-힣 \(\)\-]/g

const validPath = (path) => {
    return regexPath.test(path)
}

const refinePath = (path) => {
    return path.replaceAll(regexToRefine, '_')
}

const buildDestinationPath = (pathname, date) => {
    return path.join(process.cwd(), directory, `${date.getFullYear()}_${date.getMonth() + 1}`, pathname)
}
```

`buildDestinationPath`에서는 날짜를 받아서 처리하는데, 아무래도 상위에 카테고리가 없는 구조로 작업하다보니 너무 파일이 관리가 안될 것 같다는 생각에 `작성연월`까지만 폴더 단위로 구성하기로 생각했고 해당 경로가 있는지 여부를 `fs.accessSync`로 체크했다. 

거의 다 끝났다. 태그는 `inquirer`의 도움을 받기 쉽지 않아서 단일 문자열로 받고 정제해서 사용하기로 했다. 가장 간편한건 콤마로 구분하고 공백을 제거하여 배열 형태로 구성하는 것이다.

```javascript
const inquiryTags = async () => {
    
    const { tags } = await inquirer.prompt({
        type: 'input',
        name: 'tags',
        message: 'tags (multiple tags concatenated with comma): ',
        validate: (value) => {

            if (!value) {
                return '⚠️  tag string is empty !'
            }

            return true
        }
    })

    return tags?.split(',').map(tag => tag.trim())
}
```

최소한 태그를 하나 이상 지정하여 카테고리의 역할을 겸하도록 했으며, 들어온 문자열을 콤마로 구분한 후 `trim` 메서드로 공백을 제거하면 간단하게 해결된다.

마지막으로 실제로 생성하는 로직이다.

```javascript

const createFromTemplate = (frontmatter) => {
    return `---
title: ${frontmatter.title}
description: ${frontmatter.description}
tags: [${frontmatter.tags.map((tag) => `'${tag}'`)}]
date: ${frontmatter.date}
---`
}

const printFrontmatter = (frontmatter) => {

    const contents = [
        ``,
        ` > title: ${frontmatter.title}`,
        ` > description: ${frontmatter.description || ''}`,
        ` > tags: ${frontmatter.tags}`,
        ` > date: ${frontmatter.date}`,
        ``,
        ` 🚀  now your new post is ready !`,
        ``
    ]

    console.log(contents.join('\n'))
}

const createFrontmatter = (pathname, frontmatter, date) => {

    const contents = createFromTemplate(frontmatter)
    const destination = buildDestinationPath(pathname, date)
    const filepath = path.join(destination, 'index.md')

    try {
        fs.mkdirSync(destination, { recursive: true })
        fs.writeFileSync(filepath, contents)

        printFrontmatter(frontmatter)
    } catch(e) {
        console.error('🚨  something went wrong !')
    }
}

```

전달받은 정보를 형식에 맞게 채워넣어 `Frontmatter` 정보를 생성하고 지정한 경로 및 파일 이름의 폴더를 만든 다음 `index.md`에 생성한 데이터를 써넣으면 모든 과정이 끝난다.
그 외의 나머지 내용은 보기 좋으라고 만든 것이니 생략 ...

얼추 글쓰기는 완료된 것 같으니 `TOC - Table of Contents` 기능을 추가해보자.

### Reference

- https://github.com/JaeYeopHan/gatsby-post-gen