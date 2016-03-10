i18next
    .use(i18nextXHRBackend)
    .init({ 
        lng: 'it',
        ns: 'app',
        fallbackLng: 'it',
        resources: require('./locales/it/app.json')
    });

$('.content-wrapper').html(i18next.t('text1'));
var layout = require('layout/layout.js');

//$("body").toggleClass('fixed');
//layout.layout.fixSidebar();
//layout.layout.activate();

var app = new Vue({
    el: "body",
    ready: function(){
        layout.setup();
    }
})

