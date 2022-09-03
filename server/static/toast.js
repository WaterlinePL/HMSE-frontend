function showSuccessToast($, message) {
    const toast = document.getElementById("infoToast");
    toast.classList.toggle("bg-success", true);
    toast.classList.toggle("bg-danger", false);
    pShowToast($, message);
}


function showErrorToast($, message) {
    const toast = document.getElementById("infoToast");
    toast.classList.toggle("bg-success", false);
    toast.classList.toggle("bg-danger", true);
    pShowToast($, message);
}


function pShowToast($, message) {
    'use strict';
    const toastBody = document.getElementById("toastBody");
    toastBody.textContent = message;
    $("#infoToast").toast('show');
}