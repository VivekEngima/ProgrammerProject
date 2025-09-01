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

            return result;
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
    }
}