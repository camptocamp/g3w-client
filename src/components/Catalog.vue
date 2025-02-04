<!--
  @file
  @since v3.7
-->

<template>
  <!-- item template -->
  <div
    id                        = "catalog"
    @contextmenu.prevent.stop = ""
    class                     = "tabbable-panel catalog"
  >

    <div class = "tabbable-line">

      <!-- TAB MENU (header) -->
      <ul
        class          = "nav nav-tabs catalalog-nav-tabs"
        role           = "tablist"
        @click.capture = "onTabClick"
      >
        <!-- TAB TOC LAYERS -->
        <li
          v-if   = "hasLayers"
          role   = "presentation"
          :class = "{ active: ('layers' === activeTab) }"
        >
          <a
            href          = "#layers"
            aria-controls = "layers"
            role          = "tab"
            data-toggle   = "tab"
            data-i18n     = "tree"
            v-t           = "'data'">
          </a>
        </li>
        <!-- TAB EXTERNAL WMS LAYERS -->
        <li
          v-if   = "state.external.wms.length"
          role   = "presentation"
          :class = "{ active: ('externalwms' === activeTab) }"
        >
          <a
            href          = "#externalwms"
            aria-controls = "externalwms"
            role          = "tab"
            data-toggle   = "tab"
            data-i18n     = "externalwms"
            v-t           = "'externalwms'">
          </a>
        </li>
        <!-- TAB BASE LAYERS -->
        <li
          v-if   = "hasBaseLayers"
          role   = "presentation"
          :class = "{ active: ('baselayers' === activeTab) }"
        >
          <a
            href          = "#baselayers"
            aria-controls = "baselayers"
            role          = "tab"
            data-toggle   = "tab"
            data-i18n     = "baselayers"
            v-t           = "'baselayers'">
          </a>
        </li>
        <!-- TAB LEGEND LAYERS -->
        <li
          v-if   = "'tab' === state.legend.place && showlegend"
          role   = "presentation"
          :class = "{ active: ('legend' === activeTab) }"
        >
          <a
            href          = "#legend"
            aria-controls = "legend"
            role          = "tab"
            data-toggle   = "tab"
            data-i18n     = "legend"
            v-t           = "'legend'">
          </a>

        </li>

      </ul>

      <!-- TAB MENU (content) -->
      <div class = "tab-content catalog-tab-content">

        <bar-loader :loading="loading" />

        <div
          id     = "layers"
          role   = "tabpanel"
          class  = "tab-pane"
          :class = "{ active: ('layers' === activeTab) }"
        >

          <helpdiv message = "catalog_items.helptext" />

          <!-- TOOLBAR -->
          <div
            id    = "g3w-catalog-toc-layers-toolbar"
            style = "margin: 2px;"
          >
            <catalog-change-map-themes
              :key              = "project.state.gid"
              :map_themes       = "project.state.map_themes"
              :layerstrees      = "state.layerstrees"
              @change-map-theme = "changeMapTheme"
            />
          </div>

          <!-- LAYER TREES -->
          <ul
            v-for = "root in state.layerstrees"
            :key  = "root.storeid"
            class = "tree-root root project-root"
          >
            <catalog-tristate-tree
              v-for                      = "tree in root.tree"
              :key                       = "tree.id"
              :highlightlayers           = "state.highlightlayers"
              :layerstree                = "tree"
              class                      = "item"
              :parentFolder              = "false"
              :root                      = "true"
              :legendplace               = "state.legend.place"
              :parent_mutually_exclusive = "false"
              :storeid                   = "root.storeid"
            />
          </ul>

          <!-- EXTERNAL VECTOR LAYER -->
          <ul
            v-if  = "state.external.vector.length"
            class = "g3w-external_layers-group"
          >
            <catalog-tristate-tree
              v-for           = "vector in state.external.vector"
              :key            = "vector.id"
              :externallayers = "state.external.vector"
              :layerstree     = "vector"
              class           = "item"
            />
          </ul>

          <!-- GROUP OF LAYERS -->
          <!-- ORIGINAL SOURCE: src/components/CatalogLayersGroup.vue@v3.9.3 -->
          <ul
            v-for = "group in state.layersgroups"
            class = "g3w-catalog-layers-group"
          >
            <div>
              <h4>{{ group.title }}</h4>
              <catalog-tristate-tree
                v-for       = "node in group.nodes"
                :layerstree = "node"
                class       = "item"
              />
            </div>
          </ul>

        </div>

        <!-- EXTERNAL WMS LAYER -->
        <div
          v-if   = "state.external.wms.length"
          id     = "externalwms"
          role   = "tabpanel"
          class  = "tab-pane"
          :class = "{ active: ('externalwms' === activeTab) }"
        >
          <ul class="g3w-external_wms_layers-group">
            <catalog-tristate-tree
              v-for           = "wms in state.external.wms"
              :key            = "wms.id"
              :externallayers = "state.external.wms"
              :layerstree     = "wms"
              class           = "item"
            />
          </ul>
        </div>

        <!-- BASE LAYERS -->
        <div
          v-if   = "hasBaseLayers"
          id     = "baselayers"
          role   = "tabpanel"
          class  = "tab-pane baselayers"
          :class = "{ active: ('baselayers' === activeTab || !hasLayers) }"
        >
          <ul
            id     = "baselayers-content"
            :class = "{'mobile': isMobile()}"
            :style = "{ gridTemplateColumns: `repeat(auto-fill, minmax(${baselayers.length > 4 ? 80 : 120}px, 1fr))` }"
          >
            <li
              v-if  = "!base.fixed"
              v-for = "base in baselayers"
              :key  = "base.title"
            >
              <img
                :src        = "getSrcBaseLayerImage(base)"
                @click.stop = "setBaseLayer(base.id)"
                class       = "img-responsive img-thumbnail baselayer"
                :style      = "{ opacity: currentBaseLayer === base.id ? 1 : 0.5 }"
              >
              <div class = "baseselayer-text text-center g3w-long-text">{{ base.title }}</div>
            </li>

            <li @click.stop="setBaseLayer(null)">
              <img
                :src   = "getSrcBaseLayerImage(null)"
                class  = "img-responsive img-thumbnail baselayer"
                :style = "{ opacity: currentBaseLayer === null ? 1 : 0.5 }"
              >
              <div
                class = "baseselayer-text text-center g3w-long-text"
                v-t   = "'nobaselayer'">
              </div>

            </li>

          </ul>

        </div>

        <!-- ORIGINAL SOURCE: src/components/CatalogLayersLegendItems.vue@v3.9.3 -->
        <!-- ORIGINAL SOURCE: src/components/CatalogLayersLegend.vue@v3.9.3 -->
        <div
          v-if   = "'tab' === state.legend.place"
          v-for  = "tree in state.layerstrees"
          :key   = "tree.id"
          role   = "tabpanel"
          id     = "legend"
          class  = "tab-pane"
          :class = "{ active: 'legend' === activeTab }"
        >
          <div v-for = "t in tree.tree" class = "legend-item"> <!-- TODO: check if such nesting level really necessary.. -->
            <figure v-for = "url in t.legendurls">
              <bar-loader :loading="url.loading" />
              <img
                v-show = "!url.loading && !url.error"
                :src   = "url.url"
                @error = "onLegendError(url)"
                @load  = "onLegendLoad(url)"
                alt    = ""
              />

              <divider/>

            </figure>

          </div>

        </div>

      </div>

    </div>

    <catalog-layer-context-menu :external="state.external" />

    <catalog-project-context-menu />

  </div>
