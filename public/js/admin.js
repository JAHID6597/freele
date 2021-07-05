const adminDashboardMobileHeaderButton = document.getElementById(
  'adminDashboardMobileHeaderButton'
);
const adminDashBoardSidebar = document.getElementById('adminDashBoardSidebar');
const adminDashboardMobileHeaderBarI = document.getElementById(
  'adminDashboardMobileHeaderBarI'
);

let isAdminDashBoardSidebarActive = false;

adminDashboardMobileHeaderButton.addEventListener('click', () => {
  if (!isAdminDashBoardSidebarActive) openAdminDashBoardSidebar();
  else closeAdminDashBoardSidebar();
});

window.addEventListener('click', (e) => {
  if (e.target !== adminDashboardMobileHeaderBarI) closeAdminDashBoardSidebar();
});

function openAdminDashBoardSidebar() {
  isAdminDashBoardSidebarActive = true;
  adminDashBoardSidebar.classList.remove('d-none');
  adminDashBoardSidebar.classList.add('adminSidebarControl');
}
function closeAdminDashBoardSidebar() {
  isAdminDashBoardSidebarActive = false;
  adminDashBoardSidebar.classList.add('d-none');
  adminDashBoardSidebar.classList.remove('adminSidebarControl');
}

const counters = document.querySelectorAll('.count');
const speed = 200;
counters.forEach((counter) => {
  let count = 0;
  const updateCount = () => {
    const target = parseInt(counter.getAttribute('data-target'));
    count++;

    if (count < target) {
      counter.innerText = count;
      setTimeout(updateCount, 500);
    } else {
      counter.innerText = target;
    }
  };
  updateCount();
});

$(function () {
  $('#jobPostTable').DataTable();
  $('#sidebarUsersTable').DataTable();
  $('#sidebarServiceOrdersTable').DataTable();
  $('#sidebarJobPostOrdersTable').DataTable();
});


const passUserEarningsService = document.getElementById('passUserEarningsService');
const passUserEarningsJobPost = document.getElementById('passUserEarningsJobPost');

const usersEarningsPieChart = document
  .getElementById('usersEarningsPieChart')
  .getContext('2d');
const myPieChart = new Chart(usersEarningsPieChart, {
  type: 'pie',
  data: {
    labels: ['Services', 'JobPosts'],
    datasets: [
      {
        backgroundColor: ['rgb(233, 50, 50)', 'rgb(28, 179, 28)'],
        data: [
          passUserEarningsService.dataset.totalearningservice,
          passUserEarningsJobPost.dataset.totalearningjobpost,
        ],
      },
    ],
  },
});
