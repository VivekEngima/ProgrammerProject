using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ProgrammerProject.IRepository;
using ProgrammerProject.Models;

namespace ProgrammerProject.Pages.Studies
{
    public class IndexModel : PageModel
    {
        private readonly IStudyRepository _repository;

        public IndexModel(IStudyRepository repository)
        {
            _repository = repository;
        }

        public IEnumerable<Study> Studies { get; set; } = new List<Study>();

        [BindProperty]
        public Study NewStudy { get; set; } = new();

        [BindProperty]
        public Study EditStudy { get; set; } = new();

        public async Task OnGetAsync()
        {
            Studies = await _repository.GetAllStudiesAsync();
        }

        public async Task<IActionResult> OnGetStudiesAsync()
        {
            var studies = await _repository.GetAllStudiesAsync();
            return new JsonResult(studies);
        }

        public async Task<IActionResult> OnGetStudyAsync(string name)
        {
            var study = await _repository.GetStudyByNameAsync(name);
            if (study == null)
            {
                return new JsonResult(new { success = false, message = "Study not found" });
            }
            return new JsonResult(new { success = true, data = study });
        }

        public async Task<IActionResult> OnPostAddStudyAsync(
            string name,
            string splace,
            string course,
            int ccost)
        {
            // Basic validation
            if (string.IsNullOrWhiteSpace(name))
                return new JsonResult(new { success = false, message = "Name is required" });
            if (string.IsNullOrWhiteSpace(splace))
                return new JsonResult(new { success = false, message = "Splace is required" });
            if (string.IsNullOrWhiteSpace(course))
                return new JsonResult(new { success = false, message = "Course is required" });
            if (string.IsNullOrWhiteSpace(course))
                return new JsonResult(new { success = false, message = "Course Cost is required" });
            if (ccost < 0)
                return new JsonResult(new { success = false, message = "Course cost must be positive" });

            var study = new Study
            {
                name = name.Trim(),
                splace = splace.Trim(),
                course = course.Trim(),
                ccost = ccost
            };

            try
            {
                var newName = await _repository.AddStudyAsync(study);
                return new JsonResult(new { success = true, name = newName });
            }
            catch (Exception ex)
            {
                return new JsonResult(new { success = false, message = "Error adding study: " + ex.Message });
            }
        }

        public async Task<IActionResult> OnPostUpdateStudyAsync(
            string name,
            string splace,
            string course,
            int ccost)
        {
            // Basic validation
            if (string.IsNullOrWhiteSpace(name))
                return new JsonResult(new { success = false, message = "Name is required" });
            if (string.IsNullOrWhiteSpace(splace))
                return new JsonResult(new { success = false, message = "Splace is required" });
            if (string.IsNullOrWhiteSpace(course))
                return new JsonResult(new { success = false, message = "Course is required" });
            if (string.IsNullOrWhiteSpace(course))
                return new JsonResult(new { success = false, message = "Course Cost is required" });
            if (ccost < 0)
                return new JsonResult(new { success = false, message = "Course cost must be positive" });

            var study = new Study
            {
                name = name.Trim(),
                splace = splace.Trim(),
                course = course.Trim(),
                ccost = ccost
            };

            var updated = await _repository.UpdateStudyAsync(study);
            if (!updated)
            {
                return new JsonResult(new { success = false, message = "Failed to update study" });
            }

            return new JsonResult(new { success = true });
        }

        public async Task<IActionResult> OnPostDeleteStudyAsync(string name)
        {
            var deleted = await _repository.DeleteStudyAsync(name);
            if (!deleted)
            {
                return new JsonResult(new { success = false, message = "Failed to delete study" });
            }
            return new JsonResult(new { success = true });
        }
    }
}
