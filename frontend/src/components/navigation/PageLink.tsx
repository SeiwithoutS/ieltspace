import type { AnchorHTMLAttributes } from "react";
import type { PageName } from "../../app/pages";
import { navigate } from "../../lib/auth";

type PageLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { page: PageName; query?: string };

export default function PageLink({page, query, onClick, ...props}: PageLinkProps) {
  const route = query ? `${page}?${query}` : page;
  return <a {...props} href={`#${route}`} onClick={event => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey || (props.target && props.target !== "_self")) return;
    event.preventDefault();
    navigate(route);
  }}/>;
}
