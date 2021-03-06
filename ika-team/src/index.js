var page, channel, date, user;
$(window).on('load', function() {
  if (location.href.indexOf("index.php") != -1) {
    location.href = location.href.replace("index.php", "");
  }
  if (location.href.indexOf("#") == -1 || location.href.split("#")[1].split("/")[0].length == 0) {
    location.href += "#main/";
  } else {
    update();
  }
  $(window).resize(function() {
    $(".datelog:visible").children().css("height", window.innerHeight - 350 + "px");
  });
});
$(window).on('hashchange', function(a) {
  update();
});
function update() {
  page = location.href.split("#")[1].split("/")[0];
  $(".content > div").hide();
  $(".topic a").css("font-size", "20.8px").css("font-weight", "normal");
  $(".topic a[href*='" + page + "']").css("font-size", "25px").css("font-weight", "bold");
  $("#" + page).show();
  if (page == "logs") {
    $(".channel a").css("font-size", "20.8px").css("font-weight", "normal");;
    $(".date a").css("font-size", "1em").css("font-weight", "normal");;
    $(".datelog").hide();

    oldChannel = channel;
    channel = location.href.split("#logs/")[1];
    if (!channel) {
      $(".datebar").hide();
      return;
    }
    user = channel.indexOf("#") == -1;
    $(".date a").each(function() { $(this).attr("href", $(this).attr("href").replace("#logs/#", "#logs/"));  });
    if (!user) {
      $(".date a").each(function() { $(this).attr("href", $(this).attr("href").replace("#logs/", "#logs/#"));  });
    }

    channel = channel.replace("#", "");
    channel = channel.split("/")[0];
    if (oldChannel != "" && oldChannel != channel) {
      $(".date a").each(function() { $(this).attr("href", $(this).attr("href").replace(oldChannel, channel));  });
    }

    $(".channel a").filter(function() {
      return $(this).text() == "#" + channel || $(this).text() == channel;
    }).css("font-size", "25px").css("font-weight", "bold");

    $(".datebar").show();

    date = location.href.split("#logs/")[1].split("/")[1];
    if (!date) {
      $(".datelogs").hide();
      return;
    } else if (!$(".dates").children().length) {
      while ( width < 600) {
        createDate();
      }
    }

    $(".date a").filter(function() {
      return $(this).attr('href') == "#logs/" + (user ? "" : "#") + channel + "/" + date;
    }).css("font-size", "1.2em").css("font-weight", "bold");

    if ($("[id*='log-" + channel + "-" + date + "']").length) {
      if (date != "today") {
        $("[id*='log-" + channel + "-" + date + "']").css("display", "inline-block");
      } else {
        $("[id*='log-" + channel + "-" + date + "']").remove();
        getLog();
      }
    } else {
      getLog();
    }
  } else if (page == "paste") {
    $("#oldPaste").parent().hide();
    id = location.href.split("#")[1].split("/")[1];
    if (id) {
      getPaste(id);
    }
  }
}

function getPaste(id) {
  $.get("paste.php?id=" + id, function (data) {
    $("#oldPaste").text(data);
    $("#oldPaste").parent().show();
  }).fail(function(data) {
    if (data.status == 401) {
      showInfo(data.respondeText)
      location.href = "login.php";
    } else {
      showInfo("Error: " + data.status + " (" + data.statusText + ")");
    }
  });
}

function getLog() {
  d = $("<div class='datelog'><pre class='datelog-pre'>");
  d.attr("id", "log-" + channel + "-" + date);
  $(".datelogs").append(d);
  d.children().css("height", window.innerHeight - 350 + "px");
  d.css("display", "inline-block");
  $.get("log.php?channel=" + channel + "&date=" + date + (user ? "&user" : ""), {dataType: 'html'}, function(data) {
    a = this.url.split("?")[1].split("&");
    updateLog($("[id*='log-" + a[0].split("=")[1] + "-" + a[1].split("=")[1] + "']"), data)
  }).fail(function(data) {
    a = this.url.split("?")[1].split("&");
    logElement = $("[id*='log-" + a[0].split("=")[1] + "-" + a[1].split("=")[1] + "']");
    if (data.status == 401) {
      updateLog(logElement, data.respondeText)
      location.href = "login.php";
    } else {
      updateLog(logElement, "Error: " + data.status + " (" + data.statusText + ")");
    }
  });
}

