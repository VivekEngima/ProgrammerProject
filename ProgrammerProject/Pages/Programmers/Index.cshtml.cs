using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ProgrammerProject.IRepository;
using ProgrammerProject.Models;

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

        public async Task OnGetAsync()
        {
            Programmers = await _repository.GetAllProgrammersAsync();
        }

        public async Task<IActionResult> OnGetProgrammersAsync()
        {
            var programmers = await _repository.GetAllProgrammersAsync();
            return new JsonResult(programmers);
        }

        public async Task<IActionResult> OnPostAddProgrammerAsync()
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Count > 0)
                    .Select(x => new
                    {
                        Field = x.Key,
                        Errors = x.Value.Errors.Select(e => e.ErrorMessage)
                    });

                return new JsonResult(new { success = false, errors });
            }

            try
            {
                var newId = await _repository.AddProgrammerAsync(NewProgrammer);
                return new JsonResult(new { success = true, id = newId });
            }
            catch (Exception ex)
            {
                return new JsonResult(new { success = false, message = ex.Message });
            }
        }
    }
}
