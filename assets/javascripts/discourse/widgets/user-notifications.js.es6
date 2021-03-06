import { createWidget } from 'discourse/widgets/widget';
import { headerHeight } from 'discourse/components/site-header';
import { h } from 'virtual-dom';

export default createWidget('user-notifications', {
  tagName: 'div.notifications',
  buildKey: () => 'user-notifications',

  defaultState() {
    return { notifications: [], loading: false };
  },

  notificationsChanged() {
    this.refreshNotifications(this.state);
  },

  refreshNotifications(state) {
    if (this.loading) { return; }

    // estimate (poorly) the amount of notifications to return
    let limit = Math.round(($(window).height() - headerHeight()) / 130);
    // we REALLY don't want to be asking for negative counts of notifications
    // less than 3 is also not that useful
    if (limit < 3) { limit = 3; }
    if (limit > 5) { limit = 5; }

    const stale = this.store.findStale('notification', {recent: true, limit }, {cacheKey: 'recent-notifications'});

    if (stale.hasResults) {
      const results = stale.results;
      let content = results.get('content');

      // we have to truncate to limit, otherwise we will render too much
      if (content && (content.length > limit)) {
        content = content.splice(0, limit);
        results.set('content', content);
        results.set('totalRows', limit);
      }

      state.notifications = results;
    } else {
      state.loading = true;
    }

    stale.refresh().then(notifications => {
      this.currentUser.set('unread_notifications', 0);
      state.notifications = notifications;
    }).catch(() => {
      state.notifications = [];
    }).finally(() => {
      state.loading = false;
      this.scheduleRerender();
    });
  },

  html(attrs, state) {
    if (!state.notifications.length) {
      this.refreshNotifications(state);
    }

    const result = [];
    if (state.loading) {
      result.push(h('div.dropdown-item', h('div.dropdown-item-content', h('div.text-xs-center',
        [h("i.fa.fa-circle-o-notch.fa-spin.fa-2x.fa-fw"),
        h("span.sr-only", [ "Chargement..." ])]))));
    } else if (state.notifications.length) {

      const notificationItems = state.notifications.map(n => this.attach('notification-item', n));
      const items = [notificationItems];

      result.push(items);
    }

    return result;
  }
});
