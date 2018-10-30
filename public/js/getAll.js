
var idClicked;
$("#vertical-menu1 a:first").addClass("active");
$(document).ready(function(){
    // $("#myModal").modal("show");
    // $("#myModal").modal("hide");
    toastr.options.closeButton = true;
    for(var i = 0;i < sub_result.length;i++) {
      var html = '<a class="btn-icon btn-danger unsubBtn" id="unsubBtn-'+sub_result[i].subscribeID+'" ><i class="icon-remove"></i></a>';
      $("#"+sub_result[i].sensorID+" .setting").append(html)
    }

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
              toastr.success('unsubscribe success!')

              //alert("unsubscribe success!");
            },
            error: function(){
              toastr.error('unsubscribe failed!')
              //alert("unsubscribe failed!");
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
    $("#form-submit").click(function(event) {
      // stop the form from submitting the normal way and refreshing the page
      event.preventDefault();
      //return false;
       // get the form data
       var optionValue = $("input[name='optionsRadios']:checked").val();
       if(optionValue == "default")
       {
         var formData = {
             "sensorID": idClicked,
             "option": "default"
         };
       }
       else {
         var condition = [];
         if($("#input1").val()) {
           var data = {
             "type": "max",
             "value": Number($("#input1").val())
           };
           condition.push(data);
         }
         if($("#input2").val()) {
           var data = {
             "type": "min",
             "value": Number($("#input2").val())
           };
           condition.push(data);
         }
         if($("#selectOption1 option:selected").val()) {
           var data = {
             "type": "precision",
             "value": $("#selectOption1 option:selected").val()
           };
           condition.push(data);
         }
         if(condition.length == 0) {
           swal("something went wrong", "input text or select option is empty", "warning")
           return;
         }
         // data
         // {
         //   "sensorID": "as6df4sa64fs6d64",
         //   "option": "advanced",
         //   "condition": [{type:"max",value:30}]
         // }
         var formData = {
             "sensorID": idClicked,
             "option": "advanced",
             "condition": condition
         };
         console.log(formData);
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
             if($("#unsubBtn-"+data.subListID).html()) {
               $("#unsubBtn-"+data.subListID).remove();
             }
             var html = '<a type="button" class="btn btn-danger unsubBtn" id="unsubBtn-'+data.subListID+'" ><i class="icon-remove"></i></a>';
             $("#"+data.sensorID+" .setting").append(html)
           }
       })
       //return false;

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

    var sensorArray = [];
    allSensor.data.forEach(thisSensor => {
      sensorArray.push(thisSensor.name);
    });
    // Initialize autocomplete with custom appendTo:
    $('#autocomplete-dynamic').autocomplete({
        source: sensorArray
    });
    //vertical-menu1 is click
    $("#vertical-menu1 a").click(function(e){
      e.preventDefault();
      $("#vertical-menu1 a").removeClass( "active" );
      $(this).addClass("active");
      var text = $(this).text();
      $("#form1 #autocomplete-dynamic").val(text);
    });
    //switching enabled
    $("#form1 #Radios2").click(function(){
      $("#form1 #advanced-block").removeClass("enabled");
    });
    $("#form1 #Radios1").click(function(){
      $("#form1 #advanced-block").addClass("enabled");
    });
    //when form1 add btn being click
    var subscription = [];//used for saving multiple subscrition
    $('#form1').on('click', '#form1-add', function(e) {
      var form1_inputName = $("#autocomplete-dynamic").val();
      var form1_id = "";
      //find the sensor._id
      for(var i = 0;i < allSensor.data.length;i++) {
        if(form1_inputName == allSensor.data[i].name) {
          form1_id = allSensor.data[i]._id;
          break;
        }
      }
      if(!form1_id) {
        swal("something went wrong", "this sensor does not exist", "warning")
        return;
      }
      var form1_optionValue = $("input[name='form1-optionsRadios']:checked").val();
      if(form1_optionValue == "default")//optionValue is default
      {
        var form1_Data = {
            _sensorID: form1_id,
            name: form1_inputName,
            option: form1_optionValue
        };
      }
      else {//optionValue is advanced
        var condition = [];
        if($("#form1_maxValue").val()) {
          var data = {
            type: "max",
            value: Number($("#form1_maxValue").val())
          };
          condition.push(data);
        }
        if($("#form1_minValue").val()) {
          var data = {
            type: "min",
            value: Number($("#form1_minValue").val())
          };
          condition.push(data);
        }
        if($("#form1_precisionValue option:selected").val()) {
          var data = {
            type: "precision",
            value: $("#form1_precisionValue option:selected").val()
          };
          condition.push(data);
        }
        //advanced input field is empty
        if(condition.length == 0) {
          swal("something went wrong", "advanced condition can't be empty", "warning")
          return;
        }
        var form1_Data = {
          _sensorID: form1_id,
          name: form1_inputName,
          option: "advanced",
          condition: condition
        };
      }
      // end else //
      //find user subscribe insert before
      var findMatch = subscription.findIndex(obj => obj.name == form1_Data.name);
      if(findMatch > -1) {
        subscription.splice(findMatch, 1);//remove the matching subscription
      }
      subscription.push(form1_Data);

      $("#form2 #form2-subscription").val(
        JSON.stringify(subscription.map(thisSub =>{
          if(thisSub.option == "default") {
            return {
              name:thisSub.name,
              option:thisSub.option
            };
          }
          else {
            return {
              name:thisSub.name,
              option:thisSub.option,
              condition:thisSub.condition
            };
          }
        }),null,3)
      );

    });

    //clear subscription
    $("#form2 #form2-clearBtn").click(function(){
      subscription = [];
      $("#form2 #form2-subscription").val("");
    });

    //submit subscription
    $("#form2 #form2-submitBtn").click(function(){
      if(subscription.length > 0)
      { //calling ajax to post subscription
        $.ajax({
            type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
            url         : '/getData/subscribeMany', // the url where we want to POST
            data        : {subscription}, // {subscription : subscription}
            dataType    : 'json', // what type of data do we expect back from the server
            // encode      : true,
            beforeSend: function(){
              // $.LoadingOverlay("show", {
              //   image       : "",
              //   fontawesome : "fa fa-cog fa-spin"
              // });
              $("#form2 #form2-submitBtn").attr('disabled', 'disabled').text('Sending');
            },
            complete: function(){

               console.log("ajax send finish");
               //$("#myModal").modal("hide");
            },
            success: function(data){
              //alert("success");
              // $.LoadingOverlay("hide");
              $("#form2 #form2-submitBtn").removeAttr('disabled').text('Submit');
              swal("Yours subscribe is success", " ", "success")
                .then(() => {
                  window.location.reload();
                })
            },
            error: function(data){
              $("#form2 #form2-submitBtn").removeAttr('disabled').text('Submit');
              swal("something went wrong", "please check your subscription", "error")
            }
        })

      }
      else {

        swal("something went wrong", "subscription is empty", "warning")
      }
    });


});
