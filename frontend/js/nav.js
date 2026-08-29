const userToggle = document.querySelector(".user-menu-toggle");
const userPanel = document.querySelector('.user-menu-panel');

userToggle.addEventListener('click', function () {
    userPanel.classList.toggle('is-open');
});

document.addEventListener('click', function(event) {
    if (!event.target.closest('.user-menu')) {
        userPanel.classList.remove('is-open');
    }
});
