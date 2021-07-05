function checkOfferControl(username, jobPostId) {
  let headers = new Headers();
  headers.append('Accept', 'Application/JSON');

  let req = new Request(`/alljobpost/${username}/checkoffer/${jobPostId}`, {
    method: 'GET',
    headers,
    mode: 'cors',
  });

  let html = ``;

  fetch(req)
    .then((res) => res.json())
    .then((data) => {
      let checkOfferRequestModalTable = document
        .getElementById('checkOfferRequestModalTable')
        .getElementsByTagName('tbody')[0];

      checkOfferRequestModalTable.innerHTML = '';

      data.jobPost.sentRequest.forEach((sRequest) => {
        let row = checkOfferRequestModalTable.insertRow();
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);
        let cell5 = row.insertCell(4);

        if (sRequest.requestSender.profileImage) {
          cell1.innerHTML = `<img class="rounded-circle" height="40" width="40" src="/public/uploads/${sRequest.requestSender.profileImage}">`;
        } else {
          cell1.innerHTML = `<img class="rounded-circle" height="40" width="40" src="/public/image/default-profile-photo.png">`;
        }

        cell2.innerHTML = sRequest.offerDescription;
        cell3.innerHTML = sRequest.offerDeliveryDay;
        cell4.innerHTML = sRequest.offerPrice;
        cell5.innerHTML = `<form action="/user/${username}/jobpost/${data.jobPost._id}/${sRequest._id}/checkout" method="GET">
            <button class="btn btn-clr btn-sm">Checkout</button>
          </form>`;
      });
    })
    .catch((err) => alert(err.message));

  console.log(checkOfferRequestModalTable);
}

// <% sJobPost.sentRequest.forEach(sRequest=> { %>
//                       <tr>
//                         <th scope="row">
//                           <% if(sRequest.requestSender.profileImage) {%><img class="rounded-circle" height="40" width="40"
//                             src="/public/uploads/<%=sRequest.requestSender.profileImage%>" />
//                           <%} else {%><img class="rounded-circle" height="40" width="40"
//                             src="/public/image/default-profile-photo.png" />
//                           <%}%>
//                       </th>
//                       <td><p style="min-width: 400px"><%= sRequest.offerDescription %></p>
//                       </td>
//                       <td><%= sRequest.offerDeliveryDay %></td>
//                       <td><%= sRequest.offerPrice %></td>
//                       <td>
//                         <form action="/user/<%= sUser.username %>/jobpost/<%= sJobPost.id %>/<%= sRequest.id%>/checkout" method="GET">
//                           <button class="btn btn-clr btn-sm">Checkout</button>
//                         </form>
//                       </td>
//                     </tr>
//                     <% }) %>
