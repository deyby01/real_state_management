const userToggle = document.querySelector(".user-menu-toggle");
const userPanel = document.querySelector('.user-menu-panel');
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");

userToggle.addEventListener('click', function () {
    userPanel.classList.toggle('is-open');
});

document.addEventListener('click', function(event) {
    if (!event.target.closest('.user-menu')) {
        userPanel.classList.remove('is-open');
    }
});

navToggle.addEventListener('click', function() {
    navMenu.classList.toggle('is-open');

    const icon = navToggle.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-xmark');
});
