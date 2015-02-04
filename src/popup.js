document.addEventListener('DOMContentLoaded', function () {
	$(function() {
	  //languages in html
	  $('._locale_projects').text(chrome.i18n.getMessage("projects"));

		//enable a href links and open in a new tab
		$('body').on('click', 'a', function(){
			chrome.tabs.create({url: $(this).attr('href')});
			return false;
		});

		//Test hover icon (did not work)
		$( ".display" ).on( "mouseenter", function() {
			$(this).addClass('fa fa-eye');
			console.log('enter display');
		});
		$( ".display" ).on( "mouseleave", function() {
			$(this).removeClass('fa fa-eye');
			console.log('leave display');
		});

		//get apis from local storage settings
		chrome.storage.sync.get( 'endpoints', function(items) {
		  if(typeof items.endpoints === 'undefined'){
		    //TODO change extension ID
			  $("#projects").append('<li>' + chrome.i18n.getMessage("no_api_endpoint_found") + '<a href="chrome://extensions?options=dpijbbnoajflcejcdngjcbacedpchceg"> ' + chrome.i18n.getMessage("go_to_options") + ' </a></li>');
			}else{

  			items.endpoints.forEach(function(endpoint) {

  				//prepare api call
  				var user = 'jsonrpc';
  				var request = '{"jsonrpc": "2.0", "method": "getAllProjects", "id": 1}';
  				var url = endpoint.url.substring(0, endpoint.url.length - 11);

  				//add new api endpoint to list
  				$("#projects").append('<br><li>' + endpoint.name + '<ul data-url="' + url + '"></ul></li>');

  				//make api call
  				$.ajax({
  					url: endpoint.url,
  					type: 'POST',
  					dataType: 'json',
  					crossDomain: true,
  					data: request,
  					beforeSend: function(xhr){
  						var auth = Base64.encode(user + ':' + endpoint.token);
  						xhr.setRequestHeader("Authorization", "Basic " + auth);
  					},
  					success: function(data) {
  						var result = data.result;
  						//loop to result (projectlist)
  						$.each(result, function(index, element) {

  							var display = url + '?controller=board&action=show&project_id=' + element.id ;
  							var add = url + '?controller=task&action=create&project_id=' + element.id ;
  							var row = '<li><a class="display" href="' + display + '">' + element.name + '</a> <a class="add fa fa-plus" href="' + add + '"> ' + chrome.i18n.getMessage("add_task") + ' </a></li>';

  							$("ul").find("[data-url='" + url + "']").append(row);
  						});
  					},
  					error: function(data){
  						$("ul").find("[data-url='" + url + "']").append('<li>' + chrome.i18n.getMessage("error_due_api_call") + '</li>');
  					}
  				});
  			});
			}
		});
	});
});

