const getInputValue = () => {
  let sort = $("#sort-by option:selected").val();
  let option = $("#theOption option:selected").val();
  let page = 1;
  if(sort == "date"){
    let start = option;
    let end = moment(start).add(12,'hours').utc().format();
    return { sort,start,end,page}
  }
  else if (sort == "subscription") {
    return {sort,option,page};
  }
  else {
    return {sort,option,page};
  }
}
const changeOptionSelect = (val) => {
  let option
  if(val == "date"){
    var dates = [];
    let date = moment().hour(12).minute(0).second(0).utc().format();
    option = `<option value="">Select here..</option>`;
    dates.push(date);
    for(let i = 1;i < 4;i++) {
      date = moment(dates[i-1]).subtract(12,'hours').utc().format();
      dates.push(date);
    }
    option += `<option value='${dates[0]}'>today , 12pm ~ 12am</option>`;
    option += `<option value='${dates[1]}'>today , 12am ~ 12pm</option>`;
    option += `<option value='${dates[2]}'>yesterday , 12pm ~ 12am</option>`;
    option += `<option value='${dates[3]}'>yesterday , 12am ~ 12pm</option>`;
  }
  else if(val == "subscription") {
    option = `<option value="">Select here..</option>`;
    subscriptions.forEach(sub => {
      option += `<option value="${sub._id}">${sub.title}</option>`;
    });
  }
  else {
    option = `<option value="">Select here..</option>`;
  }
  $('#theOption').html("").html(option);
}
const changeSubscriptionLogs = (data) => {
  if(data.length == 0) {
    swal("It is empty", "no logs during this time", "info");
  }
  else {
    let html = ""
    data.forEach(doc => {
      if(doc.logStatus < 1) {
        var scriptHtml = $("#warning-logMsg-temp")[0].innerHTML;
        var template = Handlebars.compile(scriptHtml);
        var obj = {
          title: doc.title,
          logMsg: doc.logMsg,
          date: doc.date
        };
        html = html + template(obj);
      }
      else {
        var scriptHtml = $("#safe-logMsg-temp")[0].innerHTML;
        var template = Handlebars.compile(scriptHtml);
        var obj = {
          title: doc.title,
          logMsg: doc.logMsg,
          date: doc.date
        };
        html = html + template(obj);
      }
    });
    $(".timeline").html("").html(html);
  }
}
const changePageNum = (num) => {
  let paging = num/15;
  paging = paging.toFixed(0)
  var html = "";
  for(let i = 1;i <= paging;i++){
    html += `<li><a href="#">${i}</a><li>`;
  }
  $('#page-num').html("").html(html);
  console.log(paging);
}
const requestSubscriptionLogs = (data) => {
  $.ajax({
      type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
      url         : '/observe/getSubscriptionLogs', // the url where we want to POST
      data        : data, // our data object
      dataType    : 'json', // what type of data do we expect back from the server
      encode          : true,
      beforeSend: function(){
        console.log("sending ajax");
        $.LoadingOverlay("show", {
          image       : "",
          fontawesome : "fa fa-cog fa-spin"
        });
      },
      complete: function(){
         $.LoadingOverlay("hide");
         console.log("ajax send finish");
      },
      success: function(data){
        //changing timeline content after received data
        changeSubscriptionLogs(data.subscriptionLogs);
        //changing page Number
        if(data.total && data.total > 0){
          changePageNum(data.total);
        }

        ///console.log(data.total);
      },
      error: function(err){
        let msg = JSON.parse(err.responseText);
        swal("something went wrong", msg.msg, "error")
      }
  });
}
$(document).ready(function() {
  //user query subscription logs
  $( "#query-btn" ).click(function() {
    let inputValue = getInputValue();//getting input value
    if(!inputValue.sort && !inputValue.option) {
      swal("can not query", "make sure yours option had being selected", "info")
      return;
    }

    //request new subscription logs and change timeline content
    requestSubscriptionLogs(inputValue);
    $("#page-btn").text("1");
  });
  //user switch fliter selected
  $("#sort-by").change(function() {
    let sort = $("#sort-by option:selected").val();
    changeOptionSelect(sort);
  });
  //user switch page
  $("#page-num").on("click","a", function(e) {
    let page = $(this).text();
    let inputValue = getInputValue();//getting input value
    inputValue.page = page;
    requestSubscriptionLogs(inputValue);
    $("#page-btn").text(page);
  })
});
