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
                type: 'text',
                value,
            } as any;

            return [SKIP, index] as const;
        });
    };
};

export default function Markdown(props: Options & { extraClassName: string }) {
    return (
        <ReactMarkdown
            className={'text-base leading-8 text-balance hyphens-auto break-words ' + props.extraClassName || ''}
            // allowedElements={['p', 'strong', 'em', 'del', 'a', 'ul', 'ol', 'li', 'code', 'blockquote']}
            components={{
                a(props) {
                    const { node, ...rest } = props;
                    return <a className='underline' {...rest} />;
                },
                ul(props) {
                    const { node, ...rest } = props;
                    return <ul className='my-4 ml-5 list-disc' {...rest} />;
                },
                ol(props) {
                    const { node, ...rest } = props;
                    return <ul className='my-4 ml-5 list-decimal' {...rest} />;
                },
                li(props) {
                    const { node, ...rest } = props;
                    return <li className='mt-2' {...rest} />;
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
