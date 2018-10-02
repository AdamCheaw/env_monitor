
var idClicked;
$(document).ready(function(){
    for(var i = 0;i < sub_result.length;i++) {
      var html = '<a class="btn btn-danger unsubBtn" id="unsubBtn-'+sub_result[i].subscribeID+'" ><i class="icon-remove"></i></a>';
      $("#"+sub_result[i].sensorID+" .setting").append(html)
    }
    //unsubscribe
    $(".unsubBtn").click(function(e) {
      idClicked = e.target.id;//get btn clicked id
      idClicked = idClicked.replace('unsubBtn-', '');
      console.log("idClicked: "+idClicked);
      if(idClicked)
      {
        var data = {
            "subscribeListID" : idClicked
        };
        $.ajax({
            type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
            url         : '/getData/unsubscribe', // the url where we want to POST
            data        : data, // our data object
            dataType    : 'json', // what type of data do we expect back from the server
            encode          : true,
            beforeSend: function(){
              // $.LoadingOverlay("show", {
              //   image       : "",
              //   fontawesome : "fa fa-cog fa-spin"
              // });
            },
            complete: function(){
               // $.LoadingOverlay("hide");
               // console.log("ajax send finish");
               // $("#myModal").modal("hide");
            },
            success: function(data){
              $("#unsubBtn-"+idClicked).remove();
              alert("unsubscribe success!");
            },
            error: function(){
              alert("unsubscribe failed!");
            }
        })

      }
      else {

      }

    });
    //unsubscribe new append unsubBtn
    $('#sub-table').on('click', '.unsubBtn', function(e) {
      idClicked = e.target.id;//get btn clicked id
      idClicked = idClicked.replace('unsubBtn-', '');
      console.log("idClicked: "+idClicked);
      if(idClicked)
      {
        var data = {
            "subscribeListID" : idClicked
        };
        $.ajax({
            type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
            url         : '/getData/unsubscribe', // the url where we want to POST
            data        : data, // our data object
            dataType    : 'json', // what type of data do we expect back from the server
            encode          : true,
            beforeSend: function(){
              // $.LoadingOverlay("show", {
              //   image       : "",
              //   fontawesome : "fa fa-cog fa-spin"
              // });
            },
            complete: function(){
               // $.LoadingOverlay("hide");
               // console.log("ajax send finish");
               // $("#myModal").modal("hide");
            },
            success: function(data){
              $("#unsubBtn-"+idClicked).remove();
              alert("unsubscribe success!");
            },
            error: function(){
              alert("unsubscribe failed!");
            }
        })

      }
      else {

      }

    });
    $(".sub-btn").click(function(e){
        idClicked = e.target.id;//get btn clicked id
        idClicked = idClicked.replace('btn-', '');
        var val = $('#'+idClicked+' .sensor-name').html()
        $('.modal-title').html("subscribe "+val+" ?");
        console.log(val);
        $("#myModal").modal("show");
    });
    //subscribe
    $('form').submit(function(event) {
      // stop the form from submitting the normal way and refreshing the page
      event.preventDefault();
       // get the form data
       var optionValue = $("input[name='optionsRadios']:checked").val();
       if(optionValue == "default")
       {
         var formData = {
             "sensorID" : idClicked
         };
       }
       else {
         var formData = {
             "data" : "nothing"
         };
       }
       // there are many ways to get this data using jQuery (you can use the class or id also)
       // process the form
       $.ajax({
           type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
           url         : '/getData/subscribe', // the url where we want to POST
           data        : formData, // our data object
           dataType    : 'json', // what type of data do we expect back from the server
           encode          : true,
           beforeSend: function(){
             $.LoadingOverlay("show", {
               image       : "",
               fontawesome : "fa fa-cog fa-spin"
             });
           },
           complete: function(){
              $.LoadingOverlay("hide");
              console.log("ajax send finish");
              $("#myModal").modal("hide");
           },
           success: function(data){
             console.log(data);
             var html = '<a type="button" class="btn btn-danger unsubBtn" id="unsubBtn-'+data.subListID+'" ><i class="icon-remove"></i></a>';
             $("#"+data.sensorID+" .setting").append(html)
           }
       })
    });
    //advanced radio is click
    $("#optionsRadios2").click(function(){
      var html;
      html = '<input type="text" id="input1" class="span8">';
      $("#i1").html(html);
      html = '<input type="text" id="input2" class="span8">';
      $("#i2").html(html);
      html = '<select tabindex="1" id="selectOption1" data-placeholder="Select here.." class="span8" >';
      html += '<option value="">Select here..</option>';
      html += '<option value="0">0</option>';
      html += '<option value="1">1</option></select>';
      $("#o1").html(html);
    });
    //default radio is click
    $("#optionsRadios1").click(function(){
      var html;
      html = '<input type="text" id="input1" placeholder="You can\'t type something here..." class="span8" disabled>';
      $("#i1").html(html);
      html = '<input type="text" id="input2" placeholder="You can\'t type something here..." class="span8" disabled>';
      $("#i2").html(html);
      html = '<select tabindex="1" id="selectOption1" data-placeholder="You can\'t select here.." class="span8" disabled>';
      html += '<option value="">You can\'t select here..</option>';
      html += '</select>';
      $("#o1").html(html);
    });
});
