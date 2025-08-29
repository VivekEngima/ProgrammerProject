// Programmer Management - AJAX Implementation with Edit/Delete
let currentDeleteId = null;

$(document).ready(function () {
    $('.datepicker').datepicker({
        format: 'dd-mm-yyyy',
        autoclose: true,
        todayHighlight: true
    });

    loadProgrammers();
    initializeForms();
});

// Initialize all form handlers
function initializeForms() {
    // Add form
    $('#addProgrammerForm').on('submit', function (e) {
        e.preventDefault();
        submitProgrammer();
    });

    // Edit form
    $('#editProgrammerForm').on('submit', function (e) {
        e.preventDefault();
        updateProgrammer();
    });

    // Delete confirmation
    $('#confirmDeleteBtn').on('click', function () {
        deleteProgrammer();
    });
}

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

// Display programmers in table with action buttons
function displayProgrammers(programmers) {
    const tbody = $('#programmersTableBody');
    tbody.empty();

    if (programmers.length === 0) {
        tbody.append(`
            <tr>
                <td colspan="9" class="text-center text-muted py-4">
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
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editProgrammer(${programmer.id})" title="Edit">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(${programmer.id}, '${programmer.name}')" title="Delete">
                        <i class="bi bi-trash3"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.append(row);
    });
}

function submitProgrammer() {
    // Get form values directly
    const name = $('#name').val();
    const dob = $('#dob').val();
    const doj = $('#doj').val();
    const sex = $('#sex').val();
    const prof1 = $('#prof1').val();
    const prof2 = $('#prof2').val();
    const salary = $('#salary').val();

    // validation
    clearValidation('#addProgrammerForm');

    // DOB Age validation (must be 18+)
    const dobAge = calculateAge(dob);
    if (dobAge < 18) {
        $('#dob').addClass('is-invalid');
        $('#dob').siblings('.invalid-feedback').text('Programmer must be at least 18 years old');
        return;
    }

    // DOJ Age validation (must be 18+ when joined)
    const dojAge = calculateAge(doj);
    if (dojAge < 18) {
        $('#doj').addClass('is-invalid');
        $('#doj').siblings('.invalid-feedback').text('Programmer must be at least 18 years old when joining');
        return;
    }

    setSubmitButtonLoading(true);

    $.ajax({
        url: '/Programmers?handler=AddProgrammer',
        type: 'POST',
        data: {
            name: name,
            dob: dob,
            doj: doj,
            sex: sex,
            prof1: prof1,
            prof2: prof2,
            salary: salary
        },
        headers: {
            'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
        },
        success: function (response) {
            if (response.success) {
                $('#addProgrammerModal').modal('hide');
                setTimeout(() => {
                    $('.modal-backdrop').remove();
                    $('body').removeClass('modal-open');
                    $('body').css('overflow', '');
                    $('body').css('padding-right', '');
                }, 300);
                $('#addProgrammerForm')[0].reset();
                loadProgrammers();
                showAlert('Programmer added successfully!', 'success');
            } else {
                showAlert('Error: ' + response.message, 'danger');
            }
            setSubmitButtonLoading(false);
        },
        error: function (xhr, status, error) {
            showAlert('Error adding programmer: ' + error, 'danger');
            setSubmitButtonLoading(false);
        }
    });
    $('.modal').removeClass('show');
    $('.modal-backdrop').remove();
    $('body').removeClass('modal-open').removeAttr('style');
}

// Edit programmer and show modal
function editProgrammer(id) {
    $.ajax({
        url: `/Programmers?handler=Programmer&id=${id}`,
        type: 'GET',
        success: function (response) {
            if (response.success) {
                populateEditForm(response.data);
                $('#editProgrammerModal').modal('show');
            } else {
                showAlert('Error loading programmer data: ' + response.message, 'danger');
            }
        },
        error: function (xhr, status, error) {
            showAlert('Error loading programmer: ' + error, 'danger');
        }
    });
}

// Populate edit form with existing data
function populateEditForm(programmer) {
    $('#editId').val(programmer.id);
    $('#editName').val(programmer.name);
    $('#editSex').val(programmer.sex);
    $('#editDob').val(formatDateForInput(programmer.dob));
    $('#editDoj').val(formatDateForInput(programmer.doj));
    $('#editProf1').val(programmer.proF1);
    $('#editProf2').val(programmer.proF2 || '');
    $('#editSalary').val(programmer.salary);
}

// Show delete confirmation modal
function confirmDelete(id, name) {
    currentDeleteId = id;
    $('#deleteProgrammerId').text(id);
    $('#deleteProgrammerName').text(name);
    $('#deleteProgrammerModal').modal('show');
}

// Delete programmer
function deleteProgrammer() {
    if (!currentDeleteId) return;

    setDeleteButtonLoading(true);

    $.ajax({
        url: `/Programmers?handler=DeleteProgrammer&id=${currentDeleteId}`,
        type: 'POST',
        headers: {
            'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
        },
        success: function (response) {
            if (response.success) {
                closeModalProperly('#deleteProgrammerModal')
                loadProgrammers();
                showAlert('Programmer deleted successfully!', 'success');
            } else {
                showAlert('Error deleting programmer: ' + response.message, 'danger');
            }
            setDeleteButtonLoading(false);
            currentDeleteId = null;
        },
        error: function (xhr, status, error) {
            showAlert('Error deleting programmer: ' + error, 'danger');
            setDeleteButtonLoading(false);
        }
    });
}

function closeModalProperly(modalId) {
    $(modalId).modal('hide');

    // Wait for Bootstrap animation to complete, then clean up
    setTimeout(() => {
        // Remove any leftover backdrops
        $('.modal-backdrop').remove();

        // Remove modal-open class and reset body styles
        $('body').removeClass('modal-open');
        $('body').css({
            'overflow': '',
            'padding-right': ''
        });

        // Ensure modal is hidden
        $(modalId).removeClass('show');
    }, 350); // Bootstrap uses 300ms transition, we use 350ms to be safe
}


// Clear form validation
function clearValidation(formSelector) {
    $(`${formSelector} .form-control`).removeClass('is-invalid');
    $(`${formSelector} .invalid-feedback`).text('');
}

// Button loading states
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

function setUpdateButtonLoading(loading) {
    const btn = $('#updateBtn');
    const spinner = btn.find('.spinner-border');

    if (loading) {
        btn.prop('disabled', true);
        spinner.show();
        btn.text(' Updating...');
    } else {
        btn.prop('disabled', false);
        spinner.hide();
        btn.text('Update Programmer');
    }
}

function setDeleteButtonLoading(loading) {
    const btn = $('#confirmDeleteBtn');
    const spinner = btn.find('.spinner-border');

    if (loading) {
        btn.prop('disabled', true);
        spinner.show();
        btn.text(' Deleting...');
    } else {
        btn.prop('disabled', false);
        spinner.hide();
        btn.text('Delete Programmer');
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

function showAlert(message, type) {
    const alert = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;

    $('#alertContainer').html(alert);

    if (type === 'success') {
        setTimeout(() => {
            $('.alert').alert('close');
        }, 3000);
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function formatDateForInput(dateString) {
    const [datePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-');
    return `${day}-${month}-${year}`;
}


function formatNumber(number) {
    return new Intl.NumberFormat().format(number);
}

// Calculate age in years given a dd-mm-yyyy string
function calculateAge(dobString) {
    const [day, month, year] = dobString.split('-').map(Number);
    const dob = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
}

// Enhanced submitProgrammer with age check
function submitProgrammer() {
    const name = $('#name').val();
    const dob = $('#dob').val();
    const doj = $('#doj').val();
    const sex = $('#sex').val();
    const prof1 = $('#prof1').val();
    const prof2 = $('#prof2').val();
    const salary = $('#salary').val();

    clearValidation('#addProgrammerForm');

    // Age validation
    const age = calculateAge(dob);
    if (age < 18) {
        $('#dob').addClass('is-invalid');
        $('#dob').siblings('.invalid-feedback').text('Programmer must be at least 18 years old');
        return;
    }

    setSubmitButtonLoading(true);

    $.ajax({
        url: '/Programmers?handler=AddProgrammer',
        type: 'POST',
        data: { name, dob, doj, sex, prof1, prof2, salary },
        headers: { 'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val() },
        success(response) {
            if (response.success) {
                $('#addProgrammerModal').modal('hide');
                closeModalProperly('#addProgrammerModal')
                $('#addProgrammerForm')[0].reset();
                loadProgrammers();
                showAlert('Programmer added successfully!', 'success');
            } else {
                showAlert('Error: ' + response.message, 'danger');
            }
            setSubmitButtonLoading(false);
        },
        error(xhr, status, error) {
            showAlert('Error adding programmer: ' + error, 'danger');
            setSubmitButtonLoading(false);
        }
    });
}

// Enhanced updateProgrammer with age check
function updateProgrammer() {
    const id = $('#editId').val();
    const name = $('#editName').val();
    const dob = $('#editDob').val();
    const doj = $('#editDoj').val();
    const sex = $('#editSex').val();
    const prof1 = $('#editProf1').val();
    const prof2 = $('#editProf2').val();
    const salary = $('#editSalary').val();



    clearValidation('#editProgrammerForm');

    // DOB Age validation (must be 18+)
    const dobAge = calculateAge(dob);
    if (dobAge < 18) {
        $('#editDob').addClass('is-invalid');
        $('#editDob').siblings('.invalid-feedback').text('Programmer must be at least 18 years old');
        return;
    }

    // DOJ Age validation (must be 18+ when joined)
    const dojAge = calculateAge(doj);
    if (dojAge < 18) {
        $('#editDoj').addClass('is-invalid');
        $('#editDoj').siblings('.invalid-feedback').text('Programmer must be at least 18 years old when joining');
        return;
    }

    setUpdateButtonLoading(true);

    $.ajax({
        url: '/Programmers?handler=UpdateProgrammer',
        type: 'POST',
        data: { id, name, dob, doj, sex, prof1, prof2, salary },
        headers: { 'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val() },
        success(response) {
            if (response.success) {
                closeModalProperly('#editProgrammerModal')
                loadProgrammers();
                showAlert('Programmer updated successfully!', 'success');
            } else {
                showAlert('Error: ' + response.message, 'danger');
            }
            setUpdateButtonLoading(false);
        },
        error(xhr, status, error) {
            showAlert('Error updating programmer: ' + error, 'danger');
            setUpdateButtonLoading(false);
        }
    });
    $('.modal').removeClass('show');
    $('.modal-backdrop').remove();
    $('body').removeClass('modal-open').removeAttr('style');
}
