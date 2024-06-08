import type { ReactNode } from "react";
import classNames from "classnames";

export function H2({
	children,
	className,
}: { children: ReactNode; className?: string }) {
	return (
		<h2
			className={classNames(
				"scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
				className,
			)}
		>
			{children}
		</h2>
	);
}
