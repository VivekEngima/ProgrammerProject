using System.ComponentModel.DataAnnotations;

namespace ProgrammerProject.Models
{
    public class Programmer
    {
        public int ID { get; set; }

        [Required(ErrorMessage = "Name is required")]
        [StringLength(50, ErrorMessage = "Name cannot exceed 50 characters")]
        public string NAME { get; set; }

        [Required(ErrorMessage = "Date of Birth is required")]
        [DataType(DataType.Date)]
        public DateTime DOB { get; set; }

        [Required(ErrorMessage = "Date of Joining is required")]
        [DataType(DataType.Date)]
        public DateTime DOJ { get; set; }

        [Required(ErrorMessage = "Gender is required")]
        public string SEX { get; set; }

        [StringLength(50)]
        public string PROF1 { get; set; }

        [StringLength(50)]
        public string PROF2 { get; set; }

        [Required(ErrorMessage = "Salary is required")]
        [Range(0, double.MaxValue, ErrorMessage = "Salary must be positive")]
        public decimal SALARY { get; set; }
    }
}
