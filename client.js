/**
 * Browser half. One sidebar tab, one button, one piece of state.
 *
 * A client plugin is a single file that calls `window.__ModuleLoader__.load`.
 * There is no bundler step and no relative import: `require('react')` resolves
 * through the module system the host already booted.
 */
window.__ModuleLoader__.load({
  id: 'dsh-plugin-example',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useState } = React;

    const NS = 'dsh-plugin-example';
    const KIND = 'example';

    const COPY = {
      en: {
        tabTitle: 'Example',
        title: 'Hello from a plugin',
        body: 'This is a real sidebar tab: the host owns its chrome, keyboard, resize and theme.',
        clicks: 'Clicks',
      },
      zh: {
        tabTitle: '示例',
        title: '来自插件的第一句话',
        body: '这是一个真正的侧栏标签页：边框、键盘、缩放和主题都由宿主负责。',
        clicks: '点击次数',
      },
    };

    function Panel() {
      const [clicks, setClicks] = useState(0);
      const ctx = React.useContext(React.createContext(null));
      const t = (key) => (ctx === null ? COPY.en[key] : ctx.t(key));
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px' } },
        h('h1', { style: { margin: 0, fontSize: '14px' } }, t('title')),
        h('p', { style: { margin: 0, fontSize: '13px', lineHeight: 1.6 } }, t('body')),
        h('button', {
          type: 'button',
          'data-testid': 'bump',
          onClick: () => setClicks((value) => value + 1),
          style: { alignSelf: 'flex-start', minHeight: '28px', padding: '0 12px', borderRadius: '8px' },
        }, `${t('clicks')}: ${clicks}`)
      );
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        let translate = (key) => COPY.en[key] ?? key;
        try {
          ctx.locale.register(NS, COPY);
          translate = ctx.locale.bind(NS);
        } catch {
          // No locale service: English strings stay in place.
        }
        const t = (key) => translate(key);

        ctx.inject(['sidebarRightTabs', 'sidebarRight'], (tabCtx) => {
          if (tabCtx.slots === undefined || tabCtx.slots === null) return;
          tabCtx.effect(() => tabCtx.sidebarRightTabs.register({
            id: NS,
            kind: KIND,
            title: () => t('tabTitle'),
          }), 'example: tab type');
          tabCtx.effect(() => tabCtx.slots.inject('sidebar.right.pane.tab', () =>
            tabCtx.slots.register({ name: 'sidebar.right.pane.tab', key: NS, locale: NS }, Panel)
          ), 'example: tab body');
        });
      },
    };
  },
});
