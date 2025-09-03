using ProgrammerProject.Models;

namespace ProgrammerProject.IRepository
{
    public interface IProgrammerRepository
    {
        Task<IEnumerable<Programmer>> GetAllProgrammersAsync();
        Task<Programmer> GetProgrammerByIdAsync(int id);
        Task<int> AddProgrammerAsync(Programmer programmer);
        Task<bool> UpdateProgrammerAsync(Programmer programmer);
        Task<bool> DeleteProgrammerAsync(int id);

        // Validation
        Task<bool> ProgrammerNameExistsAsync(string name);
        Task<bool> ProgrammerNameExistsAsync(string name, int excludeId);
        Task<IEnumerable<string>> GetAllProgrammersNameAsync();
    }
}
