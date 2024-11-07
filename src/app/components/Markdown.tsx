import classNames from 'classnames';
import ReactMarkdown, { Options } from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

import type { Plugin } from 'unified';
import { SKIP, visit } from 'unist-util-visit';

// https://github.com/zestedesavoir/zmarkdown/issues/416#issuecomment-2301830633
const limitedMarkdownPlugin: Plugin = () => {
    return (tree, file) => {
        const contents = file.toString();

        visit(tree, (node, index, parent) => {
            if (
                index == null ||
                [
                    'paragraph',
                    'text',
                    'inlineCode',
                    'strong',
                    'emphasis',
                    'link',
                    'list',
                    'listItem',
                    'blockquote',
                ].includes(node.type) ||
                !node.position
            ) {
                return true;
            }

            let value = contents.slice(node.position.start.offset, node.position.end.offset);

            if (node.type === 'heading') {
                value = `\n${value}`;
            }

            parent.children[index] = {
                type: 'paragraph',
                children: [
                    {
                        type: 'text',
                        value,
                    },
                ],
            } as any;

            return [SKIP, index] as const;
        });
    };
};

export default function Markdown(props: Options & { extraClassName: string }) {
    return (
        <ReactMarkdown
            className={classNames('text-lg text-balance hyphens-auto break-words [&>*]:mb-3', props.extraClassName)}
            components={{
                a(props) {
                    const { node, ...rest } = props;
                    return <a className='underline' {...rest} />;
                },
                ul(props) {
                    const { node, ...rest } = props;
                    return <ul className='ml-5 list-disc' {...rest} />;
                },
                ol(props) {
                    const { node, ...rest } = props;
                    return <ul className='ml-5 list-decimal' {...rest} />;
                },
                li(props) {
                    const { node, ...rest } = props;
                    return <li className='mb-1' {...rest} />;
                },
                blockquote(props) {
                    const { node, ...rest } = props;
                    return <blockquote className='border-l-4 pl-2 text-muted-foreground' {...rest} />;
                },
            }}
            remarkPlugins={[remarkGfm, remarkBreaks, limitedMarkdownPlugin]}
            unwrapDisallowed
            {...props}
        />
    );
}

export function MarkdownBadge() {
    return (
        <div className='p-2 text-sm text-muted-foreground font-medium leading-none flex items-center space-x-2'>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='24' height='24' fill='currentColor'>
                <path d='M14.85 3c.63 0 1.15.52 1.14 1.15v7.7c0 .63-.51 1.15-1.15 1.15H1.15C.52 13 0 12.48 0 11.84V4.15C0 3.52.52 3 1.15 3ZM9 11V5H7L5.5 7 4 5H2v6h2V8l1.5 1.92L7 8v3Zm2.99.5L14.5 8H13V5h-2v3H9.5Z'></path>
            </svg>
            <span className='hidden min-[360px]:block'>Markdown is supported</span>
        </div>
    );
}
