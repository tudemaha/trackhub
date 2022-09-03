const adminCheckbox = document.getElementById('checkbox');
const adminPassword = document.querySelector('.passwordField')
const requiredPassword = document.getElementById('admin_pass');

adminCheckbox.addEventListener('click', () => {
    if(adminCheckbox.checked) {
        adminPassword.style.display = 'block';
        requiredPassword.setAttribute('required', '');
    } else {
        adminPassword.style.display = 'none';
        requiredPassword.removeAttribute('required');
    }
});