
function uploadFile() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file to upload.');
        return;
    }
    const formData = new FormData();
    formData.append('file', file);
    const xhr = new XMLHttpRequest();
    const apiUrl = 'http://localhost:3000/upload';
    xhr.open('POST', apiUrl, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log('File upload successful:', xhr.responseText);
        } else {
            console.error('File upload failed. Status code:', xhr.status);
        }
    };
    xhr.send(formData);
}

const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', uploadFile);
