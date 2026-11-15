import type { AnchorHTMLAttributes } from "react";
import type { PageName } from "../../app/pages";
import { navigate } from "../../lib/auth";

type PageLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { page: PageName };

export default function PageLink({page, onClick, ...props}: PageLinkProps) {
  return <a {...props} href={`#${page}`} onClick={event => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey || (props.target && props.target !== "_self")) return;
    event.preventDefault();
    navigate(page);
  }}/>;
}
