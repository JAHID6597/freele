const passEndDate = document.getElementById("pass-end-date");

const day = document.getElementById("day");
const hour = document.getElementById("hour");
const min = document.getElementById("minute");
const second = document.getElementById("second");

function formatTime(time) {
  return time < 10 ? `0${time}` : time;
}

function countdown() {
  const comingSoonDate = new Date(passEndDate.dataset.passenddate);
  const currentDate = new Date();
  const totalSeconds = (comingSoonDate - currentDate) / 1000;
  const days = Math.floor(totalSeconds / 3600 / 24);
  const hours = Math.floor(totalSeconds / 3600) % 24;
  const mins = Math.floor(totalSeconds / 60) % 60;
  const seconds = Math.floor(totalSeconds) % 60;
  day.innerHTML = formatTime(days);
  hour.innerHTML = formatTime(hours);
  min.innerHTML = formatTime(mins);
  second.innerHTML = formatTime(seconds);
}


if (
  passTitle.dataset.passtitle === "order" ||
  passTitle.dataset.passtitle === "jobPostOrder" ||
  passTitle.dataset.passtitle === "jobPostOrderDelivery" ||
  passTitle.dataset.passtitle === "orderDelivery"
)
  setInterval(countdown, 1000);
