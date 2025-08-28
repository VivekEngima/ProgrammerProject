using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ProgrammerProject.IRepository;
using ProgrammerProject.Models;
using System.Globalization;

namespace ProgrammerProject.Pages.Programmers
{
    public class IndexModel : PageModel
    {
        private readonly IProgrammerRepository _repository;

        public IndexModel(IProgrammerRepository repository)
        {
            _repository = repository;
        }

        public IEnumerable<Programmer> Programmers { get; set; } = new List<Programmer>();

        [BindProperty]
        public Programmer NewProgrammer { get; set; } = new();

        [BindProperty]
        public Programmer EditProgrammer { get; set; } = new();

        public async Task OnGetAsync()
        {
            Programmers = await _repository.GetAllProgrammersAsync();
        }

        public async Task<IActionResult> OnGetProgrammersAsync()
        {
            var programmers = await _repository.GetAllProgrammersAsync();
            return new JsonResult(programmers);
        }

        public async Task<IActionResult> OnGetProgrammerAsync(int id)
        {
            var programmer = await _repository.GetProgrammerByIdAsync(id);
            if (programmer == null)
            {
                return new JsonResult(new { success = false, message = "Programmer not found" });
            }
            return new JsonResult(new { success = true, data = programmer });
        }

        public async Task<IActionResult> OnPostAddProgrammerAsync(
            string name,
            string dob,
            string doj,
            string sex,
            string prof1,
            string? prof2,
            decimal salary)
        {
            // Parse Date of Birth
            if (!DateTime.TryParseExact(dob, "dd-MM-yyyy", CultureInfo.InvariantCulture,
                                        DateTimeStyles.None, out DateTime dobDt))
            {
                return new JsonResult(new { success = false, message = "Invalid Date of Birth format" });
            }

            // Parse Date of Joining
            if (!DateTime.TryParseExact(doj, "dd-MM-yyyy", CultureInfo.InvariantCulture,
                                        DateTimeStyles.None, out DateTime dojDt))
            {
                return new JsonResult(new { success = false, message = "Invalid Date of Joining format" });
            }

            // Basic validation
            if (string.IsNullOrWhiteSpace(name))
                return new JsonResult(new { success = false, message = "Name is required" });
            if (string.IsNullOrWhiteSpace(sex))
                return new JsonResult(new { success = false, message = "Gender is required" });
            if (string.IsNullOrWhiteSpace(prof1))
                return new JsonResult(new { success = false, message = "Primary Profession is required" });
            if (salary <= 0)
                return new JsonResult(new { success = false, message = "Salary must be greater than zero" });

            var programmer = new Programmer
            {
                NAME = name,
                DOB = dobDt,
                DOJ = dojDt,
                SEX = sex,
                PROF1 = prof1,
                PROF2 = prof2,
                SALARY = salary
            };

            var newId = await _repository.AddProgrammerAsync(programmer);
            return new JsonResult(new { success = true, id = newId });
        }

        public async Task<IActionResult> OnPostUpdateProgrammerAsync(
            int id,
            string name,
            string dob,      // e.g. "31-08-2025"
            string doj,      // e.g. "10-03-2020"
            string sex,
            string prof1,
            string? prof2,
            decimal salary)
        {
            // Parse Date of Birth
            if (!DateTime.TryParseExact(dob, "dd-MM-yyyy", CultureInfo.InvariantCulture,
                                        DateTimeStyles.None, out DateTime dobDt))
            {
                return new JsonResult(new { success = false, message = "Invalid Date of Birth format" });
            }

            // Parse Date of Joining
            if (!DateTime.TryParseExact(doj, "dd-MM-yyyy", CultureInfo.InvariantCulture,
                                        DateTimeStyles.None, out DateTime dojDt))
            {
                return new JsonResult(new { success = false, message = "Invalid Date of Joining format" });
            }

            // Basic validation
            if (string.IsNullOrWhiteSpace(name))
                return new JsonResult(new { success = false, message = "Name is required" });
            if (string.IsNullOrWhiteSpace(sex))
                return new JsonResult(new { success = false, message = "Gender is required" });
            if (string.IsNullOrWhiteSpace(prof1))
                return new JsonResult(new { success = false, message = "Primary Profession is required" });
            if (salary <= 0)
                return new JsonResult(new { success = false, message = "Salary must be greater than zero" });

            var programmer = new Programmer
            {
                ID = id,
                NAME = name,
                DOB = dobDt,
                DOJ = dojDt,
                SEX = sex,
                PROF1 = prof1,
                PROF2 = prof2,
                SALARY = salary
            };

            var updated = await _repository.UpdateProgrammerAsync(programmer);
            if (!updated)
            {
                return new JsonResult(new { success = false, message = "Failed to update programmer" });
            }

            return new JsonResult(new { success = true });
        }

        public async Task<IActionResult> OnPostDeleteProgrammerAsync(int id)
        {
            var deleted = await _repository.DeleteProgrammerAsync(id);
            if (!deleted)
            {
                return new JsonResult(new { success = false, message = "Failed to delete programmer" });
            }
            return new JsonResult(new { success = true });
        }
    }
}
