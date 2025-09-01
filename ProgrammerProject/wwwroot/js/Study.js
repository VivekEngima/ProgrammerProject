// Studies Management - AJAX Implementation with CRUD
let currentDeleteName = null;

document.addEventListener('DOMContentLoaded', function () {
    loadStudies();
    initializeForms();
});

// Initialize all form handlers
function initializeForms() {
    // Add form
    document.getElementById('addStudyForm').addEventListener('submit', function (e) {
        e.preventDefault();
        submitStudy();
    });

    // Edit form
    document.getElementById('editStudyForm').addEventListener('submit', function (e) {
        e.preventDefault();
        updateStudy();
    });

    // Delete confirmation
    document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
        deleteStudy();
    });
}

// Load all studies from server
function loadStudies() {
    showLoading(true);

    $.ajax({
        url: '/Studies?handler=Studies',
        type: 'GET',
        success: function (data) {
            displayStudies(data);
            showLoading(false);
        },
        error: function (xhr, status, error) {
            showAlert('Error loading studies: ' + error, 'danger');
            showLoading(false);
        }
    });
}

// Display studies in table with action buttons
function displayStudies(studies) {
    const tbody = $('#studiesTableBody');
    tbody.empty();

    if (studies.length === 0) {
        tbody.append(`
            <tr><td colspan="5" class="text-center text-muted">No studies found</td></tr>
        `);
        return;
    }

    studies.forEach((study,i) => {
        const row = `
            <tr>
                <td>${i + 1}</td>
                <td>${study.name}</td>
                <td>${study.splace}</td>
                <td>${study.course}</td>
                <td>${study.ccost}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editStudy('${study.name}')">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete('${study.name}')">
                        <i class="bi bi-trash3"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.append(row);
    });
}

// Submit new study
function submitStudy() {
    const name = $('#name').val().trim();
    const splace = $('#splace').val().trim();
    const course = $('#course').val().trim();
    const ccost = $('#ccost').val().trim();

    clearValidation('#addStudyForm');

    // Validate required fields
    if (!name) {
        showFieldError('#name', 'Name is required');
        return;
    }
    if (!splace) {
        showFieldError('#splace', 'Studied Place is required');
        return;
    }
    if (!course) {
        showFieldError('#course', 'Course is required');
        return;
    }
    if (ccost && parseFloat(ccost) < 0) {
        showFieldError('#ccost', 'Course cost must be positive');
        return;
    }

    setSubmitButtonLoading(true);

    $.ajax({
        url: '/Studies?handler=AddStudy',
        type: 'POST',
        data: {
            name,
            splace: splace,
            course: course,
            ccost: ccost
        },
        headers: { 'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val() },
        success: function (response) {
            if (response.success) {
                closeModalProperly('#addStudyModal');
                $('#addStudyForm')[0].reset();
                loadStudies();
                showAlert('Study added successfully!', 'success');
            } else {
                showAlert('Error: ' + response.message, 'danger');
            }
            setSubmitButtonLoading(false);
        },
        error: function (xhr, status, error) {
            showAlert('Error adding study: ' + error, 'danger');
            setSubmitButtonLoading(false);
        }
    });
}

// Edit study - load data and show modal
function editStudy(name) {
    $.ajax({
        url: `/Studies?handler=Study&name=${encodeURIComponent(name)}`,
        type: 'GET',
        success: function (response) {
            if (response.success) {
                populateEditForm(response.data);
                $('#editStudyModal').modal('show');
            } else {
                showAlert('Error loading study data: ' + response.message, 'danger');
            }
        },
        error: function (xhr, status, error) {
            showAlert('Error loading study: ' + error, 'danger');
        }
    });
}

function populateEditForm(study) {
    $('#editName').val(study.name);
    $('#editNameDisplay').val(study.name);
    $('#editSplace').val(study.splace);
    $('#editCourse').val(study.course);
    $('#editCcost').val(study.ccost);
}

// Update study
function updateStudy() {
    const name = $('#editName').val();
    const splace = $('#editSplace').val().trim();
    const course = $('#editCourse').val().trim();
    const ccost = $('#editCcost').val().trim();

    clearValidation('#editStudyForm');

    if (!name) {
        showFieldError('#editName', 'Name is required');
        return;
    }
    if (!splace) {
        showFieldError('#editSplace', 'Studied Place is required');
        return;
    }
    if (!course) {
        showFieldError('#editCourse', 'Course is required');
        return;
    }
    if (ccost && parseFloat(ccost) < 0) {
        showFieldError('#editCcost', 'Course cost must be positive');
        return;
    }

    setUpdateButtonLoading(true);

    $.ajax({
        url: '/Studies?handler=UpdateStudy',
        type: 'POST',
        data: {
            name,
            splace: splace,
            course: course,
            ccost: ccost
        },
        headers: { 'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val() },
        success: function (response) {
            if (response.success) {
                closeModalProperly('#editStudyModal');
                loadStudies();
                showAlert('Study updated successfully!', 'success');
            } else {
                showAlert('Error: ' + response.message, 'danger');
            }
            setUpdateButtonLoading(false);
        },
        error: function (xhr, status, error) {
            showAlert('Error updating study: ' + error, 'danger');
            setUpdateButtonLoading(false);
        }
    });
}

// Show delete confirmation modal
function confirmDelete(name) {
    currentDeleteName = name;
    $('#deleteStudyName').text(name);
    $('#deleteStudyModal').modal('show');
}

// Delete study
function deleteStudy() {
    if (!currentDeleteName) return;

    setDeleteButtonLoading(true);

    $.ajax({
        url: `/Studies?handler=DeleteStudy&name=${encodeURIComponent(currentDeleteName)}`,
        type: 'POST',
        headers: {
            'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
        },
        success: function (response) {
            if (response.success) {
                closeModalProperly('#deleteStudyModal');
                loadStudies();
                showAlert('Study deleted successfully!', 'success');
            } else {
                showAlert('Error deleting study: ' + response.message, 'danger');
            }
            setDeleteButtonLoading(false);
            currentDeleteName = null;
        },
        error: function (xhr, status, error) {
            showAlert('Error deleting study: ' + error, 'danger');
            setDeleteButtonLoading(false);
        }
    });
}

// Utility functions (same as Programmer.js)
function closeModalProperly(modalId) {
    $(modalId).modal('hide');
    setTimeout(() => {
        $('.modal-backdrop').remove();
        $('body').removeClass('modal-open');
        $('body').css({
            'overflow': '',
            'padding-right': ''
        });
        $(modalId).removeClass('show');
    }, 350);
}

function showFieldError(fieldSelector, message) {
    $(fieldSelector).addClass('is-invalid');
    $(fieldSelector).siblings('.invalid-feedback').text(message);
}

function clearValidation(formSelector) {
    $(`${formSelector} .form-control`).removeClass('is-invalid');
    $(`${formSelector} .invalid-feedback`).text('');
}

function setSubmitButtonLoading(loading) {
    const btn = $('#submitBtn');
    const spinner = btn.find('.spinner-border');

    if (loading) {
        btn.prop('disabled', true);
        spinner.removeClass('d-none');
        btn.contents().filter(function () {
            return this.nodeType === 3;
        }).remove();
        btn.append(' Adding...');
    } else {
        btn.prop('disabled', false);
        spinner.addClass('d-none');
        btn.contents().filter(function () {
            return this.nodeType === 3;
        }).remove();
        btn.append('Add Study');
    }
}

function setUpdateButtonLoading(loading) {
    const btn = $('#updateBtn');
    const spinner = btn.find('.spinner-border');

    if (loading) {
        btn.prop('disabled', true);
        spinner.removeClass('d-none');
        btn.contents().filter(function () {
            return this.nodeType === 3;
        }).remove();
        btn.append(' Updating...');
    } else {
        btn.prop('disabled', false);
        spinner.addClass('d-none');
        btn.contents().filter(function () {
            return this.nodeType === 3;
        }).remove();
        btn.append('Update Study');
    }
}

function setDeleteButtonLoading(loading) {
    const btn = $('#confirmDeleteBtn');
    const spinner = btn.find('.spinner-border');

    if (loading) {
        btn.prop('disabled', true);
        spinner.removeClass('d-none');
        btn.contents().filter(function () {
            return this.nodeType === 3;
        }).remove();
        btn.append(' Deleting...');
    } else {
        btn.prop('disabled', false);
        spinner.addClass('d-none');
        btn.contents().filter(function () {
            return this.nodeType === 3;
        }).remove();
        btn.append('Delete Study');
    }
}

function showLoading(show) {
    if (show) {
        $('#loadingState').show();
        $('#studiesTable').hide();
    } else {
        $('#loadingState').hide();
        $('#studiesTable').show();
    }
}

function showAlert(message, type) {
    const alert = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    $('#alertContainer').html(alert);

    if (type === 'success') {
        setTimeout(() => {
            $('.alert').alert('close');
        }, 2500);
    }
}
