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

        public StudyRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }
        public async Task<IEnumerable<Study>> GetAllStudiesAsync()
        {
            using var connection = new SqlConnection(_connectionString);
            return await connection.QueryAsync<Study>(
                "sp_GetAllStudies",
                commandType: CommandType.StoredProcedure
                );
        }
        public async Task<Study?> GetStudyByNameAsync(string name)
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
            using var connection = new SqlConnection(_connectionString);
            var parameters = new
            {
                name = study.name,
                splace = study.splace,
                course = study.course,
                ccost = study.ccost
            };

            var result = await connection.QuerySingleAsync<dynamic>(
                "sp_AddStudy",
                parameters,
                commandType: CommandType.StoredProcedure);

            return result.name;
        }

        public async Task<bool> UpdateStudyAsync(Study study)
        {
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
    }
}
