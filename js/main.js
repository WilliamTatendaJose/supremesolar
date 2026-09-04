(function ($) {
    "use strict";

    // Navbar: always visible (old theme hid it until scroll — bad for leads)
    $('.navbar-modern').css('display', 'flex');

    // Smooth scrolling on anchor links
    $(".navbar-nav a, .btn-scroll").on('click', function (event) {
        if (this.hash !== "") {
            var $target = $(this.hash);
            if ($target.length) {
                event.preventDefault();
                $('html, body').animate({
                    scrollTop: $target.offset().top - 70
                }, 900, 'easeInOutExpo');
                if ($(this).parents('.navbar-nav').length || $(this).parents('.navbar-collapse').length) {
                    $('.navbar-collapse').collapse('hide');
                }
            }
        }
    });

    // Scroll to Bottom hint (only if present)
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.scroll-to-bottom').fadeOut('slow');
        } else {
            $('.scroll-to-bottom').fadeIn('slow');
        }
    });

    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 600) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({ scrollTop: 0 }, 900, 'easeInOutExpo');
        return false;
    });

    // Gallery carousel (kept for legacy sections if present)
    if ($.fn.owlCarousel && $(".gallery-carousel").length) {
        $(".gallery-carousel").owlCarousel({
            autoplay: true,
            autoplayTimeout: 4000,
            smartSpeed: 800,
            dots: true,
            loop: true,
            nav: true,
            navText: [
                '<i class="fa fa-angle-left" aria-hidden="true"></i>',
                '<i class="fa fa-angle-right" aria-hidden="true"></i>'
            ],
            responsive: {
                0: { items: 1 },
                576: { items: 2 },
                768: { items: 3 },
                992: { items: 3 }
            }
        });
    }

    // FAQ accordion (vanilla, no dependency)
    $(document).on('click', '.faq-q', function () {
        var $card = $(this).closest('.faq-card');
        var wasOpen = $card.hasClass('open');
        $('.faq-card').removeClass('open');
        if (!wasOpen) $card.addClass('open');
    });

    // Active nav highlighting on scroll
    var sections = ['#service', '#packages', '#project', '#reviews', '#faqs', '#contact'];
    $(window).on('scroll', function () {
        var pos = $(this).scrollTop() + 120;
        var current = null;
        sections.forEach(function (id) {
            var $s = $(id);
            if ($s.length && $s.offset().top <= pos) current = id;
        });
        if (current) {
            $('.navbar-nav .nav-link').removeClass('active');
            $('.navbar-nav .nav-link[href="' + current + '"]').addClass('active');
        }
    });
})(jQuery);
