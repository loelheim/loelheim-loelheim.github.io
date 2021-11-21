const fs = require("fs")
const inquirer = require("inquirer")
const path = require("path")

const directory = "/content/blog"
const regexPath = /^[0-9a-zA-Z가-힣 \(\)\-_]+$/
const regexToRefine = /[^0-9a-zA-Z가-힣 \(\)\-]/g

const validPath = path => {
  return regexPath.test(path)
}

const refinePath = path => {
  return path.replaceAll(regexToRefine, "_")
}

const buildDestinationPath = (pathname, date) => {
  return path.join(
    process.cwd(),
    directory,
    `${date.getFullYear()}_${date.getMonth() + 1}`,
    pathname
  )
}

const inquiryTitle = async () => {
  const { title } = await inquirer.prompt({
    type: "input",
    name: "title",
    validate: value => {
      if (!value || value.trim() === "") {
        return "⚠️  title is empty !"
      }

      if (value === "." || value === "..") {
        return "⚠️  title is invalid !"
      }

      return true
    },
  })

  return title.trim()
}

const inquiryDescription = async () => {
  const { description } = await inquirer.prompt({
    type: "input",
    name: "description",
  })

  return description?.trim()
}

const inquiryPath = async (title, date) => {
  const { pathname } = await inquirer.prompt({
    type: "input",
    name: "pathname",
    default: title,
    message: "pathname (alphanumeric except some special characters): ",
    validate: value => {
      if (!value) {
        return "⚠️  pathname is empty !"
      }

      if (!validPath(value)) {
        return "⚠️  pathname is invalid !"
      }

      const destination = buildDestinationPath(value, date)

      try {
        fs.accessSync(destination, fs.constants.R_OK | fs.constants.W_OK)
        return "⚠️  pathname is in use !"
      } catch (e) {}

      return true
    },
  })

  return refinePath(pathname)
}

const inquiryTags = async () => {
  const { tags } = await inquirer.prompt({
    type: "input",
    name: "tags",
    message: "tags (multiple tags concatenated with comma): ",
    validate: value => {
      if (!value) {
        return "⚠️  tag string is empty !"
      }

      return true
    },
  })

  return tags?.split(",").map(tag => tag.trim())
}

const createFromTemplate = frontmatter => {
  return `---
title: ${frontmatter.title}
description: ${frontmatter.description}
tags: [${frontmatter.tags.map(tag => `'${tag}'`)}]
date: ${frontmatter.date}
---
`
}

const printFrontmatter = frontmatter => {
  const contents = [
    ``,
    ` > title: ${frontmatter.title}`,
    ` > description: ${frontmatter.description || ""}`,
    ` > tags: ${frontmatter.tags}`,
    ` > date: ${frontmatter.date}`,
    ``,
    ` 🚀  now your new post is ready !`,
    ``,
  ]

  console.log(contents.join("\n"))
}

const createFrontmatter = (pathname, frontmatter, date) => {
  const contents = createFromTemplate(frontmatter)
  const destination = buildDestinationPath(pathname, date)
  const filepath = path.join(destination, "index.md")

  try {
    fs.mkdirSync(destination, { recursive: true })
    fs.writeFileSync(filepath, contents)

    printFrontmatter(frontmatter)
  } catch (e) {
    console.error("🚨  something went wrong !")
  }
}

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
    date,
  }

  createFrontmatter(path, frontmatter, now)
})()
