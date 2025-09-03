using Dapper;
using Microsoft.Data.SqlClient;
using ProgrammerProject.IRepository;
using ProgrammerProject.Models;
using System.Data;


namespace ProgrammerProject.Repository
{
    public class ProgrammerRepository : IProgrammerRepository
    {
        private readonly string _connectionString;

        public ProgrammerRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }
        public async Task<IEnumerable<Programmer>> GetAllProgrammersAsync()
        {
            using var connection = new SqlConnection(_connectionString);
            return await connection.QueryAsync<Programmer>(
                "sp_GetAllProgrammers",
                commandType: CommandType.StoredProcedure);
        }
        public async Task<int> AddProgrammerAsync(Programmer programmer)
        {
            using var connection = new SqlConnection(_connectionString);

            // Duplicate name validation check
            var NameExists = await ProgrammerNameExistsAsync(programmer.NAME);
            if (NameExists) throw new InvalidOperationException($"Another programmer name {NameExists} already exists, Try new name!");

            var parameters = new
            {
                NAME = programmer.NAME,
                DOB = programmer.DOB,
                DOJ = programmer.DOJ,
                SEX = programmer.SEX,
                PROF1 = programmer.PROF1,
                PROF2 = programmer.PROF2,
                SALARY = programmer.SALARY
            };

            var result = await connection.QuerySingleAsync<int>(
                "sp_AddProgrammer",
                parameters,
                commandType: CommandType.StoredProcedure);

            return Convert.ToInt32(result);
        }
        public async Task<Programmer> GetProgrammerByIdAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);
            return await connection.QueryFirstOrDefaultAsync<Programmer>(
                "sp_GetProgrammerById",
                new { ID = id },
                commandType: CommandType.StoredProcedure);
        }
        public async Task<bool> UpdateProgrammerAsync(Programmer programmer)
        {
            using var connection = new SqlConnection(_connectionString);

            var nameExists = await ProgrammerNameExistsAsync(programmer.NAME, programmer.ID);
            if (nameExists) throw new InvalidOperationException($"Another programmer with name '{programmer.NAME}' already exists.");

            var parameters = new
            {
                ID = programmer.ID,
                NAME = programmer.NAME,
                DOB = programmer.DOB,
                DOJ = programmer.DOJ,
                SEX = programmer.SEX,
                PROF1 = programmer.PROF1,
                PROF2 = programmer.PROF2,
                SALARY = programmer.SALARY
            };

            var result = await connection.QuerySingleAsync<int>(
                "sp_UpdateProgrammer",
                parameters,
                commandType: CommandType.StoredProcedure);

            return result > 0;
        }
        public async Task<bool> DeleteProgrammerAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);
            var result = await connection.QuerySingleAsync<int>(
                "sp_DeleteProgrammer",
                new { ID = id },
                commandType: CommandType.StoredProcedure);

            return result > 0;
        }

        public async Task<bool> ProgrammerNameExistsAsync(string name)
        {
            using var connection = new SqlConnection(_connectionString);

            var count = await connection.QueryFirstAsync("SELECT COUNT(1) FROM Programmer WHERE UPPER(NAME) = UPPER(@Name)", new { Name = name });
            return count > 0;
        }

        public async Task<bool> ProgrammerNameExistsAsync(string name, int excludeId)
        {
            using var connection = new SqlConnection(_connectionString);
            var count = await connection.QuerySingleAsync<int>(
                "SELECT COUNT(1) FROM Programmer WHERE UPPER(NAME) = UPPER(@Name) AND ID != @excludeId",
                new { Name = name, ExcludeId = excludeId });

            return count > 0;
        }

        public async Task<IEnumerable<string>> GetAllProgrammersNameAsync()
        {
            using var connection = new SqlConnection(_connectionString);
            return await connection.QueryAsync<string>(
                "SELECT NAME FROM Programmer ORDER BY NAME",
                commandType: CommandType.Text);
        }
    }
}