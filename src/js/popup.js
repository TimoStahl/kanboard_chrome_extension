(function( $ ){
   $.fn.translate = function() {
      //languages in html
        $('._locale_projects').text(chrome.i18n.getMessage("projects"));
        $('._locale_overdue_tasks').text(chrome.i18n.getMessage("overdue_tasks"));

        //enable a href links and open in a new tab
        $('body').on('click', '.tab', function () {
            chrome.tabs.create({url: $(this).attr('href')});
            return false;
        });
      return this;
   }; 
   $.fn.loadEndpoints = function(colspan) {
       //get apis from local storage settings
            chrome.storage.sync.get('endpoints', function (items) {
                if (typeof items.endpoints === 'undefined') {
                    $("#project_quicklinks").append('<tr class="nohover"><td colspan="' + colspan + '">' + chrome.i18n.getMessage("no_api_endpoint_found") + '<a class="tab" href="chrome://extensions?options=akjbeplnnihghabpgcfmfhfmifjljneh"> ' + chrome.i18n.getMessage("go_to_options") + ' </a></td></tr>');
                } else {

                    items.endpoints.forEach(function (endpoint) {
                        //add new api endpoint to list
                        var user = 'jsonrpc';
                        var auth = Base64.encode(user + ':' + endpoint.token);
                        var url = endpoint.url.substring(0, endpoint.url.length - 11);
                        $("#project_quicklinks").append('<tr class="endpoint" data-auth="' + auth + '" data-url="' + url + '"><td colspan="' + colspan + '"><i class="fa fa-plus-circle"></i> ' + endpoint.name + '</td></tr>');

                    });

                    if (items.endpoints.length == 1) {
                        $(".endpoint").trigger("click");
                    }
                }
            });
       return this;
   };   
})( jQuery );
