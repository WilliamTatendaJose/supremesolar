/* Supreme Solar — guided quotation wizard.
   Indicative estimates are seeded from published on-site ranges
   (Essential 3kVA from US$1,800; Family 5kVA US$3,500–6,500).
   Everything else is survey-priced. Adjust QUOTES below when real
   price lists are confirmed. */
$(function () {
    "use strict";

    if (!$("#quoteWizard").length) return;

    // Editable indicative pricing (shown as "indicative", fixed quote follows survey)
    var QUOTES = {
        essential: { label: "Essential 3kVA", range: "from US$1,800 fitted" },
        family: { label: "Family 5kVA", range: "US$3,500–6,500 fitted" },
        biz5: { label: "5kVA commercial", range: "US$3,500–6,500 fitted" }
    };

    var S = {
        service: null, needs: [], pkg: null, biz: null,
        water: [], repair: null, location: "", timing: "As soon as possible"
    };
    var estimatePlain = "";

    var STEP_LABELS = {
        1: "Step 1 of 4 · What do you need?",
        2: "Step 2 of 4 · About the job",
        3: "Step 3 of 4 · Site details",
        4: "Step 4 of 4 · Review & send"
    };
    var STEP2_TITLES = {
        "Solar for home": "Home solar — what must it run?",
        "Solar for business / farm": "Business solar — roughly what size?",
        "Borehole drilling / survey": "Water — what do you need?",
        "Repair / maintenance": "Repair — what's faulty?"
    };
    var PANES = {
        "Solar for home": "#paneHome",
        "Solar for business / farm": "#paneBiz",
        "Borehole drilling / survey": "#paneWater",
        "Repair / maintenance": "#paneRepair"
    };

    function go(n) {
        $("#quoteWizard .wiz-step").removeClass("active");
        $('#quoteWizard .wiz-step[data-step="' + n + '"]').addClass("active");
        $("#wizBarFill").css("width", (n / 4 * 100) + "%");
        $("#wizStepLabel").text(STEP_LABELS[n]);
        if (n === 2) { renderPane(); updateEstimate(); }
        if (n === 4) renderReview();
    }

    function err(id, msg) { $(id).text(msg || ""); }

    // ---- Step 1: service pick ----
    $("#wizServiceOpts").on("click", ".wiz-opt", function () {
        $("#wizServiceOpts .wiz-opt").removeClass("active");
        $(this).addClass("active");
        S.service = $(this).data("value");
        err("#wizErr1");
    });

    // ---- Step 2: panes ----
    function renderPane() {
        $(".wiz-pane").removeClass("active");
        $(PANES[S.service]).addClass("active");
        $("#wizStep2Title").text(STEP2_TITLES[S.service]);
        err("#wizErr2");
    }

    function syncChips($wrap, arr) {
        $wrap.find(".chip").each(function () {
            var v = $(this).data("value");
            $(this).toggleClass("active", arr.indexOf(v) > -1);
        });
    }

    $("#homeNeeds").on("click", ".chip", function () {
        var v = $(this).data("value");
        var i = S.needs.indexOf(v);
        if (i > -1) S.needs.splice(i, 1); else S.needs.push(v);
        $(this).toggleClass("active");
        updateEstimate();
    });

    $("#quoteWizard").on("click", ".wiz-pkg", function () {
        $(".wiz-pkg").removeClass("active");
        $(this).addClass("active");
        S.pkg = $(this).data("value");
        err("#wizErr2");
        updateEstimate();
    });

    $("#quoteWizard").on("click", ".wiz-biz", function () {
        $(".wiz-biz").removeClass("active");
        $(this).addClass("active");
        S.biz = $(this).data("value");
        err("#wizErr2");
        updateEstimate();
    });

    $("#waterNeeds").on("click", ".chip", function () {
        var v = $(this).data("value");
        var i = S.water.indexOf(v);
        if (i > -1) S.water.splice(i, 1); else S.water.push(v);
        $(this).toggleClass("active");
        err("#wizErr2");
        updateEstimate();
    });

    $("#quoteWizard").on("click", ".wiz-rep", function () {
        $(".wiz-rep").removeClass("active");
        $(this).addClass("active");
        S.repair = $(this).data("value");
        err("#wizErr2");
        updateEstimate();
    });

    function esc(s) { return $("<div>").text(s).html(); }

    function updateEstimate() {
        var html = "<i class='fa fa-tag mr-2'></i><span>Pick options above to see your indicative estimate.</span>";
        estimatePlain = "";
        var hint = $("#homeHint").removeClass("show").text("");

        if (S.service === "Solar for home") {
            var heavy = S.needs.filter(function (n) {
                return n === "Borehole pump" || n === "Geyser" || n === "Electric stove";
            });
            if (heavy.length && (!S.pkg || S.pkg === "essential")) {
                hint.text("Heads up: " + heavy.join(" + ") + " usually needs 5kVA or more — we recommend Family 5kVA.").addClass("show");
            }
            if (S.pkg === "essential") {
                estimatePlain = "Indicative: " + QUOTES.essential.label + " " + QUOTES.essential.range;
                html = "<i class='fa fa-tag mr-2'></i><span><strong>" + esc(estimatePlain) + ".</strong> Fixed price confirmed after your free survey.</span>";
            } else if (S.pkg === "family") {
                estimatePlain = "Indicative: " + QUOTES.family.label + " " + QUOTES.family.range;
                html = "<i class='fa fa-tag mr-2'></i><span><strong>" + esc(estimatePlain) + ".</strong> Fixed price confirmed after your free survey.</span>";
            } else if (S.pkg === "unsure" && S.needs.length) {
                estimatePlain = heavy.length ? "Likely Family 5kVA class (US$3,500–6,500)" : "Likely Essential 3kVA class (from US$1,800)";
                html = "<i class='fa fa-tag mr-2'></i><span>Based on your loads: <strong>" + esc(estimatePlain) + ".</strong> We confirm exact sizing at the free survey.</span>";
            }
        } else if (S.service === "Solar for business / farm") {
            if (S.biz === "5kVA") {
                estimatePlain = "Indicative: " + QUOTES.biz5.label + " " + QUOTES.biz5.range;
                html = "<i class='fa fa-tag mr-2'></i><span><strong>" + esc(estimatePlain) + ".</strong> Fixed price confirmed after your free site survey.</span>";
            } else if (S.biz && S.biz !== "unsure") {
                estimatePlain = "Survey-priced (" + S.biz + " commercial)";
                html = "<i class='fa fa-tag mr-2'></i><span><strong>" + esc(S.biz) + " systems are survey-priced</strong> — fixed commercial quote within 24hrs of the site visit.</span>";
            } else if (S.biz === "unsure") {
                estimatePlain = "Survey-priced (to be sized)";
                html = "<i class='fa fa-tag mr-2'></i><span>No problem — <strong>we size it at the free survey</strong> and send a fixed quote within 24hrs.</span>";
            }
        } else if (S.service === "Borehole drilling / survey") {
            if (S.water.length) {
                estimatePlain = "Survey-priced (" + S.water.join(" + ") + ")";
                html = "<i class='fa fa-tag mr-2'></i><span><strong>Water work is survey-priced</strong> — fixed quote within 24hrs. Typical Harare turnaround: survey in 48hrs.</span>";
            }
        } else if (S.service === "Repair / maintenance") {
            if (S.repair) {
                estimatePlain = "Callout + on-site fixed quote (" + S.repair + ")";
                html = "<i class='fa fa-tag mr-2'></i><span><strong>" + esc(S.repair) + ":</strong> we confirm a callout on WhatsApp, then give an honest fix-or-replace quote on site.</span>";
            }
        }
        $("#wizEstimate").html(html);
    }

    // ---- Navigation ----
    $(".wiz-next").on("click", function () {
        var next = parseInt($(this).data("next"), 10);
        if (next === 2) {
            if (!S.service) { err("#wizErr1", "Pick one option to continue."); return; }
        }
        if (next === 3) {
            if (S.service === "Solar for home" && !S.pkg) { err("#wizErr2", "Pick a package (or “Not sure”) to continue."); return; }
            if (S.service === "Solar for business / farm" && !S.biz) { err("#wizErr2", "Pick a size (or “Not sure”) to continue."); return; }
            if (S.service === "Borehole drilling / survey" && !S.water.length) { err("#wizErr2", "Tick at least one item to continue."); return; }
            if (S.service === "Repair / maintenance" && !S.repair) { err("#wizErr2", "Pick what's faulty to continue."); return; }
        }
        if (next === 4) {
            S.location = $("#wizLocation").val().trim();
            S.timing = $("#wizTiming").val();
            if (!S.location) { err("#wizErr3", "Add your suburb / town so we can plan the survey."); return; }
        }
        go(next);
    });

    $(".wiz-back").on("click", function () {
        go(parseInt($(this).data("back"), 10));
    });

    // ---- Step 4: review ----
    function detailLine() {
        if (S.service === "Solar for home") {
            var pkg = S.pkg === "essential" ? "Essential 3kVA" : S.pkg === "family" ? "Family 5kVA" : "Advise me on size";
            return (S.needs.length ? S.needs.join(", ") : "Standard loads") + " · " + pkg;
        }
        if (S.service === "Solar for business / farm") {
            return S.biz === "unsure" ? "Size to be advised" : S.biz + " system";
        }
        if (S.service === "Borehole drilling / survey") return S.water.join(" + ");
        if (S.service === "Repair / maintenance") return S.repair;
        return "";
    }

    function backendService() {
        if (S.service === "Borehole drilling / survey") {
            var hasDrill = S.water.some(function (w) { return w === "Drilling" || w === "Survey / siting"; });
            return hasDrill ? "Borehole drilling / survey" : "Pump / tank / water system";
        }
        return S.service;
    }

    function renderReview() {
        var rows = [
            ["Service", esc(backendService())],
            ["Scope", esc(detailLine())],
            ["Estimate", esc(estimatePlain || "Fixed quote after survey")],
            ["Location", esc(S.location)],
            ["Timing", esc(S.timing)]
        ];
        $("#wizReview").html(rows.map(function (r) {
            return "<div class='rr'><span class='rk'>" + r[0] + "</span><span class='rv'>" + r[1] + "</span></div>";
        }).join(""));
        err("#wizErr4");
    }

    // ---- Submit ----
    $("#wizSubmit").on("click", function () {
        var name = $("#wizName").val().trim();
        var phone = $("#wizPhone").val().trim();
        var email = $("#wizEmail").val().trim();
        var company = $("#wiz_company").val();

        if (!name || !phone) { err("#wizErr4", "Add your name and phone/WhatsApp number."); return; }
        var digits = phone.replace(/\D/g, "");
        if (digits.length < 7 || digits.length > 15) { err("#wizErr4", "That phone number looks off — please check it."); return; }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err("#wizErr4", "That email looks off (or leave it blank)."); return; }

        var service = backendService();
        var message = "Service: " + service + "\nScope: " + detailLine() +
            "\nLocation: " + S.location + "\nTiming: " + S.timing +
            "\nEstimate shown: " + (estimatePlain || "Fixed quote after survey");

        var $btn = $(this);
        var original = $btn.html();
        $btn.prop("disabled", true).html("Sending…");

        $.ajax({
            url: "/api/contact",
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({
                name: name, phone: phone, email: email, service: service,
                location: S.location, message: message, estimate: estimatePlain,
                company: company, source: "quote-wizard"
            }),
            success: function (res) {
                if (res && res.success) {
                    $("#quoteWizard").hide();
                    $("#wizDoneTitle").text("Thanks " + name + "!");
                    $("#wizDoneText").text("Your " + service.toLowerCase() + " request for " + S.location + " is in. We reply within 1 business day — usually much faster.");
                    $("#wizDoneWa").attr("href", "https://wa.me/263771557002?text=" + encodeURIComponent(
                        "Hi Supreme Solar, I'm " + name + " (" + S.location + "). I need: " + service + " — " + detailLine() + ". My estimate shows: " + (estimatePlain || "fixed quote after survey") + "."
                    ));
                    $("#wizDone").prop("hidden", false);
                    try { if (window.gtag) gtag("event", "generate_lead", { method: "quote-wizard" }); } catch (_) {}
                } else {
                    err("#wizErr4", (res && res.message) || "Could not send. Please WhatsApp +263 771 557 002.");
                }
            },
            error: function () {
                err("#wizErr4", "Could not send right now. Please WhatsApp us on +263 771 557 002.");
            },
            complete: function () {
                $btn.prop("disabled", false).html(original);
            }
        });
    });

    // ---- CTA buttons across the page jump into the wizard ----
    function selectService(value) {
        var $opt = $('#wizServiceOpts .wiz-opt[data-value="' + value + '"]');
        if (!$opt.length) return false;
        $("#wizServiceOpts .wiz-opt").removeClass("active");
        $opt.addClass("active");
        S.service = value;
        err("#wizErr1");
        return true;
    }

    $(document).on("click", "[data-service]", function () {
        var svc = $(this).data("service");
        var pkg = $(this).data("pkg");
        if (!selectService(svc)) return;
        if (pkg) {
            $(".wiz-pkg").removeClass("active");
            $('.wiz-pkg[data-value="' + pkg + '"]').addClass("active");
            S.pkg = pkg;
        }
        $("#wizDone").prop("hidden", true);
        $("#quoteWizard").show();
        go(2);
    });
});
