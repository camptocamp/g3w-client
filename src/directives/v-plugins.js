/**
 * @file
 * @since v3.7
 */

import ApplicationState   from 'store/application-state';
import { watch, unwatch } from 'directives/utils';

const attr = 'g3w-v-plugins-id';

export default {
  bind(el) {
    watch({
      el,
      attr,
      watcher: [
        () => ApplicationState.plugins,
        (plugins) => { el.classList.toggle('g3w-hide', plugins.length === 0) }
      ]
    });
  },
  unbind: (el) => unwatch({ el, attr })
};