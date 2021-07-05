const socket = io();

const messageLeftSide = document.getElementById('messageLeftSide');
const messageLeftSideDiv = document.getElementById('messageLeftSideDiv');
const messageRightSide = document.getElementById('messageRightSide');
const messageRightSideDiv = document.getElementById('messageRightSideDiv');
const messageUserListGroup = document.getElementById('messageUserListGroup');
const messageSendBtn = document.getElementById('messageSendBtn');
const messageBody = document.getElementById('messageBody');
const senderUserName = document.getElementById('senderUserName');
const senderProfileImage = document.getElementById('senderProfileImage');
const receiverUserName = document.getElementById('receiverUserName');
const receiverProfileImage = document.getElementById('receiverProfileImage');
const allMessageDiv = document.getElementById('allMessageDiv');

allMessageDiv.scrollTop = allMessageDiv.scrollHeight;

let sender, receiver;
let senderProfilePic, receiverProfilePic;

messageLeftSide.addEventListener('click', () => {
  messageRightSideDiv.classList.remove('d-none');
  messageLeftSideDiv.classList.add('d-none');
});
messageRightSide.addEventListener('click', () => {
  messageRightSideDiv.classList.add('d-none');
  messageLeftSideDiv.classList.remove('d-none');
});

const leftUserList = document.querySelectorAll('#messageUserListGroup');
leftUserList[0].addEventListener('click', () => {
  messageRightSideDiv.classList.remove('d-none');
  messageLeftSideDiv.classList.add('d-none');
});

receiver = receiverUserName.dataset.receiverusername;
sender = senderUserName.dataset.senderusername;

senderProfilePic = senderProfileImage.dataset.senderprofileimage;
receiverProfilePic = receiverProfileImage.dataset.receiverprofileimage;

socket.emit('user-connected', sender);

// socket.on("find-receiver", (uniqueReceiver) => {
//   messageUserListGroup.innerHTML = '';
//   uniqueReceiver.forEach((ele) => {
//     addAllUserOnLeftSide(ele);
//   });
// });

socket.on('send-specific-user', (data) => {
  console.log(data);
  // appendMessageSender(data.messageBody);
  appendMessageReceiver(data.messageBody);
});

socket.on('receiver-user-selected', (data) => {
  allMessageDiv.innerHTML = '';
  data.forEach((ele) => {
    console.log('ele', ele);
    if (ele.sender === sender) appendMessageSender(ele.messageBody);
    else appendMessageReceiver(ele.messageBody);
  });
});

sendMessageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let message = messageBody.value;
  messageBody.value = '';

  appendMessageSender(message);

  socket.emit('send-message', {
    sender: sender,
    receiver: receiver,
    messageBody: message,
  });
});

// function addAllUserOnLeftSide(receiver) {
//   let html = `<a href="/messages/${sender}/${receiver}"><li class="list-group-item" onclick="getReceiver(this)"><img
//                 src="${receiverProfilePic}"
//                 class="rounded-circle"
//                 height="30"
//                 width="30"
//               /><span class="ms-3">${receiver}</span></li></a>`;

//   // for (let li = uniqueReceiver.length - 1; li > 0; li--) {
//   //   let html = `<a href="/messages/${sender}/${uniqueReceiver[li]}"><li class="list-group-item" onclick="getReceiver(this)">`;
//   //   if (allReceiverDetails[li].profileImage) {
//   //     html += `<img src="/public/uploads/${allReceiverDetails[li].profileImage}"
//   //                 class="rounded-circle"
//   //                 height="30"
//   //                 width="30"/>`;
//   //   } else {
//   //     html += `<img src="/public/image/default-profile-photo.png"
//   //                 class="rounded-circle"
//   //                 height="30"
//   //                 width="30" />`;
//   //   }
//   //   html += `<span class="ms-3">${uniqueReceiver[li]}</span></li ></a >`;
//   // }

//   messageUserListGroup.innerHTML += html;
// }

function getReceiver(receiverUserName) {
  receiverUserName = receiverUserName.childNodes[1].innerHTML;

  socket.emit('user-selected', { receiver: receiverUserName, sender: sender });
}

function appendMessageReceiver(msg) {
  let html = `<div class="d-flex my-2 chatBoxControl"><div class="flex-shrink-0"><img
                  src="${receiverProfilePic}"
                  class="rounded-circle"
                  height="40"
                  width="40"/></div><div class="flex-grow-1 ms-3 messageTextContent"><span
                  >${msg}</span
                ></div></div>`;

  allMessageDiv.innerHTML += html;
}

function appendMessageSender(msg) {
  let html = `<div class="d-flex my-2 ms-auto align-items-end chatBoxControl"><div class="flex-grow-1 me-3 text-end messageTextContent"><span
                  >${msg}</span></div><div class="flex-shrink-0"><img
                  src="${senderProfilePic}"
                  class="rounded-circle media-end"
                  height="40"
                  width="40"/></div></div>`;

  allMessageDiv.innerHTML += html;
}
