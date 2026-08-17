function doGet() {
  return ContentService.createTextOutput("ok");
}

function doPost(e) {
  const email = String((e.parameter && e.parameter.email) || "").trim();
  const anliegen = String((e.parameter && e.parameter.anliegen) || "").trim();
  const consent = String((e.parameter && e.parameter.consent) || "").trim();
  const honey = String((e.parameter && e.parameter._honey) || "").trim();

  if (honey) {
    return ContentService.createTextOutput("ok");
  }

  if (consent !== "on" || !email || !anliegen) {
    return ContentService.createTextOutput("missing");
  }

  MailApp.sendEmail({
    to: "info@icke.dev",
    replyTo: email,
    subject: "icke.dev — Anfrage",
    body: "Absender: " + email + "\n\nAnliegen:\n" + anliegen + "\n",
  });

  return ContentService.createTextOutput("ok");
}
