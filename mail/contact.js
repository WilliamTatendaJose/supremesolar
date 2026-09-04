$(function () {
    function showMsg(target, ok, text) {
        var box = $(target);
        box.html("<div class='alert " + (ok ? "alert-success" : "alert-danger") + "'>"
            + "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>"
            + "<strong>" + $("<div>").text(text).html() + "</strong></div>");
    }

    // Hero short form (the main quote flow lives in js/quote.js)
    $("#heroLeadForm").on("submit", function (e) {
        e.preventDefault();
        var name = $("#hero_name").val().trim();
        var phone = $("#hero_phone").val().trim();
        var service = $("#hero_service").val();
        var location = $("#hero_location").val().trim();
        var company = $("#hero_company").val();

        if (!name || !phone) { showMsg("#heroSuccess", false, "Add your name + WhatsApp number and we'll call back."); return; }
        if (!service) { showMsg("#heroSuccess", false, "Pick what you need so we quote correctly."); return; }

        var $btn = $("#heroSubmit");
        var original = $btn.html();
        $btn.prop("disabled", true).html("Sending…");

        $.ajax({
            url: '/api/contact',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                name: name, phone: phone, email: "", service: service,
                location: location, message: "", company: company, source: "hero-form"
            }),
            success: function (res) {
                if (res && res.success) {
                    showMsg("#heroSuccess", true, res.message);
                    $("#heroLeadForm").trigger("reset");
                    try { if (window.gtag) gtag('event', 'generate_lead', { method: 'hero-form' }); } catch (_) {}
                } else {
                    showMsg("#heroSuccess", false, (res && res.message) || "Could not send. Please WhatsApp +263 771 557 002.");
                }
            },
            error: function () {
                showMsg("#heroSuccess", false, "Could not send right now. Please WhatsApp us on +263 771 557 002.");
            },
            complete: function () {
                setTimeout(function () { $btn.prop("disabled", false).html(original); }, 1000);
            }
        });
    });

    $('#hero_name, #hero_phone').on("focus", function () { $('#heroSuccess').html(''); });
});
