const darkScreen = document.querySelector('.screen-darken');
const mainDiv = document.getElementById('main_top_nav');
const navbar = document.getElementsByClassName('navbar');
const headerSearch = document.getElementById('header-search');
const passTitle = document.getElementById('passTitle');
const mainBanner = document.getElementById('mainBanner');
const footerItemCategory = document.getElementById('footerItemCategory');
const addSubCategoryOnIndexPopularServicesSlider = document.getElementById(
  'addSubCategoryOnIndexPopularServicesSlider'
);
const setCategoryGrid = document.getElementById('setCategoryGrid');

window.onload = () => {
  if (passTitle.dataset.passtitle !== 'freele') {
    navbar[0].classList.add('active');
    headerSearch.classList.remove('d-none');
  }
  if (passTitle.dataset.passtitle === 'freele' && window.pageYOffset > 0) {
    navbar[0].classList.add('active');
    headerSearch.classList.remove('d-none');
  }
};

window.onscroll = () => {
  if (window.pageYOffset > 0 || passTitle.dataset.passtitle !== 'freele') {
    navbar[0].classList.add('active');
    headerSearch.classList.remove('d-none');
  } else {
    navbar[0].classList.remove('active');
    headerSearch.classList.add('d-none');
  }
};

function darken_screen(isDarkScreenActivated) {
  if (isDarkScreenActivated) darkScreen.classList.add('active');
  else darkScreen.classList.remove('active');
}

function show_offcanvas(offcanvas_id) {
  darken_screen(true);
  document.getElementById(offcanvas_id).classList.add('show');
  document.body.classList.add('offcanvas-active');
}

function close_offcanvas() {
  darken_screen(false);
  document.querySelector('.mobile-offcanvas.show').classList.remove('show');
  document.body.classList.remove('offcanvas-active');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-trigger]').forEach((element) => {
    let offcanvas_id = element.getAttribute('data-trigger');
    element.addEventListener('click', (e) => {
      e.preventDefault();
      show_offcanvas(offcanvas_id);
    });
  });

  document.querySelectorAll('.btn-close').forEach((closeButton) => {
    closeButton.addEventListener('click', () => {
      close_offcanvas();
    });
  });

  darkScreen.addEventListener('click', () => {
    close_offcanvas();
  });
});

// Banner BackGrond Image
let bannerImgIdx = 0;
function changeBannerImg() {
  const bannerBgImages = [
    'url("../public/image/2.jpg")',
    'url("../public/image/3.jpg")',
    'url("../public/image/4.jpg")',
    'url("../public/image/5.jpg")',
    'url("../public/image/1.jpg")',
  ];
  let bg = bannerBgImages[bannerImgIdx];
  mainBanner.style.backgroundImage = bg;
  bannerImgIdx++;
  if (bannerImgIdx === bannerBgImages.length) bannerImgIdx = 0;
}
if (passTitle.dataset.passtitle === 'freele')
  setInterval(changeBannerImg, 10000);

// Upload Image
function getImage(event, id) {
  document.getElementById(id).src = URL.createObjectURL(event.target.files[0]);
}

// SERVICE WORD COUNTER
function textAreaWordCounter(id, counterId) {
  document.getElementById(counterId).innerHTML = id.value.length;
}

// SELECT CATEGORY AND SUBCATEGORY
const category = document.getElementById('category') || '';
const subCategory = document.getElementById('subCategory');
const categoryObj = {
  'Graphics Design': [
    'Logo Design',
    'Flyer Design',
    'Card Design',
    'Banner Design',
    'Resume Design',
  ],
  'Web Design': [
    'Responsibe website',
    'Landing Page',
    'PSD to HTML',
    'Portfolio',
    'UI/UX',
  ],
  'Web Development': [
    'Web App',
    'MERN Stack',
    'MEAN Stack',
    'Dot Net App',
    'PHP App',
  ],
  'Digital Marketing': [
    'Social Media Marketing',
    'Local SEO',
    'Video Marketing',
    'Music Promotion',
    'Web traffic',
  ],
  'Programming and Tech': [
    'Wordpress',
    'Game Development',
    'Web Programming',
    'Chatbots',
    'User Testing',
  ],
};

for (const key in categoryObj) {
  let html = `<option>${key}</option>`;
  category.innerHTML += html;

  let categoryListHtml = `<li><a href="search?searchItem=${key}">${key}</a></li>`;
  footerItemCategory.innerHTML += categoryListHtml;
}

function categoryOption(id) {
  subCategory.innerHTML = '<option selected>Select a sub category</option>';
  categoryObj[category.value].forEach((ele) => {
    let html = `<option>${ele}</option>`;
    subCategory.innerHTML += html;
  });
}

// ADD TAGS
const serviceTags = document.getElementById('serviceTags');
new Tagify(serviceTags);

