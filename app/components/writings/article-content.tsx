import { Fragment, type ReactNode } from "react";
import { Link } from "react-router";

import type {
  ArticleBlockNode,
  ArticleInlineNode,
  ArticleTableNode,
} from "../../domain/content";
import { CodeBlock } from "./code-block";
import { ResponsiveTable } from "./responsive-table";

function inlineNodes(nodes: readonly ArticleInlineNode[]): ReactNode {
  return nodes.map((node, index) => {
    const key = `${node.kind}-${String(index)}`;
    switch (node.kind) {
      case "text":
        return <Fragment key={key}>{node.value}</Fragment>;
      case "inline-code":
        return <code key={key}>{node.value}</code>;
      case "line-break":
        return <br key={key} />;
      case "emphasis":
        return <em key={key}>{inlineNodes(node.children)}</em>;
      case "strong":
        return <strong key={key}>{inlineNodes(node.children)}</strong>;
      case "strikethrough":
        return <s key={key}>{inlineNodes(node.children)}</s>;
      case "link":
        return node.href.startsWith("/") ? (
          <Link key={key} to={node.href}>
            {inlineNodes(node.children)}
          </Link>
        ) : (
          <a href={node.href} key={key}>
            {inlineNodes(node.children)}
          </a>
        );
    }
  });
}

function articleTable(table: ArticleTableNode, key: string) {
  return (
    <ResponsiveTable key={key} label={table.label}>
      <table>
        <thead>
          <tr>
            {table.headings.map((heading, index) => (
              <th key={String(index)} scope="col">
                {inlineNodes(heading)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={String(rowIndex)}>
              {row.map((cell, cellIndex) => (
                <td key={String(cellIndex)}>{inlineNodes(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ResponsiveTable>
  );
}

function blockNodes(blocks: readonly ArticleBlockNode[]): ReactNode {
  return blocks.map((block, index) => {
    const key = `${block.kind}-${String(index)}`;
    switch (block.kind) {
      case "paragraph":
        return <p key={key}>{inlineNodes(block.children)}</p>;
      case "heading":
        if (block.level === 2) {
          return (
            <h2 id={block.id} key={key} tabIndex={-1}>
              {inlineNodes(block.children)}
            </h2>
          );
        }
        if (block.level === 3) {
          return (
            <h3 id={block.id} key={key} tabIndex={-1}>
              {inlineNodes(block.children)}
            </h3>
          );
        }
        return (
          <h4 id={block.id} key={key} tabIndex={-1}>
            {inlineNodes(block.children)}
          </h4>
        );
      case "list": {
        const items = block.items.map((item, itemIndex) => (
          <li key={String(itemIndex)}>{blockNodes(item)}</li>
        ));
        return block.ordered ? (
          <ol key={key} start={block.start}>
            {items}
          </ol>
        ) : (
          <ul key={key}>{items}</ul>
        );
      }
      case "blockquote":
        return <blockquote key={key}>{blockNodes(block.children)}</blockquote>;
      case "thematic-break":
        return <hr key={key} />;
      case "code-block":
        return (
          <CodeBlock code={block.code} key={key} language={block.language} />
        );
      case "table":
        return articleTable(block, key);
    }
  });
}

export function ArticleContent({
  blocks,
}: {
  readonly blocks: readonly ArticleBlockNode[];
}) {
  return <div className="article-prose">{blockNodes(blocks)}</div>;
}
