// jQuery('#message-form').on('submit', function (e) {
//   e.preventDefault();
//   var text = jQuery('input[name=message]').val();
//   var li = jQuery('<li></li>');
//   li.text(`${text}`);
//   jQuery('li').append('dasadsadsad');
//   //create message from the textbox and send to the server with 'createMessage' event
//
//
//   });
// });
// jQuery('#btn2').click(function(){
//     jQuery('ol').append('<li>Appended item</li>;');
// });

$(document).ready(function(){
  $("#btn1").click(function(){
    $("p").append(" <b>Appended text</b>.");
  });

  $("#btn2").click(function(){
    $("ol").append("<li>Appended item</li>");
  });
});
