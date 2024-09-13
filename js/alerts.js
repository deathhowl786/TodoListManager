function showAlert(message, type) {
    const alertHTML = `
        <div class="alert ${type} show">
            ${message}
            <span class="close-btn">&times;</span>
        </div>`;
    
    $('#alert-container').append(alertHTML);

    // Automatically hide after 3 seconds
    setTimeout(() => {
        $('.alert').first().fadeOut(500, function() {
            $(this).remove();
        });
    }, 3000);
}

$(document).on('click', '.alert .close-btn', function () {
    $(this).parent().fadeOut(500, function() {
        $(this).remove();
    });
});