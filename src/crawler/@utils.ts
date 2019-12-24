export function filterHTMLTags(text: string): string {
  return text.replace(/(<([^>]+)>)/gi, '');
}
