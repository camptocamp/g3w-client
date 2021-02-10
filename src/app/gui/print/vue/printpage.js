import { createCompiledTemplate } from 'gui/vue/utils'
const {inherit, base, imageToDataURL} = require('core/utils/utils');
const Component = require('gui/vue/component');
const compiledTemplate = createCompiledTemplate(require('./printpage.html'));

const InternalComponent = Vue.extend({
  ...compiledTemplate,
  data: function() {
    return {
      state: null,
      showdownloadbutton: false,
      downloadImageName: ''
    }
  },
  computed: {
    loading() {
      return this.state.loading && this.state.layers;
    }
  },
  watch: {
    'state.url': function(url) {
      if (url) {
        $(this.$refs.printoutput).load(url, (response, status) => {
          this.$options.service.stopLoading();
          status === 'error' && this.$options.service.showError();
          if (this.state.format === 'jpg' || this.state.format === 'png' ) {
            this.downloadImageName = `download.${this.state.format}`;
            imageToDataURL({
              src: this.state.url,
              type: `image/${this.state.format}`,
              callback: url => this.showdownloadbutton = true
            })
          }
        });
      }
    }
  },
  async mounted() {
    await this.$nextTick();
    this.state.layers && this.$options.service.startLoading();
  },
  beforeDestroy() {
    (this.state.url && this.state.method === 'POST') && window.URL.revokeObjectURL(this.state.url);
  }
});

const PrintPage = function(options={}) {
  base(this);
  const service = options.service;
  this.setService(service);
  const internalComponent = new InternalComponent({
    service
  });
  this.setInternalComponent(internalComponent);
  this.internalComponent.state = service.state.output;
  this.unmount = function() {
    this.getService().setPrintAreaAfterCloseContent();
    return base(this, 'unmount')
  }
};

inherit(PrintPage, Component);


module.exports = PrintPage;


