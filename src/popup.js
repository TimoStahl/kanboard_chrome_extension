document.addEventListener('DOMContentLoaded', function () {
	$(function() {
	  //languages in html
	  $('._locale_projects').text(chrome.i18n.getMessage("projects"));

		//enable a href links and open in a new tab
		$('body').on('click', 'a', function(){
			chrome.tabs.create({url: $(this).attr('href')});
			return false;
		});

		$('body').on('click', '.endpoint', function(){
		  var url = $(this).data('url');
		  if($(this).find(".fa-plus-circle").length > 0) {
		    //show
        var icon =  $(this).find( '.fa-plus-circle' );
        icon.removeClass('fa-plus-circle').addClass('fa-refresh').addClass('fa-spin');

        	//prepare api call
  				var request = '{"jsonrpc": "2.0", "method": "getAllProjects", "id": 1}';
  				var urlapi = $(this).data('url') + 'jsonrpc.php';
  				var auth = $(this).data('auth');
        //make api call
  				$.ajax({
  					url: urlapi,
  					type: 'POST',
  					dataType: 'json',
  					crossDomain: true,
  					data: request,
  					beforeSend: function(xhr){
  						xhr.setRequestHeader("Authorization", "Basic " + auth);
  					},
  					success: function(data) {
  						var result = data.result;
  						//loop to result (projectlist)
  						$.each(result, function(index, element) {

  							var display = url + '?controller=board&action=show&project_id=' + element.id ;
  							var add = url + '?controller=task&action=create&project_id=' + element.id ;
  							var row = '<tr class="board" data-url="' + url + '"><td>-</td><td><a class="display" href="' + display + '">' + element.name + '</a></td><td><a class="add fa fa-plus" href="' + add + '"> ' + chrome.i18n.getMessage("add_task") + ' </a></td></tr>';
  							$(row).insertAfter($("tr.endpoint[data-url='" + url + "']"));
  						});

  						icon.removeClass('fa-refresh').removeClass('fa-spin').addClass('fa-minus-circle');
  					},
  					error: function(data){
  						var error = '<tr class="error" data-url="' + url + '"><td colspan="3">' + chrome.i18n.getMessage("error_due_api_call") + '</td></tr>';
  						$(error).insertAfter($("tr[data-url='" + url + "']"));
  						icon.removeClass('fa-refresh').removeClass('fa-spin').addClass('fa-minus-circle');
  					}
  				});

      } else {
        //hide
        $(".board[data-url='" + url + "'").remove();
        $(".error[data-url='" + url + "'").remove();
        $(this).find( '.fa-minus-circle' ).removeClass('fa-minus-circle').addClass('fa-plus-circle');
      }
		});


		//get apis from local storage settings
		chrome.storage.sync.get( 'endpoints', function(items) {
		  if(typeof items.endpoints === 'undefined'){
			  $("#project_quicklinks").append('<tr class="nohover"><td colspan="3">' + chrome.i18n.getMessage("no_api_endpoint_found") + '<a href="chrome://extensions?options=akjbeplnnihghabpgcfmfhfmifjljneh"> ' + chrome.i18n.getMessage("go_to_options") + ' </a></td></tr>');
			}else{

  			items.endpoints.forEach(function(endpoint) {
  				//add new api endpoint to list
  				var user = 'jsonrpc';
  				var auth = Base64.encode(user + ':' + endpoint.token);
  				var url = endpoint.url.substring(0, endpoint.url.length - 11);
  				$("#project_quicklinks").append('<tr class="endpoint" data-auth="' + auth + '" data-url="' + url + '"><td colspan="3"><i class="fa fa-plus-circle"></i> ' + endpoint.name +  '</td></tr>');

  			});
			}
		});
	});
});