// MEGA MENU SET CATEGORY
const setCategoryItem = document.getElementById('setCategoryItem');
function setCategory() {
  setCategoryItem.innerHTML = '';
  for (const key in categoryObj) {
    let listHtml = '';
    for (let sub = 0; sub < categoryObj[key].length; sub++) {
      listHtml += `<li><a class="megamenuTextControl" href="/search?searchItem=${categoryObj[key][sub]}">${categoryObj[key][sub]}</a></li>`;
    }
    let html =
      `
    <div class="col-lg col-12">
      <div class="col-megamenu">
        <a class="megamenuTextControl" href="/search?searchItem=${key}"><h6 class="title"><b>${key}</b></h6></a>
          <ul class="list-unstyled">` +
      listHtml +
      `</ul>
      </div>
    </div>`;
    setCategoryItem.innerHTML += html;
  }
}

const categoryImages = [
  'category-1.png',
  'category-2.png',
  'category-3.png',
  'category-4.png',
  'category-5.png',
];

const subCategoryImages = [
  'sub-1.jpg',
  'sub-2.jpg',
  'sub-3.jpg',
  'sub-4.jpg',
  'sub-5.jpg',
  'sub-6.jpg',
  'sub-7.jpg',
  'sub-8.jpg',
  'sub-9.jpg',
  'sub-10.jpg',
  'sub-11.jpg',
  'sub-12.jpg',
  'sub-13.jpg',
  'sub-14.jpg',
  'sub-15.jpg',
  'sub-16.jpg',
  'sub-17.jpg',
  'sub-18.jpg',
  'sub-19.jpg',
  'sub-20.jpg',
  'sub-21.jpg',
  'sub-22.jpg',
  'sub-23.jpg',
  'sub-24.jpg',
  'sub-25.jpg',
];

function setCategoryForPopularServicesOnLoadHome() {
  setCategoryGrid.innerHTML = '';
  let categoryImageIndex = 0;
  for (const key in categoryObj) {
    setCategoryGrid.innerHTML += `<div class="col m-auto text-center mb-5"><a class="text-decoration-none" href="/search?searchItem=${key}"><p><img src="../public/image/${categoryImages[categoryImageIndex]}"></p><strong>${key}</strong></a></div>`;
    categoryImageIndex++;
  }
}

function setSubcategoryForPopularServicesOnLoadHome() {
  addSubCategoryOnIndexPopularServicesSlider.innerHTML = '';
  let subCategoryImageIndex = 0;
  for (const key in categoryObj) {
    for (let sub = 0; sub < categoryObj[key].length; sub++) {
      addSubCategoryOnIndexPopularServicesSlider.innerHTML += `<a class="fs-4 fw-bold text-decoration-none text-white" href="/search?searchItem=${categoryObj[key][sub]}"><div class="text-center mt-1" style="height: 250px; width: 230px; margin: 10px; background-image: url('../public/image/${subCategoryImages[subCategoryImageIndex]}'); background-position: center; background-size: cover; background-repeat: no-repeat;"><strong>${categoryObj[key][sub]}</strong></div></a>`;

      subCategoryImageIndex++;
    }
  }
}

if (passTitle.dataset.passtitle === 'freele') {
  setCategoryForPopularServicesOnLoadHome();
  setSubcategoryForPopularServicesOnLoadHome();
}

$(function () {
  $('#jobPostTable').DataTable();
  $('#earningServiceTable').DataTable();
  $('#earningJobPostTable').DataTable();
});

$(document).ready(function () {
  $('.owl-carousel').owlCarousel({
    loop: true,
    margin: 50,
    autoplay: true,
    responsive: {
      0: {
        items: 1,
      },
      500: {
        items: 2,
      },
      700: {
        items: 3,
      },
      900: {
        items: 4,
      },
      1100: {
        items: 5,
      },
    },
  });
});

// feedback rating star input
const feedback_star_rating = [
  ...document.getElementsByClassName('feedback_star_rating'),
];
const feedBackRatting = document.getElementById('feedBackRatting');

printRatingResult(feedBackRatting);

function executeRating(feedback_star_rating, feedBackRatting) {
  const starClassActive = 'feedback_star_rating fas fa-star fa-2x';
  const starClassUnactive = 'feedback_star_rating far fa-star fa-2x';
  const starsLength = feedback_star_rating.length;
  console.log(starsLength);
  let star_rating_index;
  feedback_star_rating.forEach((star) => {
    star.onmouseover = () => {
      star_rating_index = feedback_star_rating.indexOf(star);

      if (star.className.indexOf(starClassUnactive) !== -1) {
        printRatingResult(feedBackRatting, star_rating_index + 1);
        for (star_rating_index; star_rating_index >= 0; --star_rating_index) feedback_star_rating[star_rating_index].className = starClassActive;
      } else {
        printRatingResult(feedBackRatting, star_rating_index);
        for (star_rating_index; star_rating_index < starsLength; ++star_rating_index) feedback_star_rating[star_rating_index].className = starClassUnactive;
      }
    };
  });
}

function printRatingResult(result, num = 0) {
  feedBackRatting.value = parseInt(num);
  console.log(feedBackRatting);
}

executeRating(feedback_star_rating, feedBackRatting);
