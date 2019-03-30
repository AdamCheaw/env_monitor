$(document).ready(function(){
  $("form").submit(function(e){
    e.preventDefault();
    $("#login").attr('disabled', 'disabled').text('login..');
    $.post("WEB/login",{name:$("#name").val()},
      function(data){
        if(data) {
          localStorage.token = data.token;
          window.location.href = '/Web';
        }
      })
      .fail(function(err) {
        console.log(err);
      })
  });
});