</template>

<script>

import { CatalogEventBus as VM }   from 'app/eventbus';
import CatalogLayersStoresRegistry from 'store/catalog-layers';
import ProjectsRegistry            from 'store/projects';
import ControlsRegistry            from 'store/map-controls';
import ApplicationService          from 'services/application';
import GUI                         from 'services/gui';

import CatalogChangeMapThemes      from 'components/CatalogChangeMapThemes.vue';
import CatalogLayerContextMenu     from 'components/CatalogLayerContextMenu.vue';
import CatalogProjectContextMenu   from 'components/CatalogProjectContextMenu.vue';
import CatalogTristateTree         from 'components/CatalogTristateTree.vue';

/**
 * Stringify a query URL param (eg. `&WIDTH=700`)
 *
 * @param name
 * @param value
 *
 * @returns { string | null } a string if value is set or null
 */
 function __(name, value) {
  return (value || 0 === value) ? `${name}${value}` : null;
}

export default {

  /** @since 3.8.6 */
  name: 'catalog',

  data() {
    return {
      state:            this.$options.service.state || {},
      showlegend:       false,
      currentBaseLayer: null,
      activeTab:        'layers',
      loading:          false,
    }
  },

  components: {
    CatalogChangeMapThemes,
    CatalogLayerContextMenu,
    CatalogProjectContextMenu,
    CatalogTristateTree,
  },

  computed: {

    project() {
      return ProjectsRegistry.state.currentProject
    },

    title() {
      return this.project.state.name;
    },

    baselayers() {
      return this.project.state.baselayers;
    },

    hasBaseLayers() {
      return this.project.state.baselayers.length > 0;
    },

    hasLayers() {
      let len = 0;
      this.state.layerstrees.forEach(layerstree => len += layerstree.tree.length);
      return this.state.external.vector.length > 0 || len > 0 || this.state.layersgroups.length > 0 ;
    },

  },

  methods: {

    onLegendError(legendurl) {
      legendurl.error   = true;
      legendurl.loading = false;
    },

    onLegendLoad(legendurl) {
      legendurl.loading = false;
    },

    /**
     * Get legend src for visible layers
     *
     * @returns {Promise<void>}
     */
    getLegendSrc(change = false) {
      // skip if not active
      if ('tab' !== this.state.legend.place) { return }

      this.state.layerstrees.forEach(t => {
        let layers = this._traverseVisibleLayers(t.tree);
        this.showlegend = this.showlegend || layers.length > 0;
        t.tree.forEach(async tree => {
          try {
            if (
              change && (
                (tree.legendurls && 0 === tree.legendurls.length) ||
                layers.some(l => l.legend.change) ||
                ProjectsRegistry.getCurrentProject().getContextBaseLegend()
              )
            ) {
              layers.filter(l => l.legend.change).forEach(l => l.legend.change = false);
            }
            tree.legendurls = await this._getLegendSrc(layers);
          } catch (e) {
            console.warn(e);
          }
        });
      });
    },

    _traverseVisibleLayers(obj, _layers = []) {
      for (const layer of obj) {
        if (null !== layer.id && undefined !== layer.id && layer.visible && layer.geolayer && !layer.exclude_from_legend) {
          _layers.push(layer);
        }
        if (null !== layer.nodes && undefined !== layer.nodes) {
          _layers = _layers.concat(this._traverseVisibleLayers(layer.nodes, _layers));
        }
      }
      return _layers;
    },

    /**
     * Get legend src for visible layers
     *
     * @returns {Promise<void>}
     */
    async _getLegendSrc(visiblelayers) {

      // reset layers url
      const legendurls = [];

      // filter geolayer
      const layers = visiblelayers.filter(l => l.geolayer);

      const http = { GET: {}, POST: {} };

      layers.forEach(layer => {
        const name         = http[(layer.source && layer.source.url) || layer.external ? 'GET' : layer.ows_method];
        const catalogLayer = CatalogLayersStoresRegistry.getLayerById(layer.id);

        const url          = catalogLayer ? catalogLayer.getLegendUrl(this.state.legend.config, {
          all:        !ProjectsRegistry.getCurrentProject().getContextBaseLegend(), // true = dynamic legend
          format:     'image/png',
          categories: layer.categories
        }) : undefined;


        // no url is set
        if (undefined === catalogLayer) { return }

        if (layer.source && layer.source.url) {
          name[url] = [];
          return
        }

        // extract LEGEND_ON and LEGEND_OFF from prefix -> (in case of legend categories)
        let prefix = url.split('LAYER=')[0].split('LEGEND_ON=')[0].split('LEGEND_OFF=')[0];

        if (!name[prefix]) { name[prefix] = [] }

        name[prefix].unshift({
          layerName:  url.split('LAYER=')[1],
          style:      (Array.isArray(layer.styles) && layer.styles.find(style => style.current) || ({ name: false })).name,
          legend_on:  (url.split('LAYER=')[0].split('LEGEND_ON=')[1] || '').replace('&', ''),                         // remove eventually &
          legend_off: (url.split('LAYER=')[0].split('LEGEND_ON=')[0].split('LEGEND_OFF=')[1] || '').replace('&', ''), // remove eventually &
        });
      });

      for (const method in http) {
        for (const url in http[method]) {
          const obj = {
            loading : true,
            url     : null,
            error   : false
          };

          legendurls.push(obj);

          const params = {
            LAYERS     : [],
            STYLES     : [],
            LEGEND_ON  : [],
            LEGEND_OFF : []
          };

          (http[method][url] || []).reduce((_, layer) => {
              params.LAYERS.push(layer.layerName);
              params.STYLES.push(layer.style);
              if (layer.legend_on)  { params.LEGEND_ON.push(layer.legend_on); }
              if (layer.legend_off) { params.LEGEND_OFF.push(layer.legend_off); }
              return params;
            }, params);

          let url_params = [
            __('LAYERS=',     params.LAYERS.join(',')),
            __('STYLES=',     params.STYLES.join(',')),
            __('LEGEND_ON=',  params.LEGEND_ON.join(',')),
            __('LEGEND_OFF=', params.LEGEND_OFF.join(',')),
            __('filtertoken=', ApplicationService.getFilterToken()),
          ]
          .filter(p => p) // discard nullish parameters (without a value)
          .join('&');

          try {
            obj.url = 'GET' === method
              ? url + (http[method][url].length ? url_params : '')
              : URL.createObjectURL(await (await fetch(url.split('?')[0], {
                  method:  'POST',
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                  // send encoded params
                  body: // new URLSearchParams(url.split('?')[1])
                    url
                      .split('?')[1]
                      .split('&')
                      .filter(p => p.split('=')[0]).map(p => `${p.split('=')[0]}=${encodeURIComponent(p.split('=')[1])}`)
                      .join('&')
                      + '&' + url_params
                })).blob());
          } catch (e) {
            console.warn(e);
          }

          obj.loading = false;
        }
      }

    return legendurls;
    },

    /**
     * Change view
     *
     * @fires CatalogEventBus~layer-change-style
     */
    async changeMapTheme(map_theme) {
      GUI.closeContent();
      //check if is custom map theme
      // const custom = undefined !== this.project.state.map_themes.custom.find(({ theme }) => map_theme === theme);

      // change map theme
      ApplicationService.changeProjectView(true);
      this.state.layerstrees[0].checked = true;
      const changes = (await ProjectsRegistry.getCurrentProject().setLayersTreePropertiesFromMapTheme({
        map_theme,
        rootNode:   this.state.layerstrees[0],
        layerstree: this.state.layerstrees[0].tree[0].nodes
      })).layers;
      ApplicationService.changeProjectView(false);

      // get all layers with styles
      const layers  = Object.keys(changes).filter(id => changes[id].style);
      const styles  = (await this.project.getMapThemeFromThemeName(map_theme)).styles;

      // clear categories
      layers.forEach(id => {
        if (!changes[id].visible) {
          const layer = CatalogLayersStoresRegistry.getLayerById(id);
          layer.clearCategories();
          layer.change();
        }
      });

      // apply styles on each layer
      layers.forEach(id => VM.$emit('layer-change-style', { layerId: id, style: styles[id] }));

    },

    onTabClick(e) {
      if (e.target.attributes['aria-controls']) {
        this.activeTab = e.target.attributes['aria-controls'].value;
      }
    },

    setBaseLayer(id) {
      this.currentBaseLayer = id;
      this.project.setBaseLayer(id);
      ApplicationService.setBaseLayerId(id);
    },

    getSrcBaseLayerImage(baseLayer) {
      let image = 'nobaselayer.png';
      switch (baseLayer && baseLayer.servertype || baseLayer) {
        case 'OSM':  image = 'osm.png';                                    break;
        case 'Bing': image = `bing${baseLayer.source.subtype}.png`;        break;
        case 'TMS':  image = baseLayer.icon ? baseLayer.icon : image;      break;
        case 'WMTS': image = baseLayer.icon ? baseLayer.icon : image;      break;
      }
      return (baseLayer || {}).icon ? image : `${GUI.getResourcesUrl()}images/${image}`;
    },

    /**
     * @TODO add description
     *
     * @since 3.10.0
     */
    onUnSelectionLayer(storeid, layerstree) {
      GUI.getService('queryresults').removeFromSelection(layerstree, storeid);
    },

    /**
     * @TODO add description
     *
     * @since 3.10.0
     */
    async onActiveFilterTokenLayer(storeid, layerstree) {
      layerstree.filter.active = await CatalogLayersStoresRegistry.getLayersStore(storeid).getLayerById(layerstree.id).toggleFilterToken();
    },

    /**
     * Handle visibilty change on legend item
     *
     * @fires MapService~cataloglayervisible
     *
     * @since 3.10.0
     */
    onTreeNodeVisible(layer) {
      GUI.getService('map').emit('cataloglayervisible', layer);
    },

    /**
     * Handle legend item select (single mouse click ?)
     *
     * @fires MapService~cataloglayerselected
     *
     * @since 3.10.0
     */
    onTreeNodeSelected(storeid, node) {
      let layer = CatalogLayersStoresRegistry.getLayersStore(storeid).getLayerById(node.id);
      // emit signal of select layer from catalog
      if (!layer.isSelected()) {
        GUI.getService('catalog').setSelectedExternalLayer({ layer: null, type: 'vector', selected: false });
      }
      setTimeout(() => {
        CatalogLayersStoresRegistry.getLayersStore(storeid).selectLayer(node.id, !layer.isSelected());
        // emit signal of select layer from catalog
        GUI.getService('map').emit('cataloglayerselected', layer);
      });
    },

    /**
     * Handle temporary external layer add
     *
     * @since 3.10.0
     */
    onTreeNodeExternalSelected(layer) {
      GUI
        .getService('catalog')
        .setSelectedExternalLayer({ layer, type: 'vector', selected: !layer.selected})
        // Loop all layersstores and unselect them all (`selected = false`)
        .then(() => {
          if (layer.selected) {
            CatalogLayersStoresRegistry.getLayersStores().forEach(layer => { layer.selectLayer(null, false); });
          }
        });
    },

    /**
     * @TODO add description
     *
     * @listens ol.interaction~propertychange
     *
     * @since 3.10.0
     */
    onRegisterControl(id, control) {
      if ('querybbox' === id) {
        control.getInteraction().on('propertychange', e => {
          if ('active' === e.key) {
            this.state.highlightlayers = !e.oldValue;
          }
        })
      }
    },

  },

  watch: {

    /**
     * Listen external wms change. If remove all layer need to set active the project or default tab
     */
    'state.external.wms'(newlayers, oldlayers) {
      if (oldlayers && 0 === newlayers.length) {
        this.activeTab = this.project.state.catalog_tab || 'layers';
      }
    },

    project: {
      async handler(project, oldproject) {
        const activeTab = project.state.catalog_tab || 'layers';
        this.loading = 'baselayers' === activeTab;
        await this.$nextTick();
        setTimeout(() => {
          this.loading = false;
          this.activeTab = activeTab;
        }, ('baselayers' === activeTab) ? 500 : 0)
      },
      immediate: false
    },

    activeTab(tab) {
      if ('legend' === tab) {
        this.getLegendSrc(true);
      }
    },

  },

  /**
   * @listens CatalogEventBus~unselectionlayer
   * @listens CatalogEventBus~activefiltertokenlayer
   * @listens CatalogEventBus~treenodevisible
   * @listens CatalogEventBus~treenodeselected
   * @listens CatalogEventBus~treenodeexternalselected
   * @listens ControlsRegistry~registerControl
   */
  created() {
    VM.$on('unselectionlayer',                  this.onUnSelectionLayer);
    VM.$on('activefiltertokenlayer',            this.onActiveFilterTokenLayer);
    VM.$on('treenodevisible',                   this.onTreeNodeVisible);
    VM.$on('treenodeselected',                  this.onTreeNodeSelected);
    VM.$on('treenodeexternalselected',          this.onTreeNodeExternalSelected);
    VM.$on('layer-change-style',                this.getLegendSrc);
    ControlsRegistry.onafter('registerControl', this.onRegisterControl);
  },

  beforeMount() {
    this.currentBaseLayer = this.project.state.initbaselayer;
  },

  async mounted() {
    await this.$nextTick();
    // in case of dynamic legend
    if (ProjectsRegistry.getCurrentProject().getContextBaseLegend()) {
      GUI.getService('map').on('change-map-legend-params', () => { this.getLegendSrc(); });
    } else {
      this.getLegendSrc();
    }
  },

};
</script>

