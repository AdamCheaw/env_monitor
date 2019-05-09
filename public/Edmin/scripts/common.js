$(document).ready(function() {
  $('.paginate_button').click(function() {
    console.log("btn is being click");
  });
  if($('.datatable-1').length > 0) {
    $('.datatable-1').dataTable({});

    // $('.dataTables_paginate').addClass('btn-group datatable-pagination');
    // $('.dataTables_paginate > a').wrapInner('<span />');
    // $('.dataTables_paginate > a:first-child').append('<i class="icon-chevron-left shaded"></i>');
    // $('.dataTables_paginate > a:last-child').append('<i class="icon-chevron-right shaded"></i>');

    // $('.slider-range').slider({
    //   range: true,
    //   min: 0,
    //   max: 20000,
    //   values: [3000, 12000],
    //   slide: function(event, ui) {
    //     $(this).find('.ui-slider-handle').attr('title', ui.value);
    //   },
    // });
    //
    // $('#amount').val('$' + $('.slider-range').slider('values', 0) + ' - $' + $('.slider-range').slider('values', 1));
    //
    //
    // //Graph/Chart index.html
    //
    // var d1 = [
    //   [0, 1],
    //   [1, 14],
    //   [2, 5],
    //   [3, 4],
    //   [4, 5],
    //   [5, 1],
    //   [6, 14],
    //   [7, 5],
    //   [8, 5]
    // ];
    // var d2 = [
    //   [0, 5],
    //   [1, 2],
    //   [2, 10],
    //   [3, 1],
    //   [4, 9],
    //   [5, 5],
    //   [6, 2],
    //   [7, 10],
    //   [8, 8]
    // ];
    //
    // var plot = $.plot($('#placeholder2'),
    //   [{ data: d1, label: 'Profits' }, { data: d2, label: 'Expenses' }], {
    //     lines: {
    //       show: true,
    //       fill: true,
    //       /*SWITCHED*/
    //       lineWidth: 2
    //     },
    //     points: {
    //       show: true,
    //       lineWidth: 5
    //     },
    //     grid: {
    //       clickable: true,
    //       hoverable: true,
    //       autoHighlight: true,
    //       mouseActiveRadius: 10,
    //       aboveData: true,
    //       backgroundColor: '#fff',
    //       borderWidth: 0,
    //       minBorderMargin: 25,
    //     },
    //     colors: ['#55f3c0', '#0db37e', '#b4fae3', '#e0d1cb'],
    //     shadowSize: 0
    //   });
    //
    // function showTooltip(x, y, contents) {
    //   $('<div id="gridtip">' + contents + '</div>').css({
    //     position: 'absolute',
    //     display: 'none',
    //     top: y + 5,
    //     left: x + 5
    //   }).appendTo('body').fadeIn(300);
    // }
    //
    // var previousPoint = null;
    // $('#placeholder2').bind('plothover', function(event, pos, item) {
    //   $('#x').text(pos.x.toFixed(2));
    //   $('#y').text(pos.y.toFixed(2));
    //
    //   if(item) {
    //     if(previousPoint != item.dataIndex) {
    //       previousPoint = item.dataIndex;
    //
    //       $('#gridtip').remove();
    //       var x = item.datapoint[0].toFixed(0),
    //         y = item.datapoint[1].toFixed(0);
    //
    //       showTooltip(item.pageX, item.pageY,
    //         'x : ' + x + '&nbsp;&nbsp;&nbsp; y : ' + y);
    //     }
    //   } else {
    //     $('#gridtip').remove();
    //     previousPoint = null;
    //   }
    // });
  }
});