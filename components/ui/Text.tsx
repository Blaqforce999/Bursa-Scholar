import type { ElementType, CSSProperties, HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type TextVariant =
  | 'display-hero'
  | 'display-large'
  | 'display-medium'
  | 'display-small'
  | 'display-xsmall'
  | 'heading-h1'
  | 'heading-h2'
  | 'heading-h3'
  | 'heading-h4'
  | 'body-large'
  | 'body-regular'
  | 'body-small'
  | 'data-large'
  | 'data-regular'
  | 'data-small'
  | 'caption'
  | 'button-label';

const defaultTag: Record<TextVariant, ElementType> = {
  'display-hero': 'h1',
  'display-large': 'h1',
  'display-medium': 'h2',
  'display-small': 'h2',
  'display-xsmall': 'h3',
  'heading-h1': 'h1',
  'heading-h2': 'h2',
  'heading-h3': 'h3',
  'heading-h4': 'h4',
  'body-large': 'p',
  'body-regular': 'p',
  'body-small': 'p',
  'data-large': 'span',
  'data-regular': 'span',
  'data-small': 'span',
  caption: 'span',
  'button-label': 'span',
};

type TextProps = HTMLAttributes<HTMLElement> & {
  // required props first
  variant: TextVariant;
  // optional props after
  as?: ElementType;
  className?: string;
};

export function Text({ variant, as, className, style, ...props }: TextProps) {
  const Tag = as ?? defaultTag[variant];
  const tokenStyle: CSSProperties = {
    font: `var(--font-${variant})`,
    letterSpacing: `var(--font-${variant}-letter-spacing)`,
  };

  return <Tag className={cn(className)} style={{ ...tokenStyle, ...style }} {...props} />;
}
