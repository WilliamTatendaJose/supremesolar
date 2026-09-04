$(function () {
    function showMsg(target, ok, text) {
        var box = $(target);
        box.html("<div class='alert " + (ok ? "alert-success" : "alert-danger") + "'>"
            + "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>"
            + "<strong>" + $("<div>").text(text).html() + "</strong></div>");
    }

    function postLead(payload, $btn, onDone) {
        var original = $btn.html();
        $btn.prop("disabled", true).html("Sending…");
        $.ajax({
            url: '/api/contact',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function (res) {
                if (res && res.success) {
                    onDone(true, res.message);
                } else {
                    onDone(false, (res && res.message) || "Could not send. Please WhatsApp +263 771 557 002.");
                }
            },
            error: function () {
                onDone(false, "Could not send right now. Please WhatsApp us on +263 771 557 002.");
            },
            complete: function () {
                setTimeout(function () { $btn.prop("disabled", false).html(original); }, 1000);
            }
        });
    }

    // Main quote form
    $("#contactForm").on("submit", function (e) {
        e.preventDefault();
        var name = $("#name").val().trim();
        var phone = $("#phone").val().trim();
        var email = $("#email").val().trim();
        var service = $("#quoteService").val();
        var location = $("#location").val().trim();
        var message = $("#message").val().trim();
        var company = $("#company").val();

        if (!name || !phone) { showMsg("#success", false, "Please add your name and phone/WhatsApp number."); return; }
        if (!service) { showMsg("#success", false, "Please choose a service so we route you faster."); return; }

        postLead({ name: name, phone: phone, email: email, service: service, location: location, message: message, company: company, source: "quote-form" },
            $("#sendMessageButton"), function (ok, msg) {
                showMsg("#success", ok, msg);
                if (ok) {
                    $("#contactForm").trigger("reset");
                    // Fire-and-forget analytics hook
                    try { if (window.gtag) gtag('event', 'generate_lead', { method: 'quote-form' }); } catch (_) {}
                }
            });
    });

    // Hero short form
    $("#heroLeadForm").on("submit", function (e) {
        e.preventDefault();
        var name = $("#hero_name").val().trim();
        var phone = $("#hero_phone").val().trim();
        var service = $("#hero_service").val();
        var location = $("#hero_location").val().trim();
        var company = $("#hero_company").val();

        if (!name || !phone) { showMsg("#heroSuccess", false, "Add your name + WhatsApp number and we'll call back."); return; }
        if (!service) { showMsg("#heroSuccess", false, "Pick what you need so we quote correctly."); return; }

        postLead({ name: name, phone: phone, email: "", service: service, location: location, message: "", company: company, source: "hero-form" },
            $("#heroSubmit"), function (ok, msg) {
                showMsg("#heroSuccess", ok, ok ? msg + " Or jump the queue on WhatsApp →" : msg);
                if (ok) {
                    $("#heroLeadForm").trigger("reset");
                    try { if (window.gtag) gtag('event', 'generate_lead', { method: 'hero-form' }); } catch (_) {}
                }
            });
    });

    // Service/package buttons pre-fill the main form
    $(document).on("click", "[data-service]", function () {
        var svc = $(this).data("service");
        var $sel = $("#quoteService");
        if ($sel.length && svc) {
            $sel.val(svc);
            if (!$sel.val()) {
                // fuzzy match if option text differs
                $sel.find("option").each(function () {
                    if ($(this).text().toLowerCase().indexOf(String(svc).split(" ")[0].toLowerCase()) > -1) {
                        $sel.val($(this).val() || $(this).text());
                        return false;
                    }
                });
            }
        }
    });

    $('#name, #phone').on("focus", function () { $('#success').html(''); });
});
