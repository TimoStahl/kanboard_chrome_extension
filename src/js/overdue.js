document.addEventListener('DOMContentLoaded', function () {
    $(function () {

        $('body').on('click', '.endpoint', function () {
            var url = $(this).data('url');
            if ($(this).find(".fa-plus-circle").length > 0) {
                //show
                var icon = $(this).find('.fa-plus-circle');
                icon.removeClass('fa-plus-circle').addClass('fa-refresh').addClass('fa-spin');

                //prepare api call
                var request = '{"jsonrpc": "2.0", "method": "getOverdueTasks", "id": 1}';
                var urlapi = $(this).data('url') + 'jsonrpc.php';
                var auth = $(this).data('auth');
                //make api call
                $.ajax({
                    url: urlapi,
                    type: 'POST',
                    dataType: 'json',
                    crossDomain: true,
                    data: request,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", "Basic " + auth);
                    },
                    success: function (data) {
                        var result = data.result;
                        //loop to result
                        $.each(result, function (index, element) {
                            var date = new Date(element.date_due*1000);
                            var day = date.getDate();
                            var month = date.getMonth() + 1;
                            var year = date.getFullYear();
                            
                            var display_task = url + '?controller=task&action=show&project_id=' + element.project_id + '&task_id=' + element.id;
                            var display_project = url + '?controller=board&action=show&project_id=' + element.project_id;
                            
                            var row = '<tr class="board" data-url="' + url + '"><td><i class="fa fa-table"></i> <a class="display tab" href="' + display_project + '">' + element.project_name + '</a><br><i class="fa fa-square-o"></i> <a class="display tab" href="' + display_task + '">' + element.title + '</a></td>' +
                                      '<td><i class="fa fa-calendar"></i> ' + chrome.i18n.getMessage("format_date", [day, month, year]) + '<br><i class="fa fa-user"></i> ' + element.assignee_name + '</td></tr>';
                            $(row).insertAfter($("tr.endpoint[data-url='" + url + "']"));
                        });

                        icon.removeClass('fa-refresh').removeClass('fa-spin').addClass('fa-minus-circle');
                    },
                    error: function (data) {
                        var error = '<tr class="error" data-url="' + url + '"><td colspan="2">' + chrome.i18n.getMessage("error_due_api_call") + '</td></tr>';
                        $(error).insertAfter($("tr[data-url='" + url + "']"));
                        icon.removeClass('fa-refresh').removeClass('fa-spin').addClass('fa-minus-circle');
                    }
                });                
                
            } else {
                //hide
                $(".board[data-url='" + url + "'").remove();
                $(".error[data-url='" + url + "'").remove();
                $(this).find('.fa-minus-circle').removeClass('fa-minus-circle').addClass('fa-plus-circle');
            }
        });

        $('body').loadEndpoints(2);
        $('body').translate();
        
    });
});

