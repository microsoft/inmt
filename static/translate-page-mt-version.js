function key2char(str) {
    var keychar = String.fromCharCode(str);
    switch (str) {
        
    case 1:
        // left mouse click
        keychar = "Mouse: left button";
        break;
    case 2:
        // middle mouse click
        keychar = "Mouse: middle button";
        break;
    case 3:
        // right mouse click
        keychar = "Mouse: right button";
        break;
            
    case 8:
        //  backspace
        keychar = "Backspace";
        break;
    case 9:
        //  tab
        keychar = "Tab";
        break;
    case 13:
        //  enter
        keychar = "Enter";
        break;
    case 16:
        //  shift
        keychar = "Shift";
        break;
    case 17:
        //  ctrl
        keychar = "Ctrl";
        break;
    case 18:
        //  alt
        keychar = "Alt";
        break;
    case 19:
        //  pause/break
        keychar = "Pause/Break";
        break;
    case 20:
        //  caps lock
        keychar = "Caps Lock";
        break;
    case 27:
        //  escape
        keychar = "Escape";
        break;
    case 33:
        // page up, to avoid displaying alternate character and confusing people             
        keychar = "Page Up";
        break;
    case 34:
        // page down
        keychar = "Page Down";
        break;
    case 35:
        // end
        keychar = "End";
        break;
    case 36:
        // home
        keychar = "Home";
        break;
    case 37:
        // left arrow
        keychar = "Left Arrow";
        break;
    case 38:
        // up arrow
        keychar = "Up Arrow";
        break;
    case 39:
        // right arrow
        keychar = "Right Arrow";
        break;
    case 40:
        // down arrow
        keychar = "Down Arrow";
        break;
    case 45:
        // insert
        keychar = "Insert";
        break;
    case 46:
        // delete
        keychar = "Delete";
        break;
    case 91:
        // left window
        keychar = "Window Left";
        break;
    case 92:
        // right window
        keychar = "Window Right";
        break;
    case 93:
        // select key
        keychar = "Context Menu (select key)";
        break;
    case 96:
        // NumPad 0
        keychar = "NumPad 0";
        break;
    case 97:
        // NumPad 1
        keychar = "NumPad 1";
        break;
    case 98:
        // NumPad 2
        keychar = "NumPad 2";
        break;
    case 99:
        // NumPad 3
        keychar = "NumPad 3";
        break;
    case 100:
        // NumPad 4
        keychar = "NumPad 4";
        break;
    case 101:
        // NumPad 5
        keychar = "NumPad 5";
        break;
    case 102:
        // NumPad 6
        keychar = "NumPad 6";
        break;
    case 103:
        // NumPad 7
        keychar = "NumPad 7";
        break;
    case 104:
        // NumPad 8
        keychar = "NumPad 8";
        break;
    case 105:
        // NumPad 9
        keychar = "NumPad 9";
        break;
    case 106:
        // multiply
        keychar = "NumPad * (multiply)";
        break;
    case 107:
        // add
        keychar = "NumPad + (add)";
        break;
    case 109:
        // subtract
        keychar = "NumPad - (subtract)";
        break;
    case 110:
        // decimal point
        keychar = "NumPad . (decimal point)";
        break;
    case 111:
        // divide
        keychar = "NumPad / (divide)";
        break;
    case 112:
        // F1
        keychar = "F1";
        break;
    case 113:
        // F2
        keychar = "F2";
        break;
    case 114:
        // F3
        keychar = "F3";
        break;
    case 115:
        // F4
        keychar = "F4";
        break;
    case 116:
        // F5
        keychar = "F5";
        break;
    case 117:
        // F6
        keychar = "F6";
        break;
    case 118:
        // F7
        keychar = "F7";
        break;
    case 119:
        // F8
        keychar = "F8";
        break;
    case 120:
        // F9
        keychar = "F9";
        break;
    case 121:
        // F10
        keychar = "F10";
        break;
    case 122:
        // F11
        keychar = "F11";
        break;
    case 123:
        // F12
        keychar = "F12";
        break;
    case 144:
        // num lock
        keychar = "Num Lock";
        break;
    case 145:
        // scroll lock
        keychar = "Scroll Lock";
        break;
    case 186:
        // semi-colon
        keychar = ";";
        break;
    case 187:
        // equal-sign
        keychar = "=";
        break;
    case 188:
        // comma
        keychar = ",";
        break;
    case 189:
        // dash
        keychar = "-";
        break;
    case 190:
        // period
        keychar = ".";
        break;
    case 191:
        // forward slash
        keychar = "/";
        break;
    case 192:
        // grave accent
        keychar = "`";
        break;
    case 219:
        // open bracket
        keychar = "[";
        break;
    case 220:
        // back slash
        keychar = "\\";
        break;
    case 221:
        // close bracket
        keychar = "]";
        break;
    case 222:
        // single quote
        keychar = "'";
        break;
    }
    return keychar
  }

  function strip(html)
        {
          var tmp = document.createElement("DIV");
          tmp.innerHTML = html;
          return tmp.textContent || tmp.innerText || "";
        }

      function resetcolors(elem, nums) {
        for (i=0; i<nums; i++) {
          $(elem + i).css({"background-color": "transparent"})
        }
      }

      function sharedStart(feed, partial) {
        lastspace = partial.lastIndexOf(" ")
        part1text = partial.substring(0, lastspace)
        part2text = partial.substring(lastspace+1)
        var count = 0
        if (part1text) {
          newfeed = feed.replace(part1text + " ", '')
          
        } else {
          newfeed = feed
        }
        for (i=0; i<part2text.length; i++) {
          if(part2text[i] === newfeed[i]){
            count = count + 1;
          } else {
            break;
          }
        }
        newfeedpre = newfeed.substring(0, count)
        newfeedsuf = newfeed.substring(count)
        if (newfeedpre == "" && newfeedsuf == "") {
          return ""
        }
        return '<b>' + newfeedpre + '</b>' + newfeedsuf
      }

      function placeCaretAtEnd(el) {
        el.focus();
        if (typeof window.getSelection != "undefined"
                && typeof document.createRange != "undefined") {
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != "undefined") {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(false);
            textRange.select();
        }
    }

    function endsWithSpace(str) {
      var endSpace = /\s$/;
      if (endSpace.test(str)) {
        return true
      } else {
        return false
      }
    }

    function inputSpan(str) {
      var strlist = str.split(" ");
      var container = ""
      for (k=0; k<strlist.length; k++) {
        container += '<span class="hin_inp_part hin_inp_part' + k + '">' + strlist[k] + '</span> '
      }
      return container
    }