function updateLog(log, text) {
  log.children().html(text);
  log.css("background", "none");
}

var loc = 0;
var width = 0;

function createDate() {
  text = "";
  if ($(".date").last().length) {
    d = new Date(new Date($(".date").last().attr("id").replace("date", "")).setHours(-24,0,0,0));
    if (d.getTime() == new Date().setHours(-24,0,0,0)) {
      text = "yesterday";
    }
  } else if (date == "today") {
    text = "today";
    d = new Date(new Date().setHours(0,0,0,0));
  } else if (date == "yesterday") {
    text = "yesterday";
    d = new Date(new Date().setHours(-24,0,0,0));
  } else {
    d = new Date(new Date(date).setHours(0,0,0,0));
  }
  d = d.getFullYear() + "-" + pad(d.getMonth()+1+"") + "-" + pad(d.getDate()+""); 
  text = text.length == 0 ? d : text;
  div = $("<div class='date' id='date" + d + "'><a href='#logs/" + (user ? "" : "#") + channel + "/" + text + "' >" + text + "</a></div>");
  $(".dates").append(div);
  width += div.outerWidth(true);
}

function reverseCreateDate() {
  text = "";
  if ($(".date").first().text() != "today") {
    d = new Date(new Date($(".date").first().attr("id").replace("date", "")).setHours(24,0,0,0));
    if (d.getTime() == new Date().setHours(-24,0,0,0)) {
      text = "yesterday";
    } else if (d.getTime() == new Date(new Date().setHours(0,0,0,0)).getTime()) {
      text = "today";
    } else {
      text = d.getFullYear() + "-" + pad(d.getMonth()+1+"") + "-" + pad(d.getDate()+"");
    }
    d = d.getFullYear() + "-" + pad(d.getMonth()+1+"") + "-" + pad(d.getDate()+"");
    div = $("<div class='date' id='date" + d + "'><a href='#logs/" + (user ? "" : "#") + channel + "/" + text + "' >" + text + "</a></div>");
    $(".dates").prepend(div);
    $(".dates").scrollLeft($(".dates").scrollLeft() + div.outerWidth(true));
    width += div.outerWidth(true);
    loc += div.outerWidth(true);
  } else {
    loc = 0;
  }
}

function pad(n){
 return n.length == 1 ? "0" + n : n;
}
function moveToRight(a) {
  while (a > 0) {
    loc += a > 1000 ? 1000 : a;
    while ( width - a < loc ) {
      createDate();
    }
    $(".dates").animate({scrollLeft: loc}, 100000/a);
    a -= 1000;
  }
}
function moveToLeft(a) {
  while (a > 0) {
    loc -= a > 1000 ? 1000 : a;
    while (loc < 0) {
      reverseCreateDate();
    }
    $(".dates").animate({scrollLeft: loc}, 100000/a );
    a -= 1000;
  }
}
function updateProfile() {
  $(".settingsCenter").css("background", "url(load.gif) no-repeat center 100px");
  $.ajax({
      url:"profile.php",
      type:"POST",
      data:$(".settings form").serializeArray()
  }).done(function (data) {
    $(".settingsCenter").css("background", "none");
    showInfo("Profiili päivitetty" + data);
  }).fail(function(data) {
    $(".settingsCenter").css("background", "none");
    showInfo("Error: " + data.status + " (" + data.statusText + ")");
  });
}
function showInfo(info) {
  $(".infobubble p").text(info);
  $(".infobubble").show();
}
function showInfoHtml(info) {
  $(".infobubble p").html(info);
  $(".infobubble").show();
}
function sendPaste() {
  $(".paste").css("background", "url(load.gif) no-repeat center 100px");
  $.ajax({
    url:"paste.php",
    type:"POST",
    data:$(".paste form").serializeArray()
  }).done(function (data) {
    $(".paste").css("background", "none");
    showInfoHtml("<input type='text' value='" + location.href.split("#")[0] + "#paste/" + data + "'>");
    $(".infobubble p").children().select();
    location.href = "#paste/" + data;
  }).fail(function(data) {
    $(".paste").css("background", "none");
    showInfo("Error: " + data.status + " (" + data.statusText + ")");
  });

}
