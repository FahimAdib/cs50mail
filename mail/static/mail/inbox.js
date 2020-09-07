window.addEventListener('load', function () {


  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#form-submit').addEventListener('click', send_email);
  document.querySelector('#archive-button').addEventListener('click', archiveF);
  document.querySelector('#unarchive-button').addEventListener('click', unArchiveF);
  document.querySelector('#reply-button').addEventListener('click', replyF);


  // By default, load the inbox
  load_mailbox('inbox');
});

let currentItem;
let currentMailbox;
let currentEmail;

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#email-info').style.display = 'none';
  document.querySelector('#email-body').style.display = 'none';
  document.querySelector('#separator').style.display = 'none';

  document.querySelector('#Buttons').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  currentMailbox = mailbox;

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'block';
  document.querySelector('#email-info').style.display = 'none';
  document.querySelector('#email-body').style.display = 'none';
  document.querySelector('#separator').style.display = 'none';

  document.querySelector('#Buttons').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;



  document.getElementById("email").innerHTML = "";
  fetch('/emails/' + mailbox)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      console.log(emails);
      //console.log(emails.length);
      //let tableRef = document.getElementById('email');
      for (i = 0; i < emails.length; i++) {
        var emailDiv = document.createElement("DIV");


        var emailSender = document.createElement("DIV");
        var emailSubject = document.createElement("DIV");
        var emailTime = document.createElement("DIV");
        emailTime.setAttribute('class', 'timeDiv');
        emailSender.setAttribute('class', 'senderDiv');
        emailSubject.setAttribute('class', 'subjectDiv');
        emailDiv.setAttribute("id", "email-" + emails[i].id)
        var className = "emailDivs";
        if (emails[i].read == true) {
          className += " readMail";
        }
        emailDiv.setAttribute("class", className);
        let emailDataSender = document.createTextNode(emails[i].sender);
        let emailDataSubject = document.createTextNode(emails[i].subject);
        let emailDataTime = document.createTextNode(emails[i].timestamp);
        emailSender.appendChild(emailDataSender);
        emailSubject.appendChild(emailDataSubject);
        emailTime.appendChild(emailDataTime);

        emailDiv.appendChild(emailSender);
        emailDiv.appendChild(emailSubject);
        emailDiv.appendChild(emailTime);
        // emailDiv.addEventListener('click', () => read_email(item.id));


        document.getElementById("email").appendChild(emailDiv);

      }
      document.querySelectorAll('.emailDivs').forEach(item => {
        item.addEventListener('click', () => read_email(item.id));
      });
    });

}

function archiveF(e) {
  console.log("archived")
  e.stopPropagation()
  fetch('/emails/' + currentItem.slice(6), {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
    .then(() => load_mailbox('inbox'));
}

function unArchiveF(e) {
  console.log("unarchived")
  e.stopPropagation()
  fetch('/emails/' + currentItem.slice(6), {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
    .then(() => load_mailbox('inbox'));
}

function read_email(id) {
  currentItem = id;
  if (currentMailbox == "sent") {

    document.querySelector('#archive-button').style.display = 'none';
    document.querySelector('#unarchive-button').style.display = 'none';
  }
  else {
    document.querySelector('#archive-button').style.display = 'block';
    document.querySelector('#unarchive-button').style.display = 'block';
  }

  document.getElementById("email-info").innerHTML = "";
  document.getElementById("email-body").innerHTML = "";
  document.querySelector('#email-body').style.display = 'block';
  document.querySelector('#separator').style.display = 'block';
  document.querySelector('#Buttons').style.display = 'block';


  document.querySelector('#' + id).style.backgroundColor = "grey";
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#email-info').style.display = 'block';
  console.log(id.slice(6));



  fetch('/emails/' + id.slice(6), {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })



  fetch('/emails/' + id.slice(6))
    .then(response => response.json())
    .then(email => {
      currentEmail = email;
      if (email.archived == true) {
        document.querySelector('#archive-button').style.display = 'none';
      }
      else {
        document.querySelector('#unarchive-button').style.display = 'none';
      }
      // Print email
      console.log(email);
      var emailInfo = document.createElement("DIV");
      var emailRecipients = document.createElement("DIV");
      var emailSender = document.createElement("DIV");
      var emailSubject = document.createElement("DIV");
      var emailTime = document.createElement("DIV");
      emailInfo.setAttribute("id", "emailInfo-" + email.id)
      emailInfo.setAttribute("class", "emailInfo")
      emailSender.innerHTML = "From: ".bold() + email.sender;
      emailRecipients.innerHTML = "To: ".bold() + email.recipients;
      emailSubject.innerHTML = "Subject: ".bold() + email.subject;
      emailTime.innerHTML = "Timestamp: ".bold() + email.timestamp;
      emailInfo.appendChild(emailSender);
      emailInfo.appendChild(emailRecipients);
      emailInfo.appendChild(emailSubject);
      emailInfo.appendChild(emailTime);

      document.getElementById("email-info").appendChild(emailInfo)

      var emailBody = document.createElement("DIV");
      emailInfo.setAttribute("id", "emailBody-" + email.id);
      emailInfo.setAttribute("class", "emailBody");
      let emailDataBody = document.createTextNode(email.body);
      emailBody.appendChild(emailDataBody);

      var emailSeparator = document.createElement("HR");
      emailBody.appendChild(emailSeparator);

      document.getElementById("email-body").appendChild(emailBody);

      // ... do something else with email ...


    });
}



function replyF() {
  compose_email();
  document.querySelector('#compose-recipients').value = currentEmail.sender;
  if (currentEmail.subject.slice(0, 4) == "RE: ") {

    document.querySelector('#compose-subject').value = currentEmail.subject;
  }
  else {

    document.querySelector('#compose-subject').value = "RE: " + currentEmail.subject;
  }
  document.querySelector('#compose-body').value = "On " + currentEmail.timestamp + " " + currentEmail.sender + " wrote: \n" + '"' + currentEmail.body + '"';
}


function send_email(e) {
  e.preventDefault();
  recipients_value = document.querySelector('#compose-recipients').value;
  subject_value = document.querySelector('#compose-subject').value;
  body_value = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients_value,
      subject: subject_value,
      body: body_value
    })
  })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
    })
    .then(() => load_mailbox('sent'));

}

