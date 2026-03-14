import { useLocation, useNavigate, useSearchParams as useRRSearchParams } from "react-router-dom";

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    back: () => navigate(-1),
    refresh: () => window.location.reload(),
  };
}

export function usePathname() {
  const location = useLocation();
  return location.pathname;
}

export function useSearchParams() {
  const [params] = useRRSearchParams();
  return params;
}
