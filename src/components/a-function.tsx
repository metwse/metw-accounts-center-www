import { type AnchorHTMLAttributes, type MouseEvent } from 'react';


export function AFunction({ children, onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const onClickOverride = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!e.ctrlKey && !e.shiftKey) {
      e.preventDefault();

      if (onClick)
        onClick(e);
    }
  };

  return (
    <a {...props} onClick={onClickOverride}>
      {children}
    </a>
  );
}
