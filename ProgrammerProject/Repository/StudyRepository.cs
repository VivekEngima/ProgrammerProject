using Dapper;
using Microsoft.Data.SqlClient;
using ProgrammerProject.IRepository;
using ProgrammerProject.Models;
using System.Data;

namespace ProgrammerProject.Repository
{
    public class StudyRepository : IStudyRepository
    {
        private readonly string _connectionString;
        private readonly IProgrammerRepository _programmerRepository;

        public StudyRepository(IConfiguration configuration, IProgrammerRepository programmerRepository)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _programmerRepository = programmerRepository;
        }

        public async Task<IEnumerable<Study>> GetAllStudiesAsync()
        {
            using var connection = new SqlConnection(_connectionString);
            return await connection.QueryAsync<Study>(
                "sp_GetAllStudies",
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<Study> GetStudyByNameAsync(string name)
        {
            using var connection = new SqlConnection(_connectionString);
            return await connection.QueryFirstOrDefaultAsync<Study>(
                "sp_GetStudyByName",
                new { name = name },
                commandType: CommandType.StoredProcedure
            );
        }

        public async Task<string> AddStudyAsync(Study study)
        {
            // Validate that programmer name exists
            var programmerExists = await _programmerRepository.ProgrammerNameExistsAsync(study.name);
            if (!programmerExists)
            {
                throw new InvalidOperationException($"Programmer with name '{study.name}' does not exist. Only existing programmers can have studies.");
            }

            // Validate that no study exists for this name
            var studyExists = await StudyExistsForNameAsync(study.name);
            if (studyExists)
            {
                throw new InvalidOperationException($"A study already exists for programmer '{study.name}'. Only one study per programmer is allowed.");
            }

            using var connection = new SqlConnection(_connectionString);
            var parameters = new
            {
                name = study.name,
                splace = study.splace,
                course = study.course,
                ccost = study.ccost
            };

            var result = await connection.QuerySingleAsync<Study>(
                "sp_AddStudy",
                parameters,
                commandType: CommandType.StoredProcedure);

            return result.name;
        }

        public async Task<bool> UpdateStudyAsync(Study study)
        {
            // Validate that programmer name exists
            var programmerExists = await _programmerRepository.ProgrammerNameExistsAsync(study.name);
            if (!programmerExists)
            {
                throw new InvalidOperationException($"Programmer with name '{study.name}' does not exist.");
            }

            using var connection = new SqlConnection(_connectionString);
            var parameters = new
            {
                name = study.name,
                splace = study.splace,
                course = study.course,
                ccost = study.ccost
            };

            var result = await connection.QuerySingleAsync<int>(
                "sp_UpdateStudy",
                parameters,
                commandType: CommandType.StoredProcedure);

            return result > 0;
        }

        public async Task<bool> DeleteStudyAsync(string name)
        {
            using var connection = new SqlConnection(_connectionString);
            var result = await connection.QuerySingleAsync<int>(
                "sp_DeleteStudy",
                new { name = name },
                commandType: CommandType.StoredProcedure);

            return result > 0;
        }

        public async Task<bool> StudyExistsForNameAsync(string name)
        {
            using var connection = new SqlConnection(_connectionString);
            var count = await connection.QuerySingleAsync<int>(
                "SELECT COUNT(1) FROM sp_GetAllStudies WHERE UPPER(name) = UPPER(@Name)",
                new { Name = name });

            return count > 0;
        }
    }
}
