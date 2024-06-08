import type { ReactNode } from "react";
import classNames from "classnames";

export function H1({
	children,
	className,
}: { children: ReactNode; className?: string }) {
	return (
		<h1
			className={classNames(
				"scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
				className,
			)}
		>
			{children}
		</h1>
	);
}
