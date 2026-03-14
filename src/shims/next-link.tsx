import { AnchorHTMLAttributes, PropsWithChildren } from "react";
import { Link as RouterLink } from "react-router-dom";

type LinkProps = PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>;

export default function Link({ href, children, ...rest }: LinkProps) {
  return (
    <RouterLink to={href} {...rest}>
      {children}
    </RouterLink>
  );
}
