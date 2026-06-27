$(function () {

    $("#contactForm input, #contactForm textarea").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function ($form, event, errors) {
        },
        submitSuccess: function ($form, event) {
            event.preventDefault();
            var name = $("input#name").val();
            var email = $("input#email").val();
            var subject = $("input#subject").val();
            var message = $("textarea#message").val();
            var company = $("input#company").val();

            var $this = $("#sendMessageButton");
            var originalText = $this.text();
            $this.prop("disabled", true).text("Sending...");

            $.ajax({
                url: '/api/contact',
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                    name: name,
                    email: email,
                    subject: subject,
                    message: message,
                    company: company
                }),
                success: function (response) {
                    if (response && response.success) {
                        $('#success').html("<div class='alert alert-success'>");
                        $('#success > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                                .append("</button>");
                        $('#success > .alert-success')
                                .append("<strong>" + response.message + "</strong>");
                        $('#success > .alert-success')
                                .append('</div>');
                        $('#contactForm').trigger("reset");
                    } else {
                        $('#success').html("<div class='alert alert-danger'>");
                        $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                                .append("</button>");
                        $('#success > .alert-danger').append($("<strong>").text(response && response.message ? response.message : "Sorry " + name + ", your message could not be sent right now. Please try again later or contact us directly."));
                        $('#success > .alert-danger').append('</div>');
                    }
                },
                error: function () {
                    $('#success').html("<div class='alert alert-danger'>");
                    $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                            .append("</button>");
                    $('#success > .alert-danger').append($("<strong>").text("Sorry " + name + ", your message could not be sent right now. Please try again later or contact us directly."));
                    $('#success > .alert-danger').append('</div>');
                },
                complete: function () {
                    setTimeout(function () {
                        $this.prop("disabled", false).text(originalText);
                    }, 1000);
                }
            });
        },
        filter: function () {
            return $(this).is(":visible");
        },
    });

    $("a[data-toggle=\"tab\"]").click(function (e) {
        e.preventDefault();
        $(this).tab("show");
    });
});

$('#name').focus(function () {
    $('#success').html('');
});
