// Programmer Management - AJAX Implementation
$(document).ready(function () {
    loadProgrammers();
    initializeForm();
});

// Load all programmers from server
function loadProgrammers() {
    showLoading(true);

    $.ajax({
        url: '/Programmers?handler=Programmers',
        type: 'GET',
        success: function (data) {
            displayProgrammers(data);
            showLoading(false);
        },
        error: function (xhr, status, error) {
            showAlert('Error loading programmers: ' + error, 'danger');
            showLoading(false);
        }
    });
}

// Display programmers in table
function displayProgrammers(programmers) {
    const tbody = $('#programmersTableBody');
    tbody.empty();

    if (programmers.length === 0) {
        tbody.append(`
            <tr>
                <td colspan="8" class="text-center text-muted py-4">
                    No programmers found
                </td>
            </tr>
        `);
        return;
    }

    programmers.forEach(programmer => {
        const row = `
            <tr>
                <td>${programmer.id}</td>
                <td>${programmer.name}</td>
                <td>${formatDate(programmer.dob)}</td>
                <td>${formatDate(programmer.doj)}</td>
                <td>${programmer.sex}</td>
                <td>${programmer.proF1 || '-'}</td>
                <td>${programmer.proF2 || '-'}</td>
                <td>${programmer.salary}</td>
            </tr>
        `;
        tbody.append(row);
    });
}

// Initialize form handling
function initializeForm() {
    $('#addProgrammerForm').on('submit', function (e) {
        e.preventDefault();
        submitProgrammer();
    });
}

// Submit new programmer
function submitProgrammer() {
    const form = $('#addProgrammerForm')[0];
    const formData = new FormData(form);

    // Clear previous validation
    $('.form-control').removeClass('is-invalid');
    $('.invalid-feedback').text('');

    // Show loading state
    setSubmitButtonLoading(true);

    $.ajax({
        url: '/Programmers?handler=AddProgrammer',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        headers: {
            'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
        },
        success: function (response) {
            if (response.success) {
                // Success - close modal and refresh table
                $('#addProgrammerModal').modal('hide');
                form.reset();
                loadProgrammers();
                showAlert('Programmer added successfully!', 'success');
            } else {
                // Handle validation errors
                handleValidationErrors(response.errors);
            }
            setSubmitButtonLoading(false);
        },
        error: function (xhr, status, error) {
            console.log('Error details:', xhr.responseText);
            showAlert('Error adding programmer: ' + error, 'danger');
            setSubmitButtonLoading(false);
        }
    });
}

// Handle validation errors
function handleValidationErrors(errors) {
    if (errors) {
        errors.forEach(error => {
            const fieldName = error.field.replace('NewProgrammer.', '').toLowerCase();
            const field = $(`[name="NewProgrammer.${error.field.split('.')[1]}"]`);

            if (field.length > 0) {
                field.addClass('is-invalid');
                field.siblings('.invalid-feedback').text(error.errors[0]);
            }
        });
    }
}

// Utility functions
function showLoading(show) {
    if (show) {
        $('#loadingState').show();
        $('#programmersTable').hide();
    } else {
        $('#loadingState').hide();
        $('#programmersTable').show();
    }
}

function setSubmitButtonLoading(loading) {
    const btn = $('#submitBtn');
    const spinner = btn.find('.spinner-border');

    if (loading) {
        btn.prop('disabled', true);
        spinner.show();
        btn.text(' Adding...');
    } else {
        btn.prop('disabled', false);
        spinner.hide();
        btn.text('Add Programmer');
    }
}

function showAlert(message, type) {
    const alert = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;

    $('#alertContainer').html(alert);

    // Auto-hide success alerts
    if (type === 'success') {
        setTimeout(() => {
            $('.alert').alert('close');
        }, 3000);
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function formatNumber(number) {
    return new Intl.NumberFormat().format(number);
}
