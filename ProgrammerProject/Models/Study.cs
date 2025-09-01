using System.ComponentModel.DataAnnotations;

namespace ProgrammerProject.Models
{
    public class Study
    {
        [Key]
        [Required(ErrorMessage = "Select name from list")]
        [StringLength(50, ErrorMessage = "Name cannot exceed 50 characters")]
        public string name { get; set; }

        [Required(ErrorMessage = "Splace is required")]
        [StringLength(50, ErrorMessage = "Study place cannot exceed 50 characters")]
        public string splace { get; set; }

        [Required(ErrorMessage = "Course is required")]
        [StringLength(50, ErrorMessage = "Course cannot exceed 50 characters")]
        public string course { get; set; }

        [Required(ErrorMessage = "ccost is required")]
        [Range(0, int.MaxValue, ErrorMessage = "Course cost must be positive")]
        public int ccost { get; set; }
    }
}
