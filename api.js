/* Published records are a read-only snapshot in this preview. */
(() => {
  const root = new URL('.', document.currentScript.src);
  window.cxppRequest = async (path, options = {}) => {
    if (!['news', 'projects'].includes(path) || !['GET', 'HEAD'].includes(options.method || 'GET')) {
      const error = new Error(window.cxppLanguage?.en ? 'Editing is unavailable in this preview.' : 'Изменение данных недоступно в демонстрационной версии.');
      error.status = 401;
      throw error;
    }
    const response = await fetch(new URL('demo-data/' + path + '.json', root), {cache:'no-cache'});
    if (!response.ok) throw Error(window.cxppLanguage?.en ? 'Unable to load publications. Please refresh the page.' : 'Не удалось загрузить публикации. Обновите страницу.');
    return response.json();
  };
})();
window.cxppEscape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
