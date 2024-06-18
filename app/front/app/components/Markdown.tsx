import ReactMarkdown, { Options } from 'react-markdown';
import { H1 } from './ui/H1';
import { H2 } from './ui/H2';
import { H3 } from './ui/H3';
import { H4 } from './ui/H4';
import classNames from 'classnames';
import { Blockquote } from './ui/Blockquote';

// a, br, em, hr, img, li, ol, p, pre, strong, and ul. With remark-gfm, you can also use del, input, table, tbody, td, th, thead, and tr

export function Markdown(props: Options) {
    return (
        <ReactMarkdown
            // allowedElements={['a', 'bloackquote', 'code', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']}
            components={{
                blockquote(props) {
                    const { node, children, ...rest } = props;

                    return <Blockquote {...rest}>{children}</Blockquote>;
                },

                code(props) {
                    const { children, className, node, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || '');

                    return match ? (
                        <code {...rest} className={className}>
                            {children}
                        </code>
                    ) : (
                        <code {...rest} className={classNames('bg-slate-200 rounded', className)}>
                            {children}
                        </code>
                    );
                    // return match ? (
                    //   <SyntaxHighlighter
                    // 	{...rest}
                    // 	PreTag="div"
                    // 	children={String(children).replace(/\n$/, '')}
                    // 	language={match[1]}
                    // 	style={dark}
                    //   />
                    // ) : (
                    //   <code {...rest} className={className}>
                    // 	{children}
                    //   </code>
                    // )
                },

                h1(props) {
                    const { node, children, ...rest } = props;

                    return <H1 {...rest}>{children}</H1>;
                },
                h2(props) {
                    const { node, children, ...rest } = props;

                    return <H2 {...rest}>{children}</H2>;
                },
                h3(props) {
                    const { node, children, ...rest } = props;

                    return <H3 {...rest}>{children}</H3>;
                },
                h4(props) {
                    const { node, children, ...rest } = props;

                    return <H4 {...rest}>{children}</H4>;
                },
                h5(props) {
                    const { node, children, ...rest } = props;

                    return <H4 {...rest}>{children}</H4>;
                },
                h6(props) {
                    const { node, children, ...rest } = props;

                    return <H4 {...rest}>{children}</H4>;
                },
            }}
            {...props}
        />
    );
}
