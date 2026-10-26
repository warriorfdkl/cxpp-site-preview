/* Localised URLs are explicit: /en/ stays English throughout navigation. */
(() => {
  const en = document.documentElement.lang === 'en';
  const root = new URL('.', document.currentScript.src);
  const words = {
    'Меню':'Menu', 'Закрыть':'Close', 'Навигация по сайту':'Site navigation',
    'Загрузка сайта':'Loading website', 'Пропустить заставку ↗':'Skip intro ↗',
    'Союзхимпромпроект':'Soyuzkhimpromproekt',
    'Промышленные объекты':'Industrial facilities', 'Линейные объекты':'Linear infrastructure',
    'Гражданские объекты':'Civil facilities', 'Инженерные изыскания':'Engineering surveys',
    'Авторский надзор':'Design supervision', 'Завершён':'Completed', 'В работе':'In progress',
    'НОВОСТИ':'NEWS', 'ГЛАВНОЕ':'HIGHLIGHTS', 'ЖИЗНЬ ИНСТИТУТА':'INSTITUTE LIFE',
    'ОБРАЗОВАНИЕ':'EDUCATION', 'СОБЫТИЕ':'EVENT', 'ДОСТИЖЕНИЯ':'ACHIEVEMENTS',
    'РАЗВИТИЕ':'DEVELOPMENT', 'ПРАЗДНИК':'CELEBRATION',
    'Читать новость ↗':'Read article ↗', 'Статья не найдена':'Article not found',
    'Проект не найден':'Project not found', '← Все новости':'← All news', '← Все проекты':'← All projects',
    'Статья удалена или ссылка устарела.':'This article has been removed, or the link is out of date.',
    'Проект удалён или ещё не опубликован.':'This project has been removed or has not been published yet.',
    'Подробности появятся позже.':'More information will follow.',
    'Предпросмотр для администратора. Черновик не виден посетителям.':'Administrator preview. This draft is not visible to visitors.',
    'Заказчик':'Client', 'Направление':'Sector', 'Статус':'Status',
    'Не удалось загрузить публикацию':'Unable to load this publication',
    'Дополнительные публикации временно недоступны. Обновите страницу позже.':'Additional publications are temporarily unavailable. Please try again later.',
    'Нет связи с сервером. Повторите попытку или свяжитесь с нами по телефону.':'Unable to connect to the server. Please try again or contact us by phone.',
    'Сервис временно недоступен. Попробуйте обновить страницу позже.':'The service is temporarily unavailable. Please try again later.',
    'Сервис временно недоступен.':'The service is temporarily unavailable.',
    'Сессия завершена. Войдите снова.':'Your session has expired. Please sign in again.',
    'Не удалось выполнить запрос. Повторите попытку.':'Unable to complete your request. Please try again.',
    'Войдите в панель управления.':'Please sign in to the administration panel.',
    'Укажите корректный телефон или e-mail.':'Please enter a valid phone number or email address.',
    'Заполните название или имя.':'Please enter a name.',
    'Слишком много обращений. Повторите через минуту или позвоните нам.':'Too many enquiries. Please try again in a minute or call us.',
    'Приём обращений временно недоступен. Позвоните +7 (843) 294-94-10 или напишите cxpp@cxpp.ru.':'Enquiries are temporarily unavailable. Please call +7 (843) 294-94-10 or email cxpp@cxpp.ru.',
    'Не удалось сохранить данные. Повторите попытку позже.':'Unable to save your enquiry. Please try again later.',
    'Запрос с другого сайта отклонён.':'The request could not be accepted. Please open the form on this website.',
    'Обновите страницу и повторите запрос.':'Please refresh the page and try again.',
    'Недопустимый размер запроса.':'Your message is too large. Please shorten it and try again.',
    'Проверьте формат и размер отправленных данных.':'Please check your enquiry and try again.'
  };
  window.cxppLanguage = {en, root};
  window.cxppT = text => en ? (words[text] || text) : text;
  window.cxppDate = value => en && /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? new Intl.DateTimeFormat('en-GB', {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(value + 'T00:00:00Z')) : value;
  window.cxppAsset = value => value && !/^(?:data:|blob:|https?:|\/)/.test(value) ? new URL(value, root).href : value;
  window.cxppLocalizeRecord = item => {
    if (!en) return item;
    return {...item, title:item.title_en || item.title, desc:item.desc_en || item.desc,
      body:item.body_en || item.body, tag:item.tag_en || window.cxppT(item.tag),
      client:item.client_en || item.client, location:item.location_en || item.location,
      category:window.cxppT(item.category), stage:window.cxppT(item.stage),
      originalLanguage:!item.title_en || ['body','desc','client','location'].some(key => item[key] && !item[key+'_en'])};
  };
  document.addEventListener('DOMContentLoaded', () => {
    const filename = location.pathname.split('/').pop() || 'index.html';
    const page = filename.endsWith('.html') ? filename : '404.html';
    document.querySelectorAll('[data-language]').forEach(link => {
      const target = new URL((link.dataset.language === 'en' ? 'en/' : '') + page, root);
      target.search = location.search;
      target.hash = location.hash;
      link.href = target.href;
      link.addEventListener('click', event => {
        if (link.dataset.language === (en ? 'en' : 'ru')) event.preventDefault();
      });
    });
  });
})();
