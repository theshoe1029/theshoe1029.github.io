function move1() {
    var elem = document.getElementById("bar1");
    var width = 1;
    var id = setInterval(frame, 10);

    function frame() {
        if (width >= 100) {
            clearInterval(id);
        } else {
            width++;
            elem.style.width = width + '%';
        }
    }
}
function move2() {
    var elem = document.getElementById("bar2");
    var width = 1;
    var id = setInterval(frame, 10);

    function frame() {
        if (width >= 90) {
            clearInterval(id);
        } else {
            width++;
            elem.style.width = width + '%';
        }
    }
}
function move3() {
    var elem = document.getElementById("bar3");
    var width = 1;
    var id = setInterval(frame, 10);

    function frame() {
        if (width >= 80) {
            clearInterval(id);
        } else {
            width++;
            elem.style.width = width + '%';
        }
    }
}
function move4() {
    var elem = document.getElementById("bar4");
    var width = 1;
    var id = setInterval(frame, 10);

    function frame() {
        if (width >= 70) {
            clearInterval(id);
        } else {
            width++;
            elem.style.width = width + '%';
        }
    }
}
function move5() {
    var elem = document.getElementById("bar5");
    var width = 1;
    var id = setInterval(frame, 10);

    function frame() {
        if (width >= 70) {
            clearInterval(id);
        } else {
            width++;
            elem.style.width = width + '%';
        }
    }
}
function move6() {
    var elem = document.getElementById("bar6");
    var width = 1;
    var id = setInterval(frame, 10);

    function frame() {
        if (width >= 60) {
            clearInterval(id);
        } else {
            width++;
            elem.style.width = width + '%';
        }
    }
}
function move7() {
    var elem = document.getElementById("bar7");
    var width = 1;
    var id = setInterval(frame, 10);

    function frame() {
        if (width >= 60) {
            clearInterval(id);
        } else {
            width++;
            elem.style.width = width + '%';
        }
    }
}
function move8() {
    var elem = document.getElementById("bar8");
    var width = 1;
    var id = setInterval(frame, 10);

    function frame() {
        if (width >= 30) {
            clearInterval(id);
        } else {
            width++;
            elem.style.width = width + '%';
        }
    }
}
function move9() {
    var elem = document.getElementById("bar9");
    var width = 1;
    var id = setInterval(frame, 10);

    function frame() {
        if (width >= 100) {
            clearInterval(id);
        } else {
            width++;
            elem.style.width = width + '%';
        }
    }
}
function move10() {
    var elem = document.getElementById("bar10");
    var width = 1;
    var id = setInterval(frame, 10);

    function frame() {
        if (width >= 100) {
            clearInterval(id);
        } else {
            width++;
            elem.style.width = width + '%';
        }
    }
}
function move11() {
    var elem = document.getElementById("bar11");
    var width = 1;
    var id = setInterval(frame, 10);

    function frame() {
        if (width >= 90) {
            clearInterval(id);
        } else {
            width++;
            elem.style.width = width + '%';
        }
    }
}
function move12() {
    var elem = document.getElementById("bar12");
    var width = 1;
    var id = setInterval(frame, 10);

    function frame() {
        if (width >= 80) {
            clearInterval(id);
        } else {
            width++;
            elem.style.width = width + '%';
        }
    }
}
function move13() {
    var elem = document.getElementById("bar13");
    var width = 1;
    var id = setInterval(frame, 10);

    function frame() {
        if (width >= 60) {
            clearInterval(id);
        } else {
            width++;
            elem.style.width = width + '%';
        }
    }
}
function move14() {
    var elem = document.getElementById("bar14");
    var width = 1;
    var id = setInterval(frame, 10);

    function frame() {
        if (width >= 50) {
            clearInterval(id);
        } else {
            width++;
            elem.style.width = width + '%';
        }
    }
}
function move15() {
    var elem = document.getElementById("bar15");
    var width = 1;
    var id = setInterval(frame, 10);

    function frame() {
        if (width >= 40) {
            clearInterval(id);
        } else {
            width++;
            elem.style.width = width + '%';
        }
    }
}

function animateBars()
{
	move1();
    move2();
    move3();
    move4();
    move5();
    move6();
    move7();
    move8();
    move9();
    move10();
    move11();
    move12();
    move13();
    move14();
    move15();
}

function testScores()
{
    $("#sat").fadeIn(1500);
}

var ran = false;

$(window).scroll(function() {
   var hT = $("#bar8").offset().top,
       hH = $("#bar8").outerHeight(),
       wH = $(window).height(),
       wS = $(this).scrollTop();
   if (wS > (hT+hH-wH)){
   	   if(!ran)
   	   {
       		animateBars();
            ran = true;
       }
   }
});


