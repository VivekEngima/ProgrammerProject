using ProgrammerProject.Models;

namespace ProgrammerProject.IRepository
{
    public interface IStudyRepository
    {
        Task<IEnumerable<Study>> GetAllStudiesAsync();
        Task<Study?> GetStudyByNameAsync(string name);
        Task<string> AddStudyAsync(Study study);
        Task<bool> UpdateStudyAsync(Study study);
        Task<bool> DeleteStudyAsync(string name);

        // Validation
        Task<bool> StudyExistsForNameAsync(string name);
    }
}
