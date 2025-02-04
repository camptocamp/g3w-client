<!--
  @file
  @since v3.7
-->

<template>
  <ul
    v-if  = "show"
    id    = "g3w-search"
    class ="treeview-menu g3w-search g3w-tools menu-items"
  >

    <!-- SAVED SEARCHES (from g3w-admin) -->
    <li
      v-for       = "search in state.searches"
      class       = "menu-item"
      @click.stop = "showPanel(search)"
    >
      <i :class = "g3wtemplate.getFontClass('empty-circle')"></i>
      <span>{{ search.name }}</span>
    </li>

    <li v-for = "searchtool in state.tools">
      <g3w-tool :tool = "searchtool" />
    </li>

    <!-- ORIGINAL SOURCE: src/components/QueryBuilderSearch.vue@v3.9.3 -->
    <li
      v-for = "(search, i) in state.querybuildersearches"
      :key  = "search.id"
    >
      <div style = "position:relative" @click = "edit(search)">
        <bar-loader :loading = "search.qbloading"/>
        <div class = "search-tools">
          <span
            class          = "search-action skin-tooltip-bottom"
            :class         = "g3wtemplate.getFontClass('trash')"
            data-placement = "bottom"
            data-toggle    = "tooltip"
            data-container = "body"
            v-t-tooltip    = "'sdk.querybuilder.search.delete'"
            @click.stop    = "remove(search, i)"
            style          = "color: red;margin-right: 5px;"
          ></span>
          <span>{{ search.name }}</span>
          <div>
            <span
            class          = "search-action skin-tooltip-bottom"
            :class         = "g3wtemplate.getFontClass('run')"
            data-placement = "bottom"
            data-toggle    = "tooltip"
            data-container = "body"
            v-t-tooltip    = "'sdk.querybuilder.search.run'"
            @click.stop    = "run(search)"
            style          = "color: green;"
          ></span>
          </div>
        </div>
      </div>
    </li>

  </ul>
</template>

<script>
import Panel                       from 'core/g3w-panel';
import CatalogLayersStoresRegistry from 'store/catalog-layers';
import ProjectsRegistry            from 'store/projects';
import ApplicationService          from 'services/application';
import DataRouterService           from 'services/data';
import GUI                         from 'services/gui';
import { createFilterFromString }  from 'utils/createFilterFromString';

import G3WTool                     from 'components/Tool.vue';
import * as vueComp                from 'components/QueryBuilder.vue';

const { t } = require('core/i18n/i18n.service');

export default {

  /** @since 3.8.6 */
  name: 'search',

  data() {
    return {
      state: this.state || {},
    };
  },

  components: {
    'g3w-tool': G3WTool,
  },

  computed: {
    show() {
      return this.state.searches.length + this.state.tools.length + this.state.querybuildersearches.length > 0;
    }
  },

  methods: {

    showPanel(config = {}) {
      this.$options.service.showPanel(config);
    },

    /**
     * ORIGINAL SOURCE: src/services/querybuilder.js@v3.9.3
     */
    async remove(search, index) {
      try {
        await (new Promise((res, rej) => { GUI.dialog.confirm(t('sdk.querybuilder.delete'), d => d ? res() : rej()) }));
        const items     = ApplicationService.getLocalItem('QUERYBUILDERSEARCHES');
        const projectId = ProjectsRegistry.getCurrentProject().getId();
        const searches  = (items ? items[projectId] || [] : []).filter(item => item.id !== search.id);
        if (searches.length)           items[projectId] = searches;
        else                           delete items[projectId];
        if (Object.keys(items).length) ApplicationService.setLocalItem({ id: 'QUERYBUILDERSEARCHES', data: items });
        else                           ApplicationService.removeLocalItem('QUERYBUILDERSEARCHES');
        this.$options.service.removeItem({ type: 'querybuilder', index });
      } catch(e) {
        console.warn(e);
      }
    },

    edit(search) {
      const opts = {
        id:            search.id,
        name:          search.name,
        layerId:       search.layerId,
        filter:        search.filter,
        title:         t('sdk.querybuilder.title'),
        show:          true,
      };
      opts.internalPanel = new (Vue.extend(vueComp))({ options: opts });
      new Panel(opts);
    },

    /**
     * ORIGINAL SOURCE: src/services/querybuilder.js@v3.9.3
     */
    async run(search) {
      search.qbloading = true;
      try {
        const layer = CatalogLayersStoresRegistry.getLayerById(search.layerId);
        await DataRouterService.getData('search:features', {
          inputs: {
            layer,
            filter: createFilterFromString({ layer, filter: search.filter }),
            feature_count: 100,
          },
          outputs: true,
        });
      } catch(e) {
        console.warn(e);
        GUI.showUserMessage({ type: 'alert', message: 'sdk.querybuilder.error_run', autoclose: true });
      }
      search.qbloading = false;
    },

  },

  async mounted() {
    await this.$nextTick();
    $('.search-action').tooltip();
  },

};
</script>

<style scoped>
li.menu-item {
  padding-right: 20px !important;
}
li.menu-item span {
  display: inline-flex;
  white-space: pre-wrap;
}
.search-action {
  text-shadow: 0 2px 5px rgba(0,0,0,.3);
  padding: 0 4px;
}
#g3w-search li i {
  width: 20px;
}
.search-tools {
  display:flex;
  align-items: baseline;
}
.search-tools > span {
  white-space: pre-wrap;
}
.search-tools > div {
  margin-left: auto;
}
</style>