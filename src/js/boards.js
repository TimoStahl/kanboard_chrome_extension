document.addEventListener('DOMContentLoaded', function () {
    $(function () {        

        $('body').on('click', '.endpoint', function () {
            var url = $(this).data('url');
            if ($(this).find(".fa-plus-circle").length > 0) {
                //show
                var icon = $(this).find('.fa-plus-circle');
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
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", "Basic " + auth);
                    },
                    success: function (data) {
                        var result = data.result;
                        //loop to result (projectlist)
                        $.each(result, function (index, element) {

                            var display = url + '?controller=board&action=show&project_id=' + element.id;
                            var add = url + '?controller=task&action=create&project_id=' + element.id;
                            var row = '<tr class="board" data-url="' + url + '"><td></td><td><i class="fa fa-table"></i> <a class="display tab" href="' + display + '">' + element.name + '</a></td><td><a class="tab add fa fa-plus" href="' + add + '"> ' + chrome.i18n.getMessage("add_task") + ' </a></td></tr>';
                            $(row).insertAfter($("tr.endpoint[data-url='" + url + "']"));
                        });

                        icon.removeClass('fa-refresh').removeClass('fa-spin').addClass('fa-minus-circle');
                    },
                    error: function (data) {
                        var error = '<tr class="error" data-url="' + url + '"><td colspan="3">' + chrome.i18n.getMessage("error_due_api_call") + '</td></tr>';
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


        $('body').loadEndpoints(3);
        $('body').translate();
    });
});

