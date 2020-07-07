# Write Docs

> Just commit change and push to the [Github repo](https://github.com/stvreumi/SmartCampusDocs/), [the docs website](https://github.com/stvreumi/SmartCampusDocs/) will automatically update

## Using hackmd to edit
https://hackmd.io/c/tutorials-tw/%2Fs%2Flink-with-github-tw

## Running Docs Server Locally
- In the directory `docs`, run the following command:
  ```bash
  npm run serve
  ```

## Dump JSdoc to markdown
- 使用[JSdoc](https://jsdoc.app/)的形式寫comment，再透過[jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown)這個工具把jsdoc轉為markdown
- 在`[...]/SmartCampus/functions/graphql_server`，可以透過以下指令直接產生`graql.md`，會放置在`[...]/SmartCampus/functions/graphql_server/docs`
  ```bash
  npm run docs
  ```
  or
  ```bash
  npx jsdoc2md -f <js code> > <output markdown>
  ```

