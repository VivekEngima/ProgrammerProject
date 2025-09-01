// Programmer Management - AJAX Implementation with CRUD
let currentDeleteId = null;

$(document).ready(function () {
    // Initialize datepickers
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

    programmers.forEach((programmer, i) => {
        const row = `
        <tr>
            <td>${i + 1}</td>
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
// Calculate age at a specific date given dd-mm-yyyy strings
function calculateAgeAtDate(dobString, atDateString) {
    if (!dobString || !atDateString) return -1;

    const [dobDay, dobMonth, dobYear] = dobString.split('-').map(Number);
    const [atDay, atMonth, atYear] = atDateString.split('-').map(Number);

    if (isNaN(dobDay) || isNaN(dobMonth) || isNaN(dobYear) ||
        isNaN(atDay) || isNaN(atMonth) || isNaN(atYear)) return -1;

    const dob = new Date(dobYear, dobMonth - 1, dobDay);
    const atDate = new Date(atYear, atMonth - 1, atDay);

    if (isNaN(dob) || isNaN(atDate)) return -1;

    let age = atDate.getFullYear() - dob.getFullYear();
    const monthDiff = atDate.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && atDate.getDate() < dob.getDate())) {
        age--;
    }

    return age;
}
// Calculate current age given a dd-mm-yyyy string
function calculateAge(dobString) {
    if (!dobString) return -1;

    const today = new Date();
    const todayString = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

    return calculateAgeAtDate(dobString, todayString);
}
// Enhanced submitProgrammer with proper validation
function submitProgrammer() {
    const name = $('#name').val().trim();
    const dob = $('#dob').val().trim();
    const doj = $('#doj').val().trim();
    const sex = $('#sex').val();
    const prof1 = $('#prof1').val().trim();
    const prof2 = $('#prof2').val().trim();
    const salary = $('#salary').val().trim();

    clearValidation('#addProgrammerForm');

    // Validate required fields
    if (!name) {
        showFieldError('#name', 'Name is required');
        return;
    }

    if (!dob) {
        showFieldError('#dob', 'Date of Birth is required');
        return;
    }

    if (!doj) {
        showFieldError('#doj', 'Date of Joining is required');
        return;
    }

    if (!sex) {
        showFieldError('#sex', 'Gender is required');
        return;
    }

    if (!salary || parseFloat(salary) <= 0) {
        showFieldError('#salary', 'Valid salary is required');
        return;
    }

    // DOB Age validation (current age must be 18+)
    const currentAge = calculateAge(dob);
    if (currentAge < 18) {
        showFieldError('#dob', 'Programmer must be at least 18 years old');
        return;
    }

    // DOJ Age validation (must be 18+ at time of joining)
    const ageAtJoining = calculateAgeAtDate(dob, doj);
    if (ageAtJoining < 18) {
        showFieldError('#doj', 'Programmer must be at least 18 years old when joining');
        return;
    }

    setSubmitButtonLoading(true);

    $.ajax({
        url: '/Programmers?handler=AddProgrammer',
        type: 'POST',
        data: { name, dob, doj, sex, prof1, prof2, salary },
        headers: { 'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val() },
        success: function (response) {
            if (response.success) {
                closeModalProperly('#addProgrammerModal');
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
}
// Edit programmer - load data and show modal
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
function populateEditForm(programmer) {
    $('#editId').val(programmer.id);
    $('#editName').val(programmer.name);
    $('#editSex').val(programmer.sex);

    // ✅ Convert dates to dd-mm-yyyy

    const dobFormatted = formatDateForInput(programmer.dob);
    const dojFormatted = formatDateForInput(programmer.doj);


    $('#editDob').val(dobFormatted).datepicker('update', dobFormatted);
    $('#editDoj').val(dojFormatted).datepicker('update', dojFormatted);

    $('#editProf1').val(programmer.proF1);
    $('#editProf2').val(programmer.proF2 || '');
    $('#editSalary').val(programmer.salary);
}
function formatDateForInput(dateString) {
    if (!dateString) return '';
    const [datePart] = dateString.split('T');  // take only yyyy-mm-dd
    const [year, month, day] = datePart.split('-');
    return `${day}-${month}-${year}`; // dd-mm-yyyy
}

// Enhanced updateProgrammer with proper validation
function updateProgrammer() {

    const id = $('#editId').val();
    const name = $('#editName').val().trim();
    const dob = $('#editDob').val();
    const doj = $('#editDoj').val();
    const sex = $('#editSex').val();
    const prof1 = $('#editProf1').val().trim();
    const prof2 = $('#editProf2').val().trim();
    const salary = $('#editSalary').val().trim();

    //clearValidation('#editProgrammerForm');

    // Validate required fields
    if (!name) {
        showFieldError('#editName', 'Name is required');
        return;
    }

    if (!dob) {
        showFieldError('#editDob', 'Date of Birth is required');
        return;
    }

    if (!doj) {
        showFieldError('#editDoj', 'Date of Joining is required');
        return;
    }

    if (!sex) {
        showFieldError('#editSex', 'Gender is required');
        return;
    }

    if (!prof1) {
        showFieldError('#editProf1', 'Primary profession is required');
        return;
    }

    if (!salary || parseFloat(salary) <= 0) {
        showFieldError('#editSalary', 'Valid salary is required');
        return;
    }

    // DOB Age validation (current age must be 18+)
    const currentAge = calculateAge(dob);
    if (currentAge < 18) {
        showFieldError('#editDob', 'Programmer must be at least 18 years old');
        return;
    }

    // DOJ Age validation (must be 18+ at time of joining)
    const ageAtJoining = calculateAgeAtDate(dob, doj);
    if (ageAtJoining < 18) {
        showFieldError('#editDoj', 'Programmer must be at least 18 years old when joining');
        return;
    }

    setUpdateButtonLoading(true);

    $.ajax({
        url: '/Programmers?handler=UpdateProgrammer',
        type: 'POST',
        data: { id, name, dob, doj, sex, prof1, prof2, salary },
        headers: { 'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val() },
        success: function (response) {
            if (response.success) {
                closeModalProperly('#editProgrammerModal');
                loadProgrammers();
                showAlert('Programmer updated successfully!', 'success');
            } else {
                showAlert('Error: ' + response.message, 'danger');
            }
            setUpdateButtonLoading(false);
        },
        error: function (xhr, status, error) {
            showAlert('Error updating programmer: ' + error, 'danger');
            setUpdateButtonLoading(false);
        }
    });
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
                closeModalProperly('#deleteProgrammerModal');
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


    setTimeout(() => {

        $('.modal-backdrop').remove();


        $('body').removeClass('modal-open');
        $('body').css({
            'overflow': '',
            'padding-right': ''
        });

        // Ensure modal is hidden
        $(modalId).removeClass('show');
    }, 350);
}
function showFieldError(fieldSelector, message) {
    $(fieldSelector).addClass('is-invalid');
    $(fieldSelector).siblings('.invalid-feedback').text(message);
}
// Clear form validation
function clearValidation(formSelector) {
    $(`${formSelector} .form-control`).removeClass('is-invalid');
    $(`${formSelector} .invalid-feedback`).text('');
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
    const [datePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-');
    return `${day}-${month}-${year}`;
}
function formatDateForInput(dateString) {
    const [datePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-');
    return `${day}-${month}-${year}`;
}
function formatNumber(number) {
    return new Intl.NumberFormat().format(number);
}
