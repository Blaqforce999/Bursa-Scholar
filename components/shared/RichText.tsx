import { cn } from '@/lib/cn';

type RichTextProps = {
  // required props first
  text: string;
  // optional props after
  className?: string;
};

/**
 * A small, dependency-free renderer for the lightweight markdown the
 * assistant's replies use: **bold** spans and "- " bullet lines. No
 * library — Bursa's replies are short and this covers what they need.
 */
export function RichText({ text, className }: RichTextProps) {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];

  function flushList(key: string) {
    if (listItems.length === 0) return;
    const items = listItems;
    listItems = [];
    blocks.push(
      <ul key={key} className="list-disc pl-20">
        {items.map((item, index) => (
          <li key={index}>{renderInline(item)}</li>
        ))}
      </ul>
    );
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      listItems.push(trimmed.replace(/^[-•]\s+/, ''));
      return;
    }
    flushList(`list-${index}`);
    if (trimmed) blocks.push(<p key={index}>{renderInline(trimmed)}</p>);
  });
  flushList('list-end');

  return (
    <div className={cn('flex flex-col gap-6', className)} style={{ font: 'var(--font-body-regular)' }}>
      {blocks}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, index) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={index} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}
