<!--
  @file
  @since v3.8
-->

<template>
  <ul
    id     = "g3w-spatial-bookmarks"
    class  = "treeview-menu g3w-spatial-bookmarks menu-items"
    :class = "{'g3w-tools': !showaddform}"
  >

    <!-- ADD NEW BOOKMARK (FORM) -->
    <template v-if = "showaddform">
      <li>
        <div style = "display: flex; justify-content: end">
          <span
            v-t-tooltip:left.create  = "'close'"
            @click.stop              = "showaddform = false"
            :class                   = "g3wtemplate.getFontClass('close')"
            class                    = "sidebar-button sidebar-button-icon"
            style                    = "padding: 5px; margin: 3px;"
          ></span>
        </div>

        <helpdiv message = "sdk.spatialbookmarks.helptext" />

        <div
          class = "container add-bookmark-input"
          style = "padding: 5px; width: 100%"
        >
          <input-text
            ref    = "add_bookmark_input"
            :state = "addbookmarkinput"
          />
        </div>
        <div style = "margin-top: 5px;">
          <button
            @click.stop = "addBookMark"
            class       = "sidebar-button-run btn btn-block"
            v-t         = "'add'"
            v-disabled  = "!addbookmarkinput.validate.valid"
          ></button>
        </div>
      </li>
    </template>

    <!-- BOOKMARS LIST -->
    <template v-else>

      <div v-if = "is_staff" class = "content-bookmarks">
        <span v-t = "'sdk.spatialbookmarks.sections.project.title'"></span>
        <a
          :href  = "`https://docs.qgis.org/3.34/${lang}/docs/user_manual/map_views/map_view.html#bookmarking-extents-on-the-map`"
          target = "_blank"
          style  = "float: right;"
          title  = "QGIS Docs"
        >
          <i :class = "g3wtemplate.getFontClass('external-link')"></i>
        </a>
      </div>

      <template v-for = "bookmark in project.bookmarks">
        <spatial-book-mark-group v-if = "bookmark.nodes" :group = "bookmark" />
        <spatial-book-mark-item v-else :bookmark = "bookmark" />
      </template>

      <div
        class = "content-bookmarks"
        style = "display: flex; justify-content: space-between; align-items: center; margin-top: 10px;"
      >
        <span
          style = "font-weight: bold; color: #ffffff"
          v-t   = "'sdk.spatialbookmarks.sections.user.title'"
        ></span>
        <span
          v-t-tooltip:left.create = "'add'"
          @click.stop             = "showAddForm"
          style                   = "padding: 5px; cursor: pointer;"
          class                   = "sidebar-button sidebar-button-icon"
          :class                  = "g3wtemplate.getFontClass('plus')"
        >
        </span>
      </div>

      <spatial-book-mark-item
        v-for            = "bookmark in user.bookmarks"
        @remove-bookmark = "removeBookMark"
        :bookmark        = "bookmark"
      />
    </template>

  </ul>
</template>

<script>
  import { LOCAL_ITEM_IDS }   from 'app/constant';
  import ApplicationState     from 'store/application-state'
  import GUI                  from 'services/gui';
  import ApplicationService   from 'services/application';
  import ProjectsRegistry     from 'store/projects';
  import SpatialBookMarkGroup from "components/SpatialBookMarkGroup.vue";
  import SpatialBookMarkItem  from "components/SpatialBookMarkItem.vue";
  import InputText            from "components/InputText.vue";

  const { uniqueId } = require('utils');
  const { t }        = require('core/i18n/i18n.service');

  const SPATIAL_BOOKMARKS_LOCALITEMS = ApplicationService.getLocalItem(LOCAL_ITEM_IDS.SPATIALBOOKMARKS.id);

  export default {

    /** @since 3.8.6 */
    name: 'spatial-bookmarks',

    components: {
      SpatialBookMarkGroup,
      SpatialBookMarkItem,
      InputText,
    },

    data() {
      const project = ProjectsRegistry.getCurrentProject();

      if (undefined === SPATIAL_BOOKMARKS_LOCALITEMS[project.getId()]) {
        SPATIAL_BOOKMARKS_LOCALITEMS[project.getId()] = [];
      }

      return {

        /**
         * true = show add dialog menu
         */
        showaddform: false,

        /** bookmark is an array of Object with follow structure:
         * {
         *   name: <String> Unique identifier of spatial bootmark,
         *   removable: <Boolean> true if set in QGIS project, false if add by user on G3W-SUITE application,
         *   extent: <Array> Contain the map bbox coordinates
         * }
         */

        project: {
          bookmarks: project.getSpatialBookmarks() || []
        },

        user: {
          bookmarks: SPATIAL_BOOKMARKS_LOCALITEMS[project.getId()]
        },

        addbookmarkinput: {
          name:     'add-bookmark',
          label:    t('sdk.spatialbookmarks.input.name'),
          i18nLabel:true,
          value:    null,
          editable: true,
          type:     'varchar',
          input:    { type: 'text', options: {} },
          visible:  true,
          validate: { valid:    false, required: true }
        }
      }
    },

    computed: {

      /** @since 3.10.0 */
      is_staff() {
        return ApplicationService.getConfig().user.is_staff;
      },

      /** @since 3.10.0  */
      lang() {
        return ApplicationState.language;
      },

    },

    methods: {

      addBookMark() {
        this.user.bookmarks.push({
          id:        uniqueId(),
          name:      this.addbookmarkinput.value,
          extent:    GUI.getService('map').getMapExtent(),
          removable: true,
          crs:       { epsg: 1*GUI.getService('map').getCrs().split('EPSG:')[1] }
        });

        this.saveUserBookMarks();
        this.showaddform = false;
      },

      removeBookMark(id) {
        this.user.bookmarks = this.user.bookmarks.filter(b => id !== b.id);
        this.saveUserBookMarks();
      },

      saveUserBookMarks() {
        SPATIAL_BOOKMARKS_LOCALITEMS[ProjectsRegistry.getCurrentProject().getId()] = this.user.bookmarks;
        ApplicationService.setLocalItem({
          id: LOCAL_ITEM_IDS.SPATIALBOOKMARKS.id,
          data: SPATIAL_BOOKMARKS_LOCALITEMS
        });
      },

      showAddForm() {
        this.addbookmarkinput.value = null;
        this.showaddform            = true;
      }

    },

    watch: {
      async showaddform(bool) {
        if (bool) {
          await this.$nextTick();
          //need to remove all class so input is adapted to 100% width
          for (let i = 0; i < this.$refs.add_bookmark_input.$el.children.length; i++) {
            this.$refs.add_bookmark_input.$el.children[i].classList.remove('col-sm-12')
          }
        }
      }
    },

    created() {
      this.$on('close', () => this.showaddform = false);
    },

  };
</script>

<style>
  .content-bookmarks {
    font-weight: bold;
    color: #ffffff;
    padding: 5px;
    border-bottom: 1px solid #ffffff;
    margin-bottom: 2px;
  }
</style>