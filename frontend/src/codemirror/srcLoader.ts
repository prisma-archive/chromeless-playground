export const getSource = () => {
  const afterHash = window.location.hash.substr(1);
  if (!afterHash) return ''; 
  if (!afterHash.startsWith('src=')) return '';
  return decodeURI(afterHash.substr('src='.length));
};
export const setSource = (source: string) => {
  const hash = '#src=' + encodeURI(source);
  window.location.hash = hash;
}

export const getPlaygroundLink = (src: string) => {
  return `${window.location.origin}/play/#src=${encodeURI(src)}`;
}