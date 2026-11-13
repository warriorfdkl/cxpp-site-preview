/* Shared publications: all visitors read the same server records. */
(async () => {
  const e = window.cxppEscape;
  const t = window.cxppT || (value => value);
  const localize = window.cxppLocalizeRecord || (value => value);
  const date = window.cxppDate || (value => value);
  const file = location.pathname.split('/').pop();
  const image = (source, title, fallback) => `<img src="${e(window.cxppAsset(source || fallback))}" alt="${e(title)}" loading="lazy">`;
  const originalNotice = item => item.originalLanguage ? '<p class="content-notice" lang="en">An English translation is not yet available for all of this publication. <a href="' + e(new URL(file + location.search, window.cxppLanguage.root).href) + '" lang="ru">Read the Russian version ↗</a></p>' : '';
  const previewNotice = preview => preview ? `<p class="content-notice">${e(t('Предпросмотр для администратора. Черновик не виден посетителям.'))}</p>` : '';
  try {
    if (file === 'news.html') {
      const news = (await cxppRequest('news')).map(localize);
      for (const n of [...news].reverse()) {
        const visual = n.image ? image(n.image, n.title) : '';
        const card = `<a href="news-article.html?id=${encodeURIComponent(n.id)}" class="news-card" data-reveal data-tag="${e(n.tag)}">
          ${visual ? `<div class="news-thumb">${visual}<span class="news-thumb-date">${e(date(n.date))}</span></div>` : `<div class="news-thumb news-thumb--text"><span class="news-visual-label">${e(n.tag || t('НОВОСТИ'))}</span><span class="news-thumb-date">${e(date(n.date))}</span></div>`}
          <div class="news-body"><h2 class="news-title">${e(n.title)}</h2><span class="news-read">${e(t('Читать новость ↗'))}</span></div></a>`;
        document.getElementById('news-grid').insertAdjacentHTML('afterbegin', card);
      }
    } else if (file === 'projects.html') {
      const projects = (await cxppRequest('projects')).map(localize);
      document.getElementById('projects-grid').insertAdjacentHTML('afterbegin', projects.map(p => `<article class="project-card" data-reveal data-publication="${e(p.id)}">
        <a class="project-thumb" href="project.html?id=${encodeURIComponent(p.id)}" aria-label="${e(p.title)}">${image(p.image, p.title, 'assets/archive/slide-01.jpg')}<div class="project-thumb-overlay"></div><div class="project-tag">${e([p.location,p.year].filter(Boolean).join(' · '))}</div></a>
        <div class="project-body"><div class="project-client">${e(p.client)}</div><h2 class="project-title"><a href="project.html?id=${encodeURIComponent(p.id)}">${e(p.title)}</a></h2><p class="project-desc">${e(p.desc)}</p><div class="project-tags">${[p.category,p.stage].filter(Boolean).map(t=>`<span class="project-tag-chip">${e(t)}</span>`).join('')}</div></div></article>`).join(''));
    } else if (file === 'news-article.html') {
      const id = new URLSearchParams(location.search).get('id');
      const preview = new URLSearchParams(location.search).get('preview') === '1';
      const news = preview ? (await cxppRequest('admin/state')).news : await cxppRequest('news');
      const article = news.map(localize).find(n => n.id === id);
      if (!article) {
        document.getElementById('hero-title').textContent = t('Статья не найдена');
        document.getElementById('hero-date').textContent = '';
        document.getElementById('article-content').innerHTML = `<p>${e(t('Статья удалена или ссылка устарела.'))}</p><a class="article-back" href="news.html">${e(t('← Все новости'))}</a>`;
        return;
      }
      document.title = article.title + ' — ' + t('Союзхимпромпроект');
      document.getElementById('hero-title').textContent = article.title;
      document.getElementById('hero-date').textContent = date(article.date);
      document.getElementById('article-content').innerHTML = `${previewNotice(preview)}${originalNotice(article)}<div class="article-meta"><span class="article-tag">${e(article.tag)}</span></div>${article.image ? `<div class="article-thumb">${image(article.image,article.title)}</div>` : ''}<div class="article-body">${article.body || `<p>${e(article.desc || t('Подробности появятся позже.'))}</p>`}</div><a href="news.html" class="article-back">${e(t('← Все новости'))}</a>`;
    } else if (file === 'project.html') {
      const params = new URLSearchParams(location.search);
      const preview = params.get('preview') === '1';
      const projects = preview ? (await cxppRequest('admin/state')).projects : await cxppRequest('projects');
      const project = projects.map(localize).find(p => p.id === params.get('id'));
      if (!project) {
        document.getElementById('hero-title').textContent = t('Проект не найден');
        document.getElementById('hero-date').textContent = '';
        document.getElementById('article-content').innerHTML = `<p>${e(t('Проект удалён или ещё не опубликован.'))}</p><a class="article-back" href="projects.html">${e(t('← Все проекты'))}</a>`;
        return;
      }
      document.title = project.title + ' — ' + t('Союзхимпромпроект');
      document.getElementById('hero-title').textContent = project.title;
      document.getElementById('hero-date').textContent = [project.location, project.year].filter(Boolean).join(' · ');
      const facts = [['Заказчик',project.client],['Направление',project.category],['Статус',project.stage]].filter(([,value])=>value);
      document.getElementById('article-content').innerHTML = `${previewNotice(preview)}${originalNotice(project)}<div class="article-thumb">${image(project.image,project.title,'assets/archive/slide-01.jpg')}</div><dl class="project-detail-facts">${facts.map(([label,value])=>`<div><dt>${e(t(label))}</dt><dd>${e(value)}</dd></div>`).join('')}</dl>${project.desc?`<p class="project-summary">${e(project.desc)}</p>`:''}<div class="article-body">${project.body || ''}</div><a href="projects.html" class="article-back">${e(t('← Все проекты'))}</a>`;
    }
  } catch (error) {
    const target = document.querySelector('#article-content, #news-grid, .projects-grid');
    if (target) {
      const status = document.createElement('p'); status.className = 'content-notice'; status.setAttribute('role','status');
      status.textContent = ['news-article.html','project.html'].includes(file) ? error.message : t('Дополнительные публикации временно недоступны. Обновите страницу позже.');
      target.insertAdjacentElement('afterend', status);
    }
    if (['news-article.html','project.html'].includes(file)) {
      document.getElementById('hero-title').textContent = t('Не удалось загрузить публикацию');
      document.getElementById('article-content').textContent = '';
    }
  } finally {
    document.body.dataset.contentReady = 'true';
  }
})();
