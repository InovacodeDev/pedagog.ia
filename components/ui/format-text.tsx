import DOMPurify from 'isomorphic-dompurify';

export const FormatText = ({ text }: { text: string }) => {
  if (!text) return null;
  const html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');

  return <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
};
