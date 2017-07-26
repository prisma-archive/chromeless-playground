import examples from '../examples'

export const getSource = () => {
  const afterHash = window.location.hash.substr(1);
  const defaultExample = examples[0].code;
  if (!afterHash) return defaultExample;
  if (!afterHash.startsWith('src=')) return defaultExample;
  return decodeURI(afterHash.substr('src='.length));
};
export const setSource = (source: string) => {
  const hash = '#src=' + encodeURI(source);
  window.location.hash = hash;
}

export const getPlaygroundLink = (src: string) => {
  return `${window.location.origin}/play/#src=${encodeURI(src)}`;
}