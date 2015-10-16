console.log('intergalactic labs');

$('.splash').ready(function() {
    $('.splash *').css('opacity', 100);
});

new Konami(function() {
    $('.konami').removeClass('u-hidden');
});

/**
 * Feedback Form
 */
function feedback() {
    var form = event.target;
    var data = {
        name: $('#contact-name').val().trim(),
        email: $('#contact-email').val().trim(),
        message: $('#contact-message').val().trim()
    };
    $.ajax({
        url: '/comment',
        type: 'POST',
        headers: {'Content-Type': 'application/json'},
        data: JSON.stringify(data),
        success: function() {
            alert('thanks');
            form.reset();
        }
    });

    return false;
}

/**
 * Join slack channel
 */
function invite() {
  var form = event.target;
  var data = {
    email: $('#invite-email').val().trim()
  };
  $.ajax({
    url: '/slack/invite',
    type: 'POST',
    headers: {'Content-Type': 'application/json'},
    data: JSON.stringify(data),
    success: function(r) {
      console.log(r);
        if (r.err) {
          inviteMessage(r.err);
        } else {
          inviteMessage(r.message);
        }
        form.reset();
    }
  })

  return false;
}

function inviteMessage(message) {
  $('#invite-message').remove();
  $('#invite-email').after('<div id="invite-message">' + message + '</div>');
}

/**
 * Modals
 */
$('.button-join').click(function() {
    $('.modal-backdrop').addClass('active');
    $('.modal-subscribe').addClass('active');
});

$('.modal-close').click(function() {
    $('.modal-backdrop').removeClass('active');
    $('.modal-backdrop *').removeClass('active');
    return false;
});

// add target="_blank" for all the content links
$(function() {
  $('.content a').attr('target', '_blank')
})

// Smooth scroll for in page links
$(function(){
    var target, scroll;

    $("a[href*='#']:not([href='#'])").on("click", function(e) {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
            target = $(this.hash);
            target = target.length ? target : $("[id=" + this.hash.slice(1) + "]");

            if (target.length) {
                if (typeof document.body.style.transitionProperty === 'string') {
                    e.preventDefault();

                    var avail = $(document).height() - $(window).height();

                    scroll = target.offset().top;

                    if (scroll > avail) {
                        scroll = avail;
                    }

                    $("html").css({
                        "margin-top" : ( $(window).scrollTop() - scroll ) + "px",
                        "transition" : "1s ease-in-out"
                    }).data("transitioning", true);
                } else {
                    $("html, body").animate({
                        scrollTop: scroll
                    }, 1000);
                    return;
                }
            }
        }
    });

    $("html").on("transitionend webkitTransitionEnd msTransitionEnd oTransitionEnd", function (e) {
        if (e.target == e.currentTarget && $(this).data("transitioning") === true) {
            $(this).removeAttr("style").data("transitioning", false);
            $("html, body").scrollTop(scroll);
            return;
        }
    });
});