<style>
  .tabbable-line > .nav-tabs > li.active { border-bottom: 4px solid var(--skin-color); }
  .catalog .tree-item.selected,
  .catalog #legend div.selected          { background-color: var(--skin-color); }
  .catalog-context-menu li.title         { border-bottom-color: var(--skin-color) !important; }

  .skin-blue .tabbable-line > .nav-tabs > li:is(.open, :hover) { border-bottom: 4px solid #6abbea; }
  .skin-blue .tabbable-line.tabs-below > .nav-tabs > li:hover  { border-top: 4px solid #6abbea; }
  .skin-blue .tabbable-line.tabs-below > .nav-tabs > li.active { border-top: 4px solid #f3565d; }

  .skin-green .tabbable-line > .nav-tabs > li:is(.open, :hover) { border-bottom: 4px solid #00FF8E; }
  .skin-green .tabbable-line.tabs-below > .nav-tabs > li:hover  { border-top: 4px solid #00FF8E; }
  .skin-green .tabbable-line.tabs-below > .nav-tabs > li.active { border-top: 4px solid #f3565d; }

  .skin-purple .tabbable-line > .nav-tabs > li:is(.open,:hover)  { border-bottom: 4px solid #A19DFF; }
  .skin-purple .tabbable-line.tabs-below > .nav-tabs > li:hover  { border-top: 4px solid #A19DFF; }
  .skin-purple .tabbable-line.tabs-below > .nav-tabs > li.active { border-top: 4px solid #f3565d; }

  .skin-red .tabbable-line > .nav-tabs > li:is(.open, :hover)    { border-bottom: 4px solid #FF5542; }
  .skin-red .tabbable-line.tabs-below > .nav-tabs > li:hover     { border-top: 4px solid #FF5542; }
  .skin-red .tabbable-line.tabs-below > .nav-tabs > li.active    { border-top: 4px solid #FF5542; }

  .skin-yellow .tabbable-line > .nav-tabs > li:is(.open,:hover)  { border-bottom: 4px solid #FFDE0D; }
  .skin-yellow .tabbable-line.tabs-below > .nav-tabs > li:hover  { border-top: 4px solid #FFDE0D; }
  .skin-yellow .tabbable-line.tabs-below > .nav-tabs > li.active { border-top: 4px solid #FFDF12; }

  /***
   Bootstrap Line Tabs by @keenthemes
   A component of Metronic Theme - #1 Selling Bootstrap 3 Admin Theme in Themeforest: http://j.mp/metronictheme
   Licensed under MIT
  ***/

  /* Tabs panel */

  .tabbable-panel {
    padding: 10px;
  }
  .tabbable-line > .nav-tabs {
    border: none;
    margin: 0px;
  }
  .tabbable-line .nav-tabs ul li {
    color: #fff;
  }
  .tabbable-line > .nav-tabs > li {
    margin-right: 2px;
    border-bottom: 4px solid #21292d;
  }
  .tabbable-line > .nav-tabs > li > a {
    border: 0;
    margin-right: 0;
    color: #fff;
  }
  .tabbable-line > .nav-tabs > li > a > i {
    color: #a6a6a6;
  }
  .tabbable-line > .nav-tabs > li:is(.open, :hover) > a {
    border: 0;
    background: none !important;
  }
  .tabbable-line > .nav-tabs > li:is(.open, :hover) > a > i {
    color: #a6a6a6;
  }
  .tabbable-line > .nav-tabs > li:is(.open, :hover) .dropdown-menu {
    margin-top: 0;
  }
  .tabbable-line > .nav-tabs > li.active {
    position: relative;
    font-weight: bold;
  }
  .tabbable-line > .nav-tabs > li.active > a {
    border: 0;
    color: #fff;
    background-color: #2c3b41;
  }
  .tabbable-line > .nav-tabs > li.active > a > i {
    color: #fff;
  }
  .tabbable-line > .tab-content.catalog-tab-content {
    margin-top: -3px;
    border: 0;
    color: #fff;
    padding: 5px 0 0 0;
  }
  .portlet .tabbable-line > .tab-content {
    padding-bottom: 0;
  }

  /* Below tabs mode */

  .tabbable-line.tabs-below > .nav-tabs > li {
    border-top: 4px solid transparent;
  }
  .tabbable-line.tabs-below > .nav-tabs > li > a {
    margin-top: 0;
  }
  .tabbable-line.tabs-below > .nav-tabs > li:hover {
    border-bottom: 0;
    color: #fff;
  }
  .tabbable-line.tabs-below > .nav-tabs > li.active {
    margin-bottom: -2px;
    border-bottom: 0;
  }
  .tabbable-line.tabs-below > .tab-content {
    margin-top: -10px;
    border-top: 0;
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;
  }
  .nav-tabs > li.active > a,
  .nav-tabs > li.active > a:is(:focus, :hover) {
    color: #fff;
    background-color: #2c3b41;
  }
  .catalog > .title {
    padding: 10px;
    font-weight: bold;
  }
  .catalog ul {
    line-height: 1.5em;
    list-style-type: none;
  }
  .catalog .list-group-item {
    color: #fff;
    background-color: #2c3b41;
  }
  .catalog .tree-item.selected ul.layer-categories,
  .catalog #legend div.selected ul.layer-categories {
    background-color: #222d32;
  }
  .catalog .tree-item div.tree-node-title,
  .catalog #legend div div.tree-node-title {
    padding-left: 3px;
    cursor: pointer;
    width: 80%;
    display: inline-flex;
    justify-content: space-between;
  }
  .catalog .tree-item div.tree-node-title.disabled,
  .catalog #legend div div.tree-node-title.disabled {
    color: #999;
  }
  .catalog .tree-item div.tree-node-title .selection-filter-icon,
  .catalog #legend div div.tree-node-title .selection-filter-icon {
    box-shadow: rgba(0,0,0,0.3) 0 2px 5px;
    padding: 5px;
    border-radius: 3px;
    margin: 0 3px;
    font-weight: bold;
    color: #fff !important;
  }
  .catalog .tree-item div.tree-node-title .selection-filter-icon.active,
  .catalog #legend div div.tree-node-title .selection-filter-icon.active {
    box-shadow: none;
    background-color: #384247;
  }
  .catalog .tree-item {
    cursor: pointer;
    margin-bottom: 3px;
  }
  .catalog .tree-item.disabled > span {
    color: #999;
  }
  .catalog .root {
    padding: 2px 1px 1px 5px;
  }
  .catalog .root .tree-item.group {
    padding-left: 1px;
  }
  .catalog .root.fa-chevron-right {
    padding-right: 5px;
    padding-left: 0;
  }
  .catalog .root-categories.fa-chevron-right {
    padding-right: 7px;
  }
  .catalog .root-categories.fa-chevron-down {
    padding-right: 3px;
  }
  .bold {
    font-weight: bold;
    color: #fff;
  }
  .highlightlayer {
    border-bottom: 2px dashed;
    border-color: #ffb516;
  }
  .catalog {
    padding: 3px;
  }
  .catalog .tree-root {
    padding-left: 0;
  }
  .catalog .tree-root li > .root {
    padding-left: 5px;
  }
  .catalog .tree-root li.tree-item ul.tree-content-items.root {
    padding-left: 18px;
  }
  .catalog .tree-root li.tree-item ul.tree-content-items.root > .tree-item.group {
    padding-left: 1px !important;
  }
  .catalog .tree-root li.tree-item ul.tree-content-items {
    padding-left: 17px;
    padding-top: 2px;
  }
  .g3w-lendplace-toc {
    padding-left: 23px;
  }
  .g3w-lendplace-toc.group {
    padding-left: 17px;
  }
  .g3w-lendplace-toc.root {
    padding-left: 18px;
  }
  .g3w-lendplace-toc.root > li.itemmarginbottom {
    margin-left: -13px;
  }
  .g3w-lendplace-toc.root > li.itemmarginbottom div.layer-legend {
    padding-left: 56px;
  }
  .g3w-lendplace-toc.root > li.itemmarginbottom > span.child {
    padding-left: 18px !important;
  }
  .catalog .tree-root span.root.collapse-expande-collapse-icon {
    width: 19px;
  }
  .catalog .tree-root span.root.collapse-expande-collapse-icon.project-root {
    width: 17px;
  }
  .catalog .tree-root span.collapse-expande-collapse-icon {
    width: 10px;
  }
  .catalog span.legend-collapse-expande-collapse-icon {
    font-size: 1.2em;
  }
  .catalog .child-categories {
    padding: 5px 3px 1px 12px;
  }
  .catalog .layer-legend {
    padding: 3px 0 0 35px;
    background-color: #222d32;
  }
  .catalog .catalalog-nav-tabs {
    display: flex;
    flex: 1 1 0;
  }
  .catalog .catalalog-nav-tabs > li {
    font-size: 1em;
    white-space: initial;
    display: flex;
    flex: 1 1 0;
    align-items: stretch;
  }
  .catalog .catalalog-nav-tabs > li a {
    padding: 10px 0;
    text-align: center;
    height: 100%;
    width: 100%;
  }
  .catalog .tree {
    color: #fff;
  }
  .catalog .tree.disabled {
    color: #999;
    cursor: not-allowed;
  }
  .catalog .g3w-external_wms_layers-group {
    padding: 5px;
  }
  .catalog .baselayers .radio {
    margin: 0;
  }
  .catalog-context-menu {
    background: #FAFAFA;
    border: 1px solid #BDBDBD;
    border-radius: 3px;
    display: block;
    list-style: none;
    margin: 0;
    padding: 0;
    position: fixed;
    min-width: 150px;
    z-index: 999999;
    color: #000;
    outline: none;
  }
  .catalog-context-menu li {
    border-bottom: 1px solid #E0E0E0;
    margin: 0;
    padding: 5px 15px;
  }
  .catalog-context-menu li span.menu-icon {
    padding-right: 3px;
    margin-right: 3px;
  }
  .catalog-context-menu li .wms-url-tooltip {
    color: #000000;
    opacity: 1;
  }
  .catalog-context-menu li .wms-url-tooltip:hover {
    color: #FFF !important;
    transform: scale(1.1);
  }
  .catalog-context-menu li.title {
    background: transparent;
    font-size: 1.1em;
    font-weight: bold;
    border-bottom-width: 3px !important;
  }
  .catalog-context-menu li.title:hover {
    cursor: default !important;
    background: transparent !important;
    color: #000;
  }
  .catalog-context-menu li:last-child {
    border-bottom: none;
  }
  .catalog-context-menu li:hover {
    color: #FAFAFA;
    cursor: pointer;
  }
  .catalog-context-menu li .layer-menu-metadata-info {
    padding: 5px;
    max-width: 200px;
    white-space: normal;
    overflow-y: auto;
    max-height: 150px;
  }
  #baselayers-content {
    display: grid;
    justify-content: center;
    grid-gap: 5px;
    padding: 0;
    margin: 5px;
  }
  #baselayers-content.mobile {
    grid-template-columns: repeat(auto-fill,minmax(80px,110px));
  }
  #baselayers-content .baseselayer-text {
    white-space: pre-line;
    font-weight: bold;
  }
  #baselayers-content .baselayer {
    cursor: pointer;
  }
  #baselayers-content .baselayer .baselayer-name {
    font-weight: bold;
    white-space: pre-line;
    text-align: center;
  }
  #catalog #layers ul.g3w-external_layers-group {
    padding-left: 0 !important;
  }
  #catalog #layers ul.g3w-external_layers-group li {
    padding-left: 2px !important;
  }
  #catalog #layers .sidebar-menu > li > a {
    border: 0;
  }
  #catalog .catalog-context-menu .wms-url-tooltip .tooltip-inner {
    min-width: 200px;
  }
  #catalog .catalog-context-menu .tooltip-inner {
    word-break: break-all;
    font-weight: bold;
  }
  #catalog .catalog-context-menu .item-text {
    margin-left: 3px;
  }
  #catalog #toc_layer_help_text {
    position: relative;
    border-radius: 2px;
    padding: 5px;
    margin: 0.8em;
    white-space: pre-line;
    background-color: rgba(255,255,255,0.1);
  }
  #catalog .info_helptext_button {
    text-align: center;
    font-size: 0.7em;
    margin-top: -5px;
    margin-left: -5px;
    background-color: #222d32;
    font-weight: bold;
    color: #ffffff;
    position: absolute;
    top: 0;
    left: 0;
    width: 15px;
    height: 15px;
    box-shadow: 0 3px 5px rgba(0,0,0,0.5);
    border: 1px solid #fff;
    border-radius: 50%;
  }
  #catalog > a {
    display: none !important;
  }
</style>

<style scoped>
  #legend .divider {
    display: block;
    position: relative;
    padding: 0;
    margin: 8px auto;
    height: 0;
    width: 100%;
    max-height: 0;
    font-size: 1px;
    line-height: 0;
    clear: both;
    border: none;
  }

  .legend-item {
    width: 100%;
    position: relative;
  }

  .g3w-catalog-layers-group > div {
    border: 1px solid #ffffff33;
    margin: 5px;
  }
  .g3w-catalog-layers-group > div > h4 {
    margin: 5px;
    font-weight: bold;
  }
</style>