const upload = new FileUploadWithPreview("myUniqueUploadId");


function passJobPostId_SendRequest(username, jobPostId) {
    const jobPostRequestForm = document.getElementById('jobPostRequestForm');
    jobPostRequestForm.action = `/user/${username}/${jobPostId}/post_request/sent?_method=PUT`;
}