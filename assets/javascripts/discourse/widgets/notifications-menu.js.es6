import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';

export default createWidget('notifications-menu', {
  tagName: 'div.dropdown.open',

  panelContents() {
    const path = this.currentUser.get('path');

    return [h('h6.dropdown-header', 'Notifications'),
            this.attach('user-notifications', { path }),
            h('.dropdown-item',
              h('.dropdown-item-content.dropdown-item-content-btn',
                h('a.btn.btn-secondary.btn-block', { href: `${path}/notifications` },
                  'Voir toutes les notifications'))
            )];
  },

  html() {
    return h('div.dropdown-menu.dropdown-menu-right', this.panelContents());
  },

  clickOutside() {
    this.sendWidgetAction('toggleNotificationsMenu');
  }
